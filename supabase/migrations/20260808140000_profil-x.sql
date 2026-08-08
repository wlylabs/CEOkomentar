-- ============================================================
-- Twitter Mini — akun X di profil
-- Jalankan setelah 20260808130000_lencana-admin.sql. Aman dijalankan ulang.
--
-- Satu kolom saja: handle X yang diisi sendiri pemilik profilnya, supaya
-- namanya di sini bisa mengantar orang ke akunnya di sana.
--
-- Kenapa bukan `handle` yang dipakai? Handle Twitter Mini dibuat pemicu
-- pendaftaran dari bahan seadanya — potongan alamat surel, ditambah angka bila
-- sudah ada yang memakainya — jadi ia tidak pernah dijanjikan sama dengan handle
-- X pemiliknya. Menautkannya begitu saja ke x.com akan mengantar sebagian orang
-- ke profil orang lain, atau ke halaman yang tidak ada.
--
-- Kenapa bukan `misi_pengguna.bukti -> x_username` yang sudah tercatat? Kolom
-- itu hanya terbaca pemiliknya sendiri (RLS), dan yang lencananya diberikan
-- admin secara manual tidak punya isinya. Ia bukti pemeriksaan, bukan bagian
-- profil yang dipamerkan.
--
-- Kolom ini tidak menjadikan siapa pun terverifikasi. Ia sekadar keterangan
-- yang ditulis pemiliknya, sejajar dengan lokasi — yang memberi centang biru
-- tetap admin, setelah mencocokkan pengajuan dengan daftar pengikut akun resmi.
-- ============================================================

alter table public.profiles
  add column if not exists x_username text;

/*
 * Bentuk handle X: huruf, angka, dan garis bawah, paling panjang 15 — sama
 * dengan yang diterima `bacaProfilX()` di lib/misi.ts. Kosong disimpan sebagai
 * NULL, bukan string kosong, supaya "tidak diisi" hanya punya satu bentuk dan
 * baris tautannya cukup memeriksa satu hal.
 */
alter table public.profiles
  drop constraint if exists profiles_x_username_format;

alter table public.profiles
  add constraint profiles_x_username_format
  check (x_username is null or x_username ~ '^[A-Za-z0-9_]{1,15}$');

/*
 * Tidak ada indeks unik di sini dengan sengaja.
 *
 * Keunikan satu akun X terhadap satu akun aplikasi sudah dijaga tabel `akun_x`,
 * dan di sanalah tempatnya: yang dijaga ketat adalah bukti pemeriksaan. Kolom
 * ini isian profil yang diketik sendiri dan tidak diperiksa siapa pun, jadi
 * memaksakan keunikannya hanya akan menjadikan pengisi pertama pemilik selamanya
 * sebuah nama yang belum tentu miliknya.
 */

/*
 * Tidak ada perubahan RLS maupun grant.
 *
 * Kebijakan "profil sendiri dapat diubah" berlaku per baris, bukan per kolom,
 * dan `grant update on public.profiles` sudah mencakup seluruh kolomnya — jadi
 * kolom baru ini otomatis: terbaca semua pengguna yang masuk, tertulis hanya
 * oleh pemiliknya. Pemicu `jaga_kolom_istimewa()` juga tidak perlu disentuh:
 * yang dikembalikannya adalah kolom yang tidak boleh disetir pemakai, dan ini
 * justru sebaliknya.
 */
