-- ============================================================
-- Twitter Mini — skema awal
-- Jalankan lewat SQL Editor Supabase atau `supabase db push`.
-- Seluruh berkas aman dijalankan ulang (idempoten).
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Tabel
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null,
  name text not null,
  bio text not null default '',
  location text not null default '',
  avatar_url text,
  banner_url text,
  verified boolean not null default false,
  following_count integer not null default 0,
  followers_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle ~ '^[A-Za-z0-9_]{3,15}$'),
  constraint profiles_name_length check (char_length(btrim(name)) between 1 and 50),
  constraint profiles_bio_length check (char_length(bio) <= 160),
  constraint profiles_location_length check (char_length(location) <= 40)
);

create unique index if not exists profiles_handle_lower_key
  on public.profiles (lower(handle));

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  parent_id uuid,
  body text not null,
  created_at timestamptz not null default now(),
  like_count integer not null default 0,
  repost_count integer not null default 0,
  reply_count integer not null default 0,
  constraint comments_author_id_fkey
    foreign key (author_id) references public.profiles (id) on delete cascade,
  constraint comments_parent_id_fkey
    foreign key (parent_id) references public.comments (id) on delete cascade,
  constraint comments_body_length check (char_length(btrim(body)) between 1 and 280)
);

create index if not exists comments_created_at_idx on public.comments (created_at desc);
create index if not exists comments_author_idx on public.comments (author_id, created_at desc);
create index if not exists comments_parent_idx on public.comments (parent_id);

