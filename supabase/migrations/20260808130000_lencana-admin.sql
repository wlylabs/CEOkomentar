-- ============================================================
-- Twitter Mini — lencana yang diberikan admin
-- Jalankan setelah 20260808120000_pengikut-resmi.sql. Aman dijalankan ulang.
--
-- Alur "Hubungkan X & verifikasi" dihapus dari aplikasi. Yang menggantikannya
-- bukan pemeriksa lain, melainkan seorang manusia: pemakai memposting kalimat
-- klaim beserta tautan profil X-nya di Twitter Mini, admin membacanya sambil
-- melihat daftar pengikut @CEOkomentar, lalu memberi lencananya sendiri.
--
-- Aturan pokoknya tidak berubah sedikit pun: TIDAK ADA jalan dari peramban
-- untuk menulis ke tabel lencana. Yang berubah hanya siapa yang memutuskan.
-- Fungsi di bawah tetap SECURITY DEFINER milik `service_role`, dan yang
-- memanggilnya adalah Route Handler yang lebih dulu menanyakan keadminan
-- pemanggilnya kepada basis data.
-- ============================================================

-- ============================================================
-- Pintu lama ditutup
--
-- `periksa_misi_x()` hanya pernah dipanggil dari /api/misi/x/kembali, dan rute
-- itu sudah tidak ada. Sebuah fungsi yang bisa menulis lencana tidak dibiarkan
-- hidup tanpa pemanggil.
-- ============================================================

drop function if exists public.periksa_misi_x(uuid, text, text);

-- ============================================================
-- Pemberian dan pencabutan oleh admin
--
-- Mengembalikan daftar lencana sasaran setelah perubahannya, dibaca dari
-- `profiles.lencana` — kolom yang sudah diserasikan pemicu sebelum fungsi ini
-- selesai — supaya pemanggilnya tidak perlu bertanya sekali lagi.
--
-- Kemajuan misi ikut disesuaikan bila lencananya kebetulan hadiah sebuah misi.
-- Tanpa itu kartu misi di aplikasi akan berkata "belum selesai" tepat di sebelah
-- lencana yang sudah menempel di nama pemiliknya.
-- ============================================================

create or replace function public.atur_lencana_admin(
  sasaran uuid,
  kode_lencana text,
  beri boolean
)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  ada boolean;
  kode_misi text;
  hasil text[];
begin
  if kode_lencana !~ '^[a-z0-9-]{3,32}$' then
    raise exception 'lencana % bukan kode yang sah', kode_lencana
      using errcode = '22023';
  end if;

  /*
   * Centang emas bukan hadiah, melainkan cerminan peran: pemicu
   * `profiles_lencana_admin` memasangnya saat `is_admin` menyala dan
   * melepasnya saat padam. Memberikannya satu per satu berarti menaruh tanda
   * "admin yang dapat menghapus komentar siapa pun" pada akun yang tidak bisa
   * melakukannya — dan pemicu yang sama akan mencabutnya lagi pada perubahan
   * `is_admin` berikutnya. Yang mengangkat admin tetap SQL Editor.
   */
  if kode_lencana = 'emas' then
    raise exception 'lencana emas mengikuti peran admin, bukan pemberian'
      using errcode = '42501';
  end if;

  select true into ada from public.profiles where id = sasaran;
  if ada is null then
    raise exception 'akun tidak ditemukan' using errcode = 'P0002';
  end if;

  /* Misi yang hadiahnya lencana ini, bila ada. */
  select kode into kode_misi
    from public.misi
   where lencana = kode_lencana and aktif
   order by urutan
   limit 1;

  if beri then
    if kode_misi is not null then
      perform public.selesaikan_misi(
        sasaran,
        kode_misi,
        jsonb_build_object('oleh', 'admin')
      );
    else
      perform public.beri_lencana(sasaran, kode_lencana, null);
    end if;
  else
    if kode_misi is not null then
      perform public.batalkan_misi(sasaran, kode_misi);
    end if;

    /* `batalkan_misi()` hanya melepas lencana yang berasal dari misi itu;
       yang diberikan langsung tidak punya asal, jadi dihapus di sini. */
    delete from public.lencana_pengguna
      where user_id = sasaran and lencana = kode_lencana;
  end if;

  select lencana into hasil from public.profiles where id = sasaran;
  return coalesce(hasil, '{}'::text[]);
end;
$$;

revoke execute on function public.atur_lencana_admin(uuid, text, boolean)
  from public;
grant execute on function public.atur_lencana_admin(uuid, text, boolean)
  to service_role;
