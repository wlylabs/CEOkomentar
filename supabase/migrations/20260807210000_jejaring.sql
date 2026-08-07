-- ============================================================
-- Twitter Mini — simpanan, notifikasi, dan tren
-- Jalankan setelah 20260807180000_pengikut-admin.sql. Aman dijalankan ulang.
--
-- Tiga tambahan yang saling melengkapi tabel yang sudah ada:
--   * bookmarks     — komentar yang disimpan sendiri, tidak terlihat orang lain
--   * notifications — jejak suka, posting ulang, balasan, dan pengikut baru
--   * tren_tagar()  — tagar yang paling ramai dalam 24 jam terakhir
-- ============================================================

-- ============================================================
-- Simpanan
--
-- Umur komentar tetap 24 jam: menyimpan tidak memperpanjangnya. Baris di sini
-- ikut terhapus bersama komentarnya lewat ON DELETE CASCADE, jadi daftar
-- simpanan tidak pernah menunjuk ke komentar yang sudah tidak ada.
-- ============================================================

create table if not exists public.bookmarks (
  comment_id uuid not null references public.comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create index if not exists bookmarks_user_idx
  on public.bookmarks (user_id, created_at desc);

-- ============================================================
-- Notifikasi
--
-- Barisnya hanya ditulis pemicu, tidak pernah oleh aplikasi: seluruh fungsi di
-- bawah SECURITY DEFINER, sehingga tidak ada kebijakan INSERT untuk peran
-- `authenticated` sama sekali. Yang boleh dilakukan pemilik hanya membaca,
-- menandai terbaca, dan menghapus.
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- penerima kabar
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- yang melakukan
  actor_id uuid not null references public.profiles (id) on delete cascade,
  jenis text not null,
  -- komentar yang disukai/diulang, atau balasannya sendiri; null untuk 'ikut'
  comment_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  dibaca_at timestamptz,
  constraint notifications_jenis_sah
    check (jenis in ('suka', 'ulang', 'balas', 'ikut')),
  constraint notifications_bukan_diri_sendiri check (user_id <> actor_id)
);

create index if not exists notifications_penerima_idx
  on public.notifications (user_id, created_at desc);

/* Lencana angka di navigasi menanyakan ini tiap kali daftar dibuka. */
create index if not exists notifications_belum_dibaca_idx
  on public.notifications (user_id)
  where dibaca_at is null;

/* Satu orang tidak perlu dua kabar untuk perbuatan yang sama. Dua indeks
   terpisah karena `comment_id` kosong pada notifikasi 'ikut'. */
create unique index if not exists notifications_sekali_per_komentar
  on public.notifications (actor_id, jenis, comment_id)
  where comment_id is not null;

create unique index if not exists notifications_sekali_per_ikut
  on public.notifications (user_id, actor_id, jenis)
  where comment_id is null;

-- ============================================================
-- Pemicu penulis notifikasi
-- ============================================================

/* Satu pintu masuk untuk semua pemicu di bawah; menyaring kabar untuk diri
   sendiri sekalian. */