create table if not exists public.likes (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists likes_user_idx on public.likes (user_id, created_at desc);

create table if not exists public.reposts (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists reposts_user_idx on public.reposts (user_id, created_at desc);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_bukan_diri_sendiri check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);

-- ============================================================
-- Pemicu: penghitung dan stempel waktu
-- ============================================================

create or replace function public.sentuh_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_sentuh_updated_at on public.profiles;
create trigger profiles_sentuh_updated_at
  before update on public.profiles
  for each row execute function public.sentuh_updated_at();

create or replace function public.hitung_balasan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.parent_id is not null then
    update public.comments
      set reply_count = reply_count + 1
      where id = new.parent_id;
  elsif tg_op = 'DELETE' and old.parent_id is not null then
    update public.comments
      set reply_count = greatest(reply_count - 1, 0)
      where id = old.parent_id;
  end if;
  return null;
end;
$$;

drop trigger if exists comments_hitung_balasan on public.comments;
create trigger comments_hitung_balasan
  after insert or delete on public.comments
  for each row execute function public.hitung_balasan();

create or replace function public.hitung_suka()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments
      set like_count = like_count + 1
      where id = new.comment_id;
  else
    update public.comments
      set like_count = greatest(like_count - 1, 0)
      where id = old.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists likes_hitung on public.likes;
create trigger likes_hitung
  after insert or delete on public.likes
  for each row execute function public.hitung_suka();

create or replace function public.hitung_ulang()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments
      set repost_count = repost_count + 1
      where id = new.comment_id;
  else
    update public.comments
      set repost_count = greatest(repost_count - 1, 0)
      where id = old.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists reposts_hitung on public.reposts;
create trigger reposts_hitung
  after insert or delete on public.reposts
  for each row execute function public.hitung_ulang();

create or replace function public.hitung_ikut()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  else
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  end if;
  return null;
end;
$$;

drop trigger if exists follows_hitung on public.follows;
create trigger follows_hitung
  after insert or delete on public.follows
  for each row execute function public.hitung_ikut();

-- ============================================================
-- Profil otomatis untuk setiap pendaftaran
-- ============================================================

/* Menyusun handle yang pasti belum terpakai dari bahan seadanya. */
create or replace function public.handle_unik(bahan text, pemilik uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  bersih text;
  dasar text;
  akhir text;
  urutan integer := 0;
begin
  -- Handle yang diketik pengguna dipakai apa adanya selama sah dan belum ada,
  -- supaya huruf besar pilihannya tidak hilang.
  bersih := substr(regexp_replace(coalesce(bahan, ''), '[^A-Za-z0-9_]', '', 'g'), 1, 15);
  if char_length(bersih) >= 3
     and not exists (select 1 from public.profiles where lower(handle) = lower(bersih))
  then
    return bersih;
  end if;

  dasar := lower(bersih);

  if char_length(dasar) < 3 then
    dasar := dasar || substr(replace(pemilik::text, '-', ''), 1, 6);
  end if;
  dasar := substr(dasar, 1, 15);

  akhir := dasar;
  while exists (select 1 from public.profiles where lower(handle) = akhir) loop
    urutan := urutan + 1;
    akhir := substr(dasar, 1, 15 - char_length(urutan::text)) || urutan::text;
  end loop;

  return akhir;
end;
$$;

create or replace function public.buat_profil_baru()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  handle_baru text;
  nama text;
begin
  handle_baru := public.handle_unik(
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'handle'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'pengguna'
    ),
    new.id
  );

  nama := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');
  nama := substr(coalesce(nama, initcap(replace(handle_baru, '_', ' '))), 1, 50);

  insert into public.profiles (id, handle, name)
  values (new.id, handle_baru, nama)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.buat_profil_baru();

/*
 * Jaring pengaman untuk akun yang dibuat sebelum pemicu di atas terpasang:
 * dipanggil aplikasi ketika profil tidak ditemukan setelah masuk.
 */
create or replace function public.pastikan_profil()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  akun auth.users;
begin
  select * into akun from auth.users where id = auth.uid();
  if akun.id is null then
    raise exception 'tidak ada sesi';
  end if;
  if exists (select 1 from public.profiles where id = akun.id) then
    return;
  end if;

  insert into public.profiles (id, handle, name)
  values (
    akun.id,
    public.handle_unik(
      coalesce(
        nullif(btrim(akun.raw_user_meta_data ->> 'handle'), ''),
        nullif(split_part(coalesce(akun.email, ''), '@', 1), ''),
        'pengguna'
      ),
      akun.id
    ),
    substr(
      coalesce(nullif(btrim(akun.raw_user_meta_data ->> 'name'), ''), 'Pengguna Baru'),
      1, 50
    )
  )
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.pastikan_profil() to authenticated;

-- ============================================================
-- Fungsi bantu untuk aplikasi
-- ============================================================

/* Dipakai form pendaftaran sebelum akun dibuat, jadi harus bisa dipanggil anon. */
create or replace function public.handle_tersedia(handle_baru text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where lower(handle) = lower(btrim(handle_baru))
  );
$$;

revoke execute on function public.handle_tersedia(text) from public;
grant execute on function public.handle_tersedia(text) to anon, authenticated;

/* Ringkasan aktivitas satu akun; mengikuti RLS pemanggil. */
create or replace function public.statistik_pengguna(pengguna uuid)
returns table (
  komentar bigint,
  balasan bigint,
  disukai bigint,
  suka_diterima bigint,
  ulang_diterima bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (select count(*) from public.comments where author_id = pengguna and parent_id is null),
    (select count(*) from public.comments where author_id = pengguna and parent_id is not null),
    (select count(*) from public.likes where user_id = pengguna),
    (select coalesce(sum(like_count), 0) from public.comments where author_id = pengguna),
    (select coalesce(sum(repost_count), 0) from public.comments where author_id = pengguna);
$$;

grant execute on function public.statistik_pengguna(uuid) to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

/*
 * Supabase biasanya memberi hak tabel ke anon/authenticated lewat default
 * privileges, tapi itu bergantung pada peran yang menjalankan migrasi. Hak di
 * bawah ditulis eksplisit supaya hasilnya sama di mana pun berkas ini dijalankan;
 * pembatasan sebenarnya tetap dikerjakan kebijakan RLS setelahnya.
 */
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.profiles, public.comments, public.likes, public.reposts, public.follows
  to authenticated;

alter table public.profiles enable row level security;
alter table public.comments enable row level security;
alter table public.likes    enable row level security;
alter table public.reposts  enable row level security;
alter table public.follows  enable row level security;

drop policy if exists "profil dapat dibaca pengguna masuk" on public.profiles;
create policy "profil dapat dibaca pengguna masuk"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profil sendiri dapat dibuat" on public.profiles;
create policy "profil sendiri dapat dibuat"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profil sendiri dapat diubah" on public.profiles;
create policy "profil sendiri dapat diubah"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "komentar dapat dibaca pengguna masuk" on public.comments;
create policy "komentar dapat dibaca pengguna masuk"
  on public.comments for select
  to authenticated
  using (true);

drop policy if exists "komentar sendiri dapat ditulis" on public.comments;
create policy "komentar sendiri dapat ditulis"
  on public.comments for insert
  to authenticated
  with check (author_id = (select auth.uid()));

drop policy if exists "komentar sendiri dapat disunting" on public.comments;
create policy "komentar sendiri dapat disunting"
  on public.comments for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

drop policy if exists "komentar sendiri dapat dihapus" on public.comments;
create policy "komentar sendiri dapat dihapus"
  on public.comments for delete
  to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists "suka dapat dibaca pengguna masuk" on public.likes;
create policy "suka dapat dibaca pengguna masuk"
  on public.likes for select to authenticated using (true);

drop policy if exists "suka sendiri dapat ditambah" on public.likes;
create policy "suka sendiri dapat ditambah"
  on public.likes for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "suka sendiri dapat dibatalkan" on public.likes;
create policy "suka sendiri dapat dibatalkan"
  on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "ulang dapat dibaca pengguna masuk" on public.reposts;
create policy "ulang dapat dibaca pengguna masuk"
  on public.reposts for select to authenticated using (true);

drop policy if exists "ulang sendiri dapat ditambah" on public.reposts;
create policy "ulang sendiri dapat ditambah"
  on public.reposts for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "ulang sendiri dapat dibatalkan" on public.reposts;
create policy "ulang sendiri dapat dibatalkan"
  on public.reposts for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "ikut dapat dibaca pengguna masuk" on public.follows;
create policy "ikut dapat dibaca pengguna masuk"
  on public.follows for select to authenticated using (true);

drop policy if exists "ikut sendiri dapat ditambah" on public.follows;
create policy "ikut sendiri dapat ditambah"
  on public.follows for insert to authenticated
  with check (follower_id = (select auth.uid()));

drop policy if exists "ikut sendiri dapat dibatalkan" on public.follows;
create policy "ikut sendiri dapat dibatalkan"
  on public.follows for delete to authenticated
  using (follower_id = (select auth.uid()));

-- ============================================================
-- Penyimpanan berkas: foto profil dan sampul
-- Berkas selalu disimpan di folder <uid>/, itulah dasar izinnya.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('banners', 'banners', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media profil dapat dibaca siapa saja" on storage.objects;
create policy "media profil dapat dibaca siapa saja"
  on storage.objects for select
  to public
  using (bucket_id in ('avatars', 'banners'));

drop policy if exists "media profil sendiri dapat diunggah" on storage.objects;
create policy "media profil sendiri dapat diunggah"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "media profil sendiri dapat ditimpa" on storage.objects;
create policy "media profil sendiri dapat ditimpa"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "media profil sendiri dapat dihapus" on storage.objects;
create policy "media profil sendiri dapat dihapus"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('avatars', 'banners')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- Realtime: komentar baru muncul tanpa memuat ulang halaman
-- ============================================================

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'comments'
     )
  then
    alter publication supabase_realtime add table public.comments;
  end if;
end
$$;
