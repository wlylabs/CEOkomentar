-- ============================================================
-- Twitter Mini — pengikut akun resmi
-- Jalankan setelah 20260807150000_admin.sql. Aman dijalankan ulang.
--
-- Akun resmi @CEOkomentar diikuti seluruh penduduk Indonesia: jumlah
-- pengikutnya disamakan dengan angka penduduk dari Badan Pusat Statistik.
-- Angka itu jadi lantai, bukan nilai mati — kalau ada yang benar-benar
-- mengikuti akun ini lewat tabel `follows`, hitungannya tetap bertambah
-- di atas lantai tadi.
-- ============================================================

/*
 * Satu tempat untuk angkanya, dipakai pemicu dan backfill di bawah. Nilainya
 * harus sama dengan PENDUDUK_INDONESIA di lib/kebijakan.ts.
 *
 * Sumber: Badan Pusat Statistik, proyeksi penduduk pertengahan tahun 2025.
 */
create or replace function public.penduduk_indonesia()
returns integer
language sql
immutable
parallel safe
as $$
  select 284438782;
$$;

grant execute on function public.penduduk_indonesia() to anon, authenticated;

-- ============================================================
-- Pengangkatan admin ikut membawa jumlah pengikutnya
-- ============================================================

/*
 * Sama seperti versi di 20260807150000_admin.sql, dengan satu tambahan:
 * profil admin yang baru dibuat langsung memulai dari angka penduduk. Dengan
 * begitu akun @CEOkomentar yang didaftarkan setelah migrasi ini jalan tidak
 * perlu disentuh manual.
 */
create or replace function public.tandai_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.apakah_handle_admin(new.handle) then
    new.is_admin := true;
    new.verified := true;
    new.followers_count := greatest(
      new.followers_count,
      public.penduduk_indonesia()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_tandai_admin on public.profiles;
create trigger profiles_tandai_admin
  before insert on public.profiles
  for each row execute function public.tandai_admin();

/*
 * Penjaga kolom istimewa, dengan lantai pengikut admin ikut dipertahankan.
 *
 * `followers_count` sengaja tidak dikunci ke nilai lama seperti `is_admin` dan
 * `verified`: pemicu `follows_hitung` menaikkannya dari sesi pengguna biasa,
 * dan penguncian akan membuat pengikut sungguhan berhenti terhitung. Yang
 * dijaga hanya batas bawahnya.
 */
create or replace function public.jaga_kolom_istimewa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  new.is_admin := old.is_admin;
  new.verified := old.verified;
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

/* Akun admin yang sudah ada sebelum berkas ini dijalankan. */
update public.profiles
  set followers_count = public.penduduk_indonesia()
  where is_admin
    and followers_count < public.penduduk_indonesia();