create or replace function public.catat_notifikasi(
  penerima uuid,
  pelaku uuid,
  jenis_baru text,
  komentar uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if penerima is null or pelaku is null or penerima = pelaku then
    return;
  end if;

  insert into public.notifications (user_id, actor_id, jenis, comment_id)
  values (penerima, pelaku, jenis_baru, komentar)
  on conflict do nothing;
end;
$$;

revoke execute on function public.catat_notifikasi(uuid, uuid, text, uuid) from public;

/*
 * Membatalkan suka, posting ulang, atau ikut ikut menarik kabarnya. Tanpa ini
 * daftar notifikasi akan penuh jejak perbuatan yang sudah tidak berlaku, dan
 * indeks unik di atas membuat perbuatan yang sama tidak pernah bisa
 * memberitahu dua kali.
 */
create or replace function public.notifikasi_suka()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  penerima uuid;
begin
  if tg_op = 'INSERT' then
    select author_id into penerima from public.comments where id = new.comment_id;
    perform public.catat_notifikasi(penerima, new.user_id, 'suka', new.comment_id);
  else
    delete from public.notifications
      where jenis = 'suka'
        and actor_id = old.user_id
        and comment_id = old.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists likes_notifikasi on public.likes;
create trigger likes_notifikasi
  after insert or delete on public.likes
  for each row execute function public.notifikasi_suka();

create or replace function public.notifikasi_ulang()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  penerima uuid;
begin
  if tg_op = 'INSERT' then
    select author_id into penerima from public.comments where id = new.comment_id;
    perform public.catat_notifikasi(penerima, new.user_id, 'ulang', new.comment_id);
  else
    delete from public.notifications
      where jenis = 'ulang'
        and actor_id = old.user_id
        and comment_id = old.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists reposts_notifikasi on public.reposts;
create trigger reposts_notifikasi
  after insert or delete on public.reposts
  for each row execute function public.notifikasi_ulang();

create or replace function public.notifikasi_ikut()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.catat_notifikasi(new.following_id, new.follower_id, 'ikut', null);
  else
    delete from public.notifications
      where jenis = 'ikut'
        and user_id = old.following_id
        and actor_id = old.follower_id;
  end if;
  return null;
end;
$$;

drop trigger if exists follows_notifikasi on public.follows;
create trigger follows_notifikasi
  after insert or delete on public.follows
  for each row execute function public.notifikasi_ikut();

/*
 * Balasan memakai id balasannya sendiri, bukan id komentar induk, supaya
 * menekan kabarnya membuka balasan itu di dalam utas. Penghapusan tidak perlu
 * ditangani: baris notifikasi ikut terbawa ON DELETE CASCADE.
 */
create or replace function public.notifikasi_balas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  penerima uuid;
begin
  if new.parent_id is null then
    return null;
  end if;

  select author_id into penerima from public.comments where id = new.parent_id;
  perform public.catat_notifikasi(penerima, new.author_id, 'balas', new.id);
  return null;
end;
$$;

drop trigger if exists comments_notifikasi on public.comments;
create trigger comments_notifikasi
  after insert on public.comments
  for each row execute function public.notifikasi_balas();

/*
 * Kebijakan UPDATE di bawah mengizinkan pemilik menyentuh barisnya sendiri, dan
 * itu berarti seluruh kolomnya. Pemicu ini mengembalikan semuanya ke nilai lama
 * kecuali `dibaca_at`, jadi satu-satunya perubahan yang benar-benar bisa datang
 * dari peramban adalah "tandai terbaca".
 */
create or replace function public.jaga_notifikasi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  new.user_id := old.user_id;
  new.actor_id := old.actor_id;
  new.jenis := old.jenis;
  new.comment_id := old.comment_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists notifications_jaga on public.notifications;
create trigger notifications_jaga
  before update on public.notifications
  for each row execute function public.jaga_notifikasi();

-- ============================================================
-- Tren
--
-- Tagar dikumpulkan langsung dari komentar yang masih hidup, jadi tidak ada
-- tabel yang perlu dijaga tetap sinkron. Fungsinya SECURITY INVOKER: kebijakan
-- SELECT pada `comments` yang memutuskan komentar mana yang boleh dihitung, dan
-- kebijakan itu sudah membatasi diri pada 24 jam terakhir.
-- ============================================================

create or replace function public.tren_tagar(batas integer default 6)
returns table (tagar text, komentar bigint, penulis bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    -- Ejaan yang paling sering dipakai orang untuk tagar yang sama.
    mode() within group (order by cocok.bagian[1]) as tagar,
    count(distinct c.id) as komentar,
    count(distinct c.author_id) as penulis
  from public.comments c
  cross join lateral regexp_matches(
    c.body,
    -- Tanda pagar harus mengawali kata, jadi "c#" atau "##" tidak ikut terhitung.
    '(?<![[:alnum:]_#])#([[:alnum:]_]{2,30})',
    'g'
  ) as cocok(bagian)
  where c.created_at > now() - public.masa_komentar()
  group by lower(cocok.bagian[1])
  order by komentar desc, penulis desc, lower(cocok.bagian[1])
  limit greatest(1, least(coalesce(batas, 6), 20));
$$;

grant execute on function public.tren_tagar(integer) to authenticated;

-- ============================================================
-- Penyapu notifikasi lama
--
-- Kabar 'ikut' tidak punya komentar yang membawanya pergi, jadi hanya jenis itu
-- yang benar-benar menumpuk. Dijadwalkan bila pg_cron tersedia; kalau tidak,
-- tabelnya tetap benar, hanya tumbuh perlahan.
-- ============================================================

create or replace function public.sapu_notifikasi_lama(umur interval default interval '30 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  terhapus integer;
begin
  delete from public.notifications where created_at <= now() - umur;
  get diagnostics terhapus = row_count;
  return terhapus;
end;
$$;

revoke execute on function public.sapu_notifikasi_lama(interval) from public;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'sapu-notifikasi-lama') then
      perform cron.unschedule('sapu-notifikasi-lama');
    end if;

    perform cron.schedule(
      'sapu-notifikasi-lama',
      '15 3 * * *',
      'select public.sapu_notifikasi_lama()'
    );
  end if;
end
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

grant select, insert, delete on public.bookmarks to authenticated;
grant select, update, delete on public.notifications to authenticated;

alter table public.bookmarks     enable row level security;
alter table public.notifications enable row level security;

/* Simpanan bersifat pribadi — tidak seperti suka, tidak ada yang boleh tahu
   komentar apa yang kamu simpan. */
drop policy if exists "simpanan sendiri dapat dibaca" on public.bookmarks;
create policy "simpanan sendiri dapat dibaca"
  on public.bookmarks for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "simpanan sendiri dapat ditambah" on public.bookmarks;
create policy "simpanan sendiri dapat ditambah"
  on public.bookmarks for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "simpanan sendiri dapat dibuang" on public.bookmarks;
create policy "simpanan sendiri dapat dibuang"
  on public.bookmarks for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "notifikasi sendiri dapat dibaca" on public.notifications;
create policy "notifikasi sendiri dapat dibaca"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "notifikasi sendiri dapat ditandai" on public.notifications;
create policy "notifikasi sendiri dapat ditandai"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "notifikasi sendiri dapat dihapus" on public.notifications;
create policy "notifikasi sendiri dapat dihapus"
  on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- ============================================================
-- Realtime: lencana notifikasi menyala tanpa memuat ulang halaman
-- ============================================================

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'notifications'
     )
  then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
