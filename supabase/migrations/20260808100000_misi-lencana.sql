-- ============================================================
-- Twitter Mini — misi dan lencana
-- Jalankan setelah 20260808090000_tanpa-simpanan.sql. Aman dijalankan ulang.
--
-- Lencana tidak lagi cuma dua keadaan yang menempel di kolom `verified` dan
-- `is_admin`. Sekarang ada katalog misi, catatan siapa sudah menyelesaikan apa,
-- dan daftar lencana per akun yang bisa tumbuh tanpa mengubah skema lagi:
--
--   misi             — katalog misi beserta lencana yang dihadiahkannya
--   misi_pengguna    — kemajuan tiap akun atas tiap misi
--   lencana_pengguna — lencana yang sudah dimiliki, beserta misi asalnya
--   akun_x           — ikatan satu akun X ke satu akun aplikasi
--   profiles.lencana — cerminan datar dari lencana_pengguna, supaya feed cukup
--                      membaca satu kolom dan tidak perlu kueri tambahan
--
-- Aturan pokoknya satu: TIDAK ADA jalan dari peramban untuk memberi lencana
-- kepada diri sendiri. Ketiga tabel di atas hanya bisa dibaca pemiliknya, dan
-- yang menulis hanya fungsi SECURITY DEFINER di bawah — yang haknya sengaja
-- dicabut dari `public` lalu diberikan kepada `service_role` saja. Peran itu
-- hanya dipegang Route Handler di server, tidak pernah dikirim ke peramban.
-- ============================================================

-- ============================================================
-- Mode sistem
--
-- Beberapa kolom profil hanya boleh berubah lewat pemicu bawaan (penghitung
-- pengikut, penyerasi lencana), bukan lewat UPDATE dari sesi pengguna. Penjaga
-- kolom istimewa membedakan keduanya lewat tanda transaksi ini: yang dipasang
-- fungsi tepercaya sebelum menyentuh `profiles`, dan tidak bisa dipasang dari
-- PostgREST karena `set_config` tidak berada di skema yang dipaparkan.
-- ============================================================

create or replace function public.mode_sistem()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('app.sistem', true), '') = 'ya';
$$;

revoke execute on function public.mode_sistem() from public;
grant execute on function public.mode_sistem() to authenticated, service_role;

-- ============================================================
-- Kolom cerminan di profil
-- ============================================================

alter table public.profiles
  add column if not exists lencana text[] not null default '{}'::text[];

comment on column public.profiles.lencana is
  'cerminan lencana_pengguna; ditulis hanya oleh public.serasikan_lencana()';

-- ============================================================
-- Penjaga kolom istimewa
--
-- Versi di 20260807180000_pengikut-admin.sql mengunci `is_admin` dan `verified`
-- untuk setiap UPDATE yang datang dari sesi pengguna. Kolom `lencana` ikut
-- dikunci sekarang, dan pemicu tepercaya diberi jalan keluar lewat mode sistem
-- supaya penyerasi di bawah tetap bisa menulisnya.
-- ============================================================

