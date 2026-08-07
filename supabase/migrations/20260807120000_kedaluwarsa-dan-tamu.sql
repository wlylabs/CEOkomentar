-- ============================================================
-- Twitter Mini — komentar berumur 24 jam dan akun tamu
-- Jalankan setelah 20260807090000_awal.sql. Aman dijalankan ulang.
-- ============================================================

-- ============================================================
-- Umur komentar
--
-- Nilainya ditaruh di satu fungsi supaya kebijakan RLS, penyapu berkala, dan
-- dokumentasi tidak pernah berbeda. Mengubah masa simpan cukup di sini —
-- jangan lupa menyamakan MASA_KOMENTAR_JAM di lib/kebijakan.ts.
-- ============================================================

create or replace function public.masa_komentar()
returns interval
language sql
immutable
parallel safe
as $$
  select interval '24 hours';
$$;

grant execute on function public.masa_komentar() to anon, authenticated;

/*
 * Jendela waktu ditaruh di kebijakan SELECT, bukan hanya di penyapu berkala.
 * Dengan begitu komentar yang lewat 24 jam langsung tidak terbaca siapa pun,
 * bahkan bila pg_cron mati atau tidak tersedia.
 */
drop policy if exists "komentar dapat dibaca pengguna masuk" on public.comments;
create policy "komentar dapat dibaca pengguna masuk"
  on public.comments for select
  to authenticated
  using (created_at > now() - public.masa_komentar());

/* Penyapu sesungguhnya: membuang barisnya, bukan sekadar menyembunyikan. */
create or replace function public.sapu_komentar_kedaluwarsa()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  terhapus integer;
begin
  -- Menghapus komentar induk ikut menyapu balasannya lewat ON DELETE CASCADE,
  -- termasuk balasan yang usianya belum 24 jam. Aturannya sama persis dengan
  -- penghapusan manual di aplikasi ("beserta seluruh balasannya"), dan karena
  -- penyapu berjalan tiap 10 menit, balasan yatim paling lama terlihat selama
  -- itu. Angka yang dikembalikan hanya menghitung baris yang disentuh langsung.
  delete from public.comments
    where created_at <= now() - public.masa_komentar();
  get diagnostics terhapus = row_count;
  return terhapus;
end;
$$;

revoke execute on function public.sapu_komentar_kedaluwarsa() from public;

-- ============================================================
-- Penjadwalan pg_cron
--
-- Bila ekstensinya tidak bisa dipasang (paket Supabase tertentu atau peran
-- yang kurang hak), migrasi tetap lanjut: kebijakan RLS di atas sudah menjamin
-- komentar lama tidak terlihat, hanya barisnya yang menumpuk.
-- ============================================================

do $$
begin
  begin
    execute 'create extension if not exists pg_cron';
  exception when others then
    raise notice 'pg_cron tidak dapat dipasang otomatis (%). Aktifkan lewat Dashboard → Database → Extensions.', sqlerrm;
  end;

  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'sapu-komentar-kedaluwarsa') then
      perform cron.unschedule('sapu-komentar-kedaluwarsa');
    end if;

    perform cron.schedule(
      'sapu-komentar-kedaluwarsa',
      '*/10 * * * *',
      'select public.sapu_komentar_kedaluwarsa()'
    );
  end if;
end
$$;

-- ============================================================
-- Akun tamu
--
-- Tamu dibuat lewat Anonymous sign-in Supabase, jadi ia tetap baris biasa di
-- auth.users dengan peran `authenticated`. Semua kebijakan RLS yang sudah ada
-- berlaku apa adanya dan pemicu profil ikut jalan; tidak ada yang perlu diubah.
--
-- Yang perlu dilakukan sekali di Dashboard:
--   Authentication → Sign In / Providers → Anonymous Sign-Ins → aktifkan.
-- ============================================================

/*
 * Pembersih akun tamu yang sudah lama tidak dipakai.
 *
 * SENGAJA TIDAK DIJADWALKAN. Menghapus baris auth.users ikut menghapus profil
 * dan komentarnya, jadi keputusan itu diserahkan ke pemilik proyek. Untuk
 * menyalakannya tiap hari pukul 03.00 UTC:
 *
 *   select cron.schedule(
 *     'sapu-tamu-lama', '0 3 * * *',
 *     'select public.sapu_tamu_lama()'
 *   );
 *
 * Membatalkannya: select cron.unschedule('sapu-tamu-lama');
 */
create or replace function public.sapu_tamu_lama(umur interval default interval '7 days')
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  terhapus integer := 0;
begin
  -- Kolom is_anonymous baru ada sejak Supabase mendukung Anonymous sign-in.
  -- Dijalankan lewat EXECUTE supaya fungsi ini tetap bisa dibuat di instans lama.
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'users'
      and column_name = 'is_anonymous'
  ) then
    return 0;
  end if;

  execute 'delete from auth.users where is_anonymous and created_at <= now() - $1'
    using umur;
  get diagnostics terhapus = row_count;
  return terhapus;
end;
$$;

revoke execute on function public.sapu_tamu_lama(interval) from public;
