-- ============================================================
-- Twitter Mini — handle admin berpindah ke @gaptekcat
-- Jalankan setelah 20260808150000_kabar-misi.sql. Aman dijalankan ulang.
--
-- Akun resmi berganti nama: @CEOkomentar menjadi @gaptekcat — sama dengan akun
-- X yang diikuti misi centang biru (`AKUN_X` di lib/misi.ts). Yang berpindah
-- hanya handle-nya; akunnya tetap akun yang itu juga, beserta komentar,
-- pengikut, dan lencananya.
--
-- Dua langkah, dan keduanya perlu:
--
--   1. `public.handle_admin()` menyebut handle baru. Ia yang dibaca pemicu
--      pengangkatan saat profil dibuat dan penjaga handle cadangan di
--      `jaga_kolom_istimewa()`, jadi tanpa langkah ini @gaptekcat yang baru
--      didaftarkan tidak akan diangkat dan @CEOkomentar tetap terkunci.
--
--   2. Baris profil yang sudah ada ikut berganti handle. Pemicu pengangkatan
--      sengaja hanya berjalan pada INSERT — handle yang berpindah tangan tidak
--      membawa haknya — sehingga mengganti daftar di langkah pertama saja tidak
--      menyentuh akun yang sudah terdaftar sama sekali.
--
-- Bila tidak ada admin ber-handle lama — basis data yang profilnya masih
-- kosong, atau yang perpindahannya sudah dikerjakan — langkah kedua tidak
-- mengerjakan apa pun, dan berkas ini tetap aman dijalankan ulang.
-- ============================================================

create or replace function public.handle_admin()
returns text[]
language sql
immutable
parallel safe
as $$
  select array['gaptekcat']::text[];
$$;

grant execute on function public.handle_admin() to authenticated;

-- ============================================================
-- Perpindahan handle akun resmi
-- ============================================================

/*
 * Yang dicari adalah pemegang handle lama yang memang admin, bukan siapa pun
 * yang kebetulan memakainya: begitu perpindahan ini selesai, @CEOkomentar
 * menjadi handle biasa yang boleh diambil orang lain, dan orang itu tidak
 * sedang menunggu diangkat. Karena itu pula berkas ini berhenti lebih dulu bila
 * handle barunya sudah dipegang admin — perpindahannya sudah terjadi.
 *
 * `verified` dan lantai pengikut ikut ditegaskan di sini, bukan dipercayakan
 * kepada pemicu: yang berjalan saat handle berubah hanyalah
 * `jaga_kolom_istimewa()`, dan ia menjaga, bukan mengangkat. Perintah ini
 * datang dari migrasi — tanpa auth.uid() — jadi penjaga itu membiarkannya lewat
 * dan larangan mengambil handle cadangan tidak berlaku untuknya.
 *
 * Satu keadaan dihentikan dengan galat: handle baru sudah dipakai akun lain
 * sementara admin lama masih memegang handle lamanya. Mendiamkannya menyisakan
 * basis data yang daftar adminnya menunjuk handle milik orang lain, dan itu
 * harus diputuskan manusia, bukan diwarisi diam-diam.
 */
do $$
declare
  akun_resmi uuid;
  pemegang uuid;
begin
  if exists (
    select 1
      from public.profiles
     where lower(handle) = lower('gaptekcat')
       and is_admin
  ) then
    return;
  end if;

  select id into akun_resmi
    from public.profiles
   where lower(handle) = lower('CEOkomentar')
     and is_admin;

  if akun_resmi is null then
    return;
  end if;

  select id into pemegang
    from public.profiles
   where lower(handle) = lower('gaptekcat');

  if pemegang is not null then
    raise exception
      'handle @gaptekcat sudah dipakai akun lain; pindahkan akun itu lebih dulu'
      using errcode = '42501';
  end if;

  update public.profiles
     set handle = 'gaptekcat',
         verified = true,
         followers_count = greatest(
           followers_count,
           public.penduduk_indonesia()
         )
   where id = akun_resmi;
end
$$;

-- ============================================================
-- Keterangan tabel yang menyebut handle lama
--
-- `comment on table` di 20260808120000_pengikut-resmi.sql sudah ikut diperbarui
-- di berkasnya, tapi berkas itu tidak dijalankan lagi pada basis data yang
-- sudah dimigrasi. Diulang di sini supaya keduanya berkata sama.
-- ============================================================

comment on table public.pengikut_resmi is
  'pengikut @gaptekcat hasil penyegaran terakhir; hanya ditulis public.ganti_pengikut_resmi()';