create or replace function public.jaga_kolom_istimewa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.mode_sistem() then
    return new;
  end if;

  new.is_admin := old.is_admin;
  new.verified := old.verified;
  new.lencana := old.lencana;

  if new.is_admin then
    new.followers_count := greatest(
      new.followers_count,
      public.penduduk_indonesia()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_jaga_kolom_istimewa on public.profiles;
create trigger profiles_jaga_kolom_istimewa
  before update on public.profiles
  for each row execute function public.jaga_kolom_istimewa();

-- ============================================================
-- Katalog misi
-- ============================================================

create table if not exists public.misi (
  kode text primary key,
  /* lencana yang dihadiahkan bila misinya selesai */
  lencana text not null,
  urutan integer not null default 0,
  aktif boolean not null default true,
  constraint misi_kode_format check (kode ~ '^[a-z0-9-]{3,32}$'),
  constraint misi_lencana_format check (lencana ~ '^[a-z0-9-]{3,32}$')
);

comment on table public.misi is
  'katalog misi; menambah misi baru cukup satu baris di sini plus pemeriksanya di aplikasi';

/*
 * Misi pertama: mengikuti akun resmi @gaptekcat di X, hadiahnya centang biru.
 * Pemeriksanya ada di app/api/misi/x/ — aplikasi yang menanyakan ke X apakah
 * akun itu benar-benar diikuti, basis data hanya mencatat hasilnya.
 */
insert into public.misi (kode, lencana, urutan, aktif)
values ('ikuti-x', 'biru', 1, true)
on conflict (kode) do update
  set lencana = excluded.lencana,
      urutan = excluded.urutan,
      aktif = excluded.aktif;

-- ============================================================
-- Kemajuan dan lencana per akun
-- ============================================================

create table if not exists public.misi_pengguna (
  user_id uuid not null references public.profiles (id) on delete cascade,
  misi text not null references public.misi (kode) on delete cascade,
  status text not null,
  /* keterangan secukupnya untuk ditampilkan lagi, misalnya username X-nya */
  bukti jsonb not null default '{}'::jsonb,
  dibuat_at timestamptz not null default now(),
  selesai_at timestamptz,
  primary key (user_id, misi),
  constraint misi_pengguna_status_sah check (status in ('menunggu', 'selesai'))
);

create index if not exists misi_pengguna_misi_idx on public.misi_pengguna (misi);

create table if not exists public.lencana_pengguna (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lencana text not null,
  /* misi yang menghadiahkannya; null untuk lencana yang melekat pada peran */
  misi text references public.misi (kode) on delete set null,
  diberikan_at timestamptz not null default now(),
  primary key (user_id, lencana),
  constraint lencana_pengguna_format check (lencana ~ '^[a-z0-9-]{3,32}$')
);

/*
 * Satu akun X hanya pernah menjadi bukti untuk satu akun aplikasi, selamanya.
 * Tanpa ikatan ini satu orang bisa mengikuti @gaptekcat sekali lalu memakai
 * pengikutan yang sama untuk memberi centang pada berapa pun akun yang ia buat.
 * Barisnya sengaja tidak pernah dihapus saat lencananya dicabut.
 */
create table if not exists public.akun_x (
  x_user_id text primary key,
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  username text not null,
  terhubung_at timestamptz not null default now(),
  diperiksa_at timestamptz not null default now(),
  constraint akun_x_username_format check (username ~ '^[A-Za-z0-9_]{1,15}$')
);

-- ============================================================
-- Penyerasi: lencana_pengguna → profiles.lencana
-- ============================================================

create or replace function public.serasikan_lencana(pengguna uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  daftar text[];
  admin boolean;
begin
  select coalesce(array_agg(lencana order by lencana), '{}'::text[])
    into daftar
    from public.lencana_pengguna
   where user_id = pengguna;

  select is_admin into admin from public.profiles where id = pengguna;
  if admin is null then
    return;
  end if;

  /* Kolom `verified` tetap dipelihara karena seluruh antarmuka lama membacanya;
     sekarang ia sekadar jawaban atas "punya centang biru atau tidak". */
  perform set_config('app.sistem', 'ya', true);
  update public.profiles
     set lencana = daftar,
         verified = ('biru' = any (daftar)) or admin
   where id = pengguna;
  perform set_config('app.sistem', '', true);
end;
$$;

revoke execute on function public.serasikan_lencana(uuid) from public;

create or replace function public.sentuh_lencana()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.serasikan_lencana(coalesce(new.user_id, old.user_id));
  return null;
end;
$$;

drop trigger if exists lencana_pengguna_serasikan on public.lencana_pengguna;
create trigger lencana_pengguna_serasikan
  after insert or update or delete on public.lencana_pengguna
  for each row execute function public.sentuh_lencana();

/* Centang emas melekat pada peran admin, bukan pada misi apa pun. */
create or replace function public.lencana_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin then
    insert into public.lencana_pengguna (user_id, lencana)
    values (new.id, 'emas')
    on conflict (user_id, lencana) do nothing;
  else
    delete from public.lencana_pengguna
      where user_id = new.id and lencana = 'emas';
  end if;
  return null;
end;
$$;

drop trigger if exists profiles_lencana_admin on public.profiles;
create trigger profiles_lencana_admin
  after insert or update of is_admin on public.profiles
  for each row execute function public.lencana_admin();

-- ============================================================
-- Pemberian dan pencabutan
--
-- Seluruh fungsi di bawah hanya boleh dipanggil `service_role`. PostgreSQL
-- memberi EXECUTE kepada PUBLIC untuk setiap fungsi baru, jadi pencabutannya
-- ditulis eksplisit — tanpa itu peramban bisa memanggilnya lewat PostgREST.
-- ============================================================

create or replace function public.beri_lencana(
  pengguna uuid,
  kode_lencana text,
  asal_misi text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.lencana_pengguna (user_id, lencana, misi)
  values (pengguna, kode_lencana, asal_misi)
  on conflict (user_id, lencana) do nothing;
$$;

create or replace function public.selesaikan_misi(
  pengguna uuid,
  kode_misi text,
  bukti_baru jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  hadiah text;
begin
  select lencana into hadiah from public.misi where kode = kode_misi and aktif;
  if hadiah is null then
    raise exception 'misi % tidak dikenal atau sedang tidak aktif', kode_misi;
  end if;

  insert into public.misi_pengguna (user_id, misi, status, bukti, selesai_at)
  values (pengguna, kode_misi, 'selesai', coalesce(bukti_baru, '{}'::jsonb), now())
  on conflict (user_id, misi) do update
    set status = 'selesai',
        bukti = coalesce(excluded.bukti, misi_pengguna.bukti),
        selesai_at = now();

  perform public.beri_lencana(pengguna, hadiah, kode_misi);
end;
$$;

/*
 * Kebalikannya, dipakai ketika pemeriksaan ulang menemukan syaratnya sudah
 * tidak dipenuhi lagi — misalnya akun @gaptekcat berhenti diikuti.
 */
create or replace function public.batalkan_misi(pengguna uuid, kode_misi text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  hadiah text;
begin
  select lencana into hadiah from public.misi where kode = kode_misi;

  delete from public.misi_pengguna
    where user_id = pengguna and misi = kode_misi;

  if hadiah is not null then
    delete from public.lencana_pengguna
      where user_id = pengguna and lencana = hadiah and misi = kode_misi;
  end if;
end;
$$;

/*
 * Misi "ikuti-x" punya satu langkah tambahan yang tidak dimiliki misi lain:
 * mengikat akun X-nya. Ikatan itu permanen supaya satu pengikutan tidak bisa
 * dipakai berulang kali oleh akun-akun baru.
 *
 * Nilai yang dikembalikan:
 *   'berhasil' — lencana baru saja diberikan
 *   'sudah'    — sudah dimiliki sebelumnya; pemeriksaan ulang menguatkannya
 *   'terpakai' — akun X itu sudah menjadi bukti milik akun aplikasi lain
 *   'lain'     — akun aplikasi ini sudah terikat ke akun X yang berbeda
 */
create or replace function public.selesaikan_misi_x(
  pengguna uuid,
  x_id text,
  x_username text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  pemilik uuid;
  terikat text;
  lama boolean;
begin
  select user_id into pemilik from public.akun_x where x_user_id = x_id;
  if pemilik is not null and pemilik <> pengguna then
    return 'terpakai';
  end if;

  select x_user_id into terikat from public.akun_x where user_id = pengguna;
  if terikat is not null and terikat <> x_id then
    return 'lain';
  end if;

  select exists (
    select 1 from public.misi_pengguna
     where user_id = pengguna and misi = 'ikuti-x' and status = 'selesai'
  ) into lama;

  insert into public.akun_x (x_user_id, user_id, username)
  values (x_id, pengguna, x_username)
  on conflict (x_user_id) do update
    set username = excluded.username,
        diperiksa_at = now();

  perform public.selesaikan_misi(
    pengguna,
    'ikuti-x',
    jsonb_build_object('x_username', x_username)
  );

  return case when lama then 'sudah' else 'berhasil' end;
end;
$$;

do $$
declare
  tanda_tangan text;
begin
  foreach tanda_tangan in array array[
    'public.beri_lencana(uuid, text, text)',
    'public.selesaikan_misi(uuid, text, jsonb)',
    'public.batalkan_misi(uuid, text)',
    'public.selesaikan_misi_x(uuid, text, text)',
    'public.sentuh_lencana()',
    'public.lencana_admin()'
  ] loop
    execute format('revoke execute on function %s from public', tanda_tangan);
    execute format('grant execute on function %s to service_role', tanda_tangan);
  end loop;
end
$$;

-- ============================================================
-- Row Level Security
--
-- Tidak ada satu pun kebijakan INSERT, UPDATE, atau DELETE untuk peran
-- `authenticated` di ketiga tabel ini: kemajuan misi dan lencana hanya boleh
-- lahir dari fungsi di atas. Hak tabelnya pun cuma SELECT.
-- ============================================================

grant select on public.misi, public.misi_pengguna, public.lencana_pengguna
  to authenticated;

/* Ikatan akun X memuat identitas di layanan lain; peramban tidak berkepentingan
   membacanya sama sekali, cukup aplikasi di server. */
revoke all on public.akun_x from anon, authenticated;

alter table public.misi             enable row level security;
alter table public.misi_pengguna    enable row level security;
alter table public.lencana_pengguna enable row level security;
alter table public.akun_x           enable row level security;

drop policy if exists "misi aktif dapat dibaca" on public.misi;
create policy "misi aktif dapat dibaca"
  on public.misi for select to authenticated
  using (aktif);

drop policy if exists "kemajuan misi sendiri dapat dibaca" on public.misi_pengguna;
create policy "kemajuan misi sendiri dapat dibaca"
  on public.misi_pengguna for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "lencana sendiri dapat dibaca" on public.lencana_pengguna;
create policy "lencana sendiri dapat dibaca"
  on public.lencana_pengguna for select to authenticated
  using (user_id = (select auth.uid()));

/* Tanpa satu pun kebijakan, RLS menolak semua akses dari peran biasa. Baris di
   bawah ada supaya niat itu tertulis, bukan tersirat. */
drop policy if exists "akun x tidak dapat dibaca siapa pun" on public.akun_x;

-- ============================================================
-- Akun yang sudah ada
-- ============================================================

insert into public.lencana_pengguna (user_id, lencana)
select id, 'emas' from public.profiles where is_admin
on conflict (user_id, lencana) do nothing;

/* Centang biru yang sudah telanjur menempel sebelum ada misinya tetap diakui,
   tapi sejak sekarang ia punya barisnya sendiri seperti lencana lain. */
insert into public.lencana_pengguna (user_id, lencana)
select id, 'biru' from public.profiles where verified and not is_admin
on conflict (user_id, lencana) do nothing;

select public.serasikan_lencana(id) from public.profiles;
