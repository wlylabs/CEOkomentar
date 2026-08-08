-- ============================================================
-- Twitter Mini — tanpa simpanan komentar
-- Jalankan setelah 20260807230000_tanpa-balasan.sql. Aman dijalankan ulang.
--
-- Menyimpan komentar dibongkar seluruhnya: tabelnya pergi bersama kebijakan
-- RLS, indeks, dan haknya. Komentar di aplikasi ini hanya hidup 24 jam, jadi
-- daftar simpanan tidak pernah benar-benar menjadi arsip — yang tersimpan pun
-- ikut hilang keesokan harinya. Tanda suka tetap ada dan sudah menjalankan
-- tugas yang sama: menandai komentar yang ingin ditemukan lagi.
-- ============================================================

/* Kebijakan dan hak dibuang lebih dulu supaya berkas ini tetap bisa dijalankan
   ulang pada basis data yang tabelnya sudah tidak ada. */
do $$
begin
  if exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = 'bookmarks'
  ) then
    drop policy if exists "simpanan sendiri dapat dibaca"  on public.bookmarks;
    drop policy if exists "simpanan sendiri dapat ditambah" on public.bookmarks;
    drop policy if exists "simpanan sendiri dapat dibuang"  on public.bookmarks;
    revoke all on public.bookmarks from anon, authenticated;
  end if;
end
$$;

/* Indeksnya ikut terbawa bersama tabelnya. */
drop table if exists public.bookmarks;
