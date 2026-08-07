# Twitter Mini

Antarmuka satu halaman bergaya Twitter yang dibangun dengan Next.js (App Router),
TypeScript, dan **Supabase**. Ruang lingkupnya sengaja dibatasi pada dua fitur:
**profil** dan **feed komentar**. Seluruh aplikasi berjalan di satu rute (`/`)
tanpa perpindahan halaman.

Tidak ada data contoh di dalam kode. Akun, komentar, suka, posting ulang, foto
profil, dan sampul semuanya tersimpan di Supabase, dan feed yang tampil adalah
isi basis data yang sebenarnya.

## Fitur

**Akun**

- Daftar dengan nama, handle, email, dan kata sandi; ketersediaan handle
  diperiksa sambil mengetik
- **Masuk sebagai tamu** tanpa email dan kata sandi, memakai Anonymous sign-in
  Supabase. Tamu mendapat handle acak (`@tamu4821`) dan bisa langsung menulis,
  menyukai, serta menyunting profilnya
- Akun tamu bisa diubah menjadi permanen dari dalam aplikasi dengan menambahkan
  email dan kata sandi; komentar dan profil yang sudah ada ikut terbawa karena
  akunnya memang akun yang sama
- Masuk, keluar, dan pemulihan kata sandi lewat tautan email
- Sesi disimpan di kuki dan disegarkan tiap permintaan, jadi halaman yang
  dirender di server sudah tahu siapa yang masuk
- Profil dibuat otomatis oleh pemicu basis data pada setiap pendaftaran

**Feed komentar**

- **Komentar hidup 24 jam** lalu terhapus otomatis. Setiap kartu menampilkan
  sisa umurnya, dan komentar yang lewat batas langsung hilang dari layar tanpa
  perlu memuat ulang
- Linimasa komentar dan balasan, terbaru di atas, dengan pemuatan bertahap
- Komposer dengan penghitung 280 karakter, tinggi menyesuaikan isi, dan pintasan
  `Ctrl`/`Cmd` + `Enter`
- Balasan langsung di dalam kartu komentar, ditandai dengan konteks "Membalas @…"
- Suka dan posting ulang yang tersimpan permanen, diterapkan optimistis dan
  dibatalkan sendiri bila server menolak
- Hapus komentar sendiri, beserta seluruh balasannya
- Pencarian yang menyaring berdasarkan isi komentar, nama, atau handle penulis
- Komentar baru dari orang lain muncul sendiri lewat Supabase Realtime
- Waktu relatif (`9m`, `5j`, `3h`) yang menyegarkan sendiri tiap menit

**Profil**

- Sampul, avatar, bio, lokasi, tanggal bergabung, jumlah mengikuti dan pengikut
- Foto profil dan sampul bisa diganti atau dihapus: gambar dipangkas di peramban
  (persegi untuk avatar, 3:1 untuk sampul), dikecilkan, diubah ke WebP, lalu
  diunggah ke Supabase Storage. Berkas lama dibuang setelah baris profil
  tersimpan
- Penyuntingan nama, bio, dan lokasi langsung di halaman
- Tab **Komentar**, **Balasan**, dan **Disukai** yang menyaring feed lewat kueri
  terpisah, bukan penyaringan di sisi peramban
- Ringkasan aktivitas dihitung di basis data lewat satu fungsi

**Antarmuka**

- Tata letak responsif: satu kolom dengan navigasi bawah di ponsel, dua kolom di
  tablet, tiga kolom di desktop
- Tema gelap dan terang; mengikuti preferensi sistem, pilihan disimpan di
  `localStorage`, dan ditetapkan sebelum lukisan pertama agar tidak berkedip
- Ikon SVG sepenuhnya, tanpa emoji dan tanpa aset eksternal
- Sorotan sentuh biru bawaan Chrome, cincin fokus pada klik tetikus, dan latar
  biru isian otomatis Chrome semuanya dinetralkan; fokus papan tik tetap terlihat
- Label ARIA, status tombol yang bisa ditekan, dan dukungan `prefers-reduced-motion`

## Menyiapkan Supabase

1. Buat proyek di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, lalu jalankan kedua berkas di `supabase/migrations/`
   secara berurutan:

   - `20260807090000_awal.sql` — tabel, pemicu penghitung, kebijakan RLS, dua
     bucket penyimpanan, dan fungsi bantu
   - `20260807120000_kedaluwarsa-dan-tamu.sql` — masa hidup komentar 24 jam,
     penyapu berkala, dan pembersih akun tamu

   Keduanya aman dijalankan ulang. Bila memakai Supabase CLI: `supabase db push`.
3. Aktifkan **pg_cron** di **Database → Extensions** supaya komentar
   kedaluwarsa benar-benar terhapus. Migrasi mencoba memasangnya sendiri dan
   hanya memberi catatan bila tidak bisa. Lihat "Masa hidup komentar" di bawah
   untuk apa yang terjadi tanpa pg_cron.
4. Aktifkan **Anonymous Sign-Ins** di **Authentication → Sign In / Providers**
   agar tombol "Masuk sebagai tamu" berfungsi.
5. Salin `.env.example` menjadi `.env.local`, lalu isi dari
   **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

6. Di **Authentication → URL Configuration**, tambahkan
   `http://localhost:3000/auth/callback` ke *Redirect URLs* agar tautan
   konfirmasi dan pemulihan kata sandi bisa kembali ke aplikasi.
7. Masih di **Authentication → Providers → Email**, matikan *Confirm email* bila
   ingin akun baru langsung bisa dipakai tanpa membuka email.

Selama kedua nilai di `.env.local` kosong, aplikasi menampilkan layar penyiapan
alih-alih halaman kosong.

## Menerbitkan ke Vercel

1. **Hubungkan repositori.** Di [vercel.com/new](https://vercel.com/new), impor
   repositori ini. Next.js terdeteksi sendiri, jadi perintah build dan direktori
   keluaran tidak perlu diubah.
2. **Isi environment variable.** Di **Project → Settings → Environment
   Variables**, tambahkan dua nilai yang sama dengan `.env.local`, lalu centang
   ketiga lingkungan (Production, Preview, Development):

   | Nama | Nilai |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | kunci anon/publishable proyekmu |

   Alternatifnya, pasang integrasi **Supabase** dari Vercel Marketplace
   (**Integrations → Browse Marketplace → Supabase**) dan pilih proyeknya.
   Integrasi itu mengisi variabel di atas otomatis untuk semua lingkungan.
   Cukup salah satu cara, jangan keduanya, agar nilainya tidak bertabrakan.

   Keduanya berawalan `NEXT_PUBLIC_` karena memang dipakai di peramban. Itu
   aman: kunci anon memang untuk publik, dan yang menjaga data adalah RLS.
   Jangan pernah menaruh `service_role` key di Vercel untuk proyek ini —
   tidak ada kode yang membutuhkannya.
3. **Daftarkan URL Vercel di Supabase.** Buka **Authentication → URL
   Configuration**, lalu isi:

   - *Site URL*: `https://nama-proyekmu.vercel.app`
   - *Redirect URLs*: tambahkan baris-baris berikut

     ```
     https://nama-proyekmu.vercel.app/auth/callback
     https://nama-proyekmu-*.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

   Baris berbintang mencakup URL preview tiap pull request. Tanpa langkah ini
   tautan konfirmasi email dan pemulihan kata sandi akan ditolak di produksi.
4. **Jalankan migrasi di proyek produksi.** Kalau proyek Supabase untuk produksi
   berbeda dari yang dipakai saat mengembangkan, ulangi langkah 2–4 dari bagian
   sebelumnya di proyek itu: kedua berkas SQL, pg_cron, dan Anonymous sign-in.
5. **Deploy ulang.** Environment variable baru hanya terbaca oleh build
   berikutnya, jadi tekan **Redeploy** setelah menambahkannya.

Kalau setelah deploy yang muncul adalah layar "Supabase belum terhubung",
berarti variabelnya belum terbaca — biasanya karena lupa deploy ulang atau
lingkungannya belum dicentang.

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build
npm run start
npm run typecheck
```

## Struktur

```
app/
  layout.tsx        kerangka dokumen, metadata, penetapan tema awal
  page.tsx          satu-satunya rute: penyiapan, gerbang masuk, atau aplikasi
  sandi-baru/       halaman penggantian kata sandi dari tautan email
  auth/callback/    penukaran kode tautan email menjadi sesi
  globals.css       token warna, tata letak, dan seluruh gaya komponen
components/
  App.tsx           pemegang state: feed, tampilan, tab, pencarian, tema
  AuthScreen.tsx    daftar, masuk, tamu, dan permintaan pemulihan kata sandi
  BilahTamu.tsx     ajakan mengubah akun tamu menjadi permanen
  SandiBaru.tsx     form kata sandi baru
  Setup.tsx         petunjuk bila kredensial Supabase belum ada
  Sidebar.tsx       navigasi kiri (desktop dan tablet)
  BottomNav.tsx     navigasi bawah (ponsel)
  RightRail.tsx     pencarian, ringkasan aktivitas, dan kartu akun (desktop)
  ProfileHeader.tsx kepala profil beserta form penyuntingan dan unggahan media
  CommentCard.tsx   kartu komentar beserta aksinya
  Composer.tsx      kotak tulis untuk komentar dan balasan
  Avatar.tsx        foto profil bila ada, jika tidak avatar inisial berwarna
  Icons.tsx         kumpulan ikon SVG
  Brand.tsx         tanda visual aplikasi
lib/
  api.ts            seluruh baca-tulis ke Supabase dan pemetaan ke tipe aplikasi
  kebijakan.ts      masa hidup komentar, disamakan dengan basis data
  supabase/         klien peramban, klien server, tipe basis data, kredensial
  image.ts          pemangkasan dan pengecilan gambar di sisi peramban
  time.ts           format waktu relatif dan peringkas angka
  types.ts          tipe bersama
proxy.ts            penyegaran sesi Supabase tiap permintaan
supabase/migrations/ skema, kebijakan RLS, bucket, masa hidup, dan fungsi bantu
```

## Masa hidup komentar

Angkanya ada di satu tempat per sisi:

- Basis data: `public.masa_komentar()` di migrasi kedua
- Antarmuka: `MASA_KOMENTAR_JAM` di `lib/kebijakan.ts`

Ubah keduanya bersamaan bila ingin masa selain 24 jam.

Penegakannya berlapis dua. Kebijakan RLS `SELECT` pada tabel `comments` hanya
meloloskan baris yang lebih muda dari batas, jadi komentar kedaluwarsa langsung
tidak terbaca siapa pun — termasuk oleh penghitung statistik. Di atas itu,
`sapu_komentar_kedaluwarsa()` dijadwalkan pg_cron tiap 10 menit untuk
benar-benar menghapus barisnya.

Tanpa pg_cron aplikasi tetap berperilaku benar dari sisi pengguna, hanya barisnya
menumpuk di basis data. Untuk menyapunya manual:

```sql
select public.sapu_komentar_kedaluwarsa();
```

Menghapus komentar induk ikut menghapus balasannya, termasuk balasan yang belum
24 jam. Aturannya sama dengan penghapusan manual di aplikasi, dan karena penyapu
berjalan tiap 10 menit, balasan yatim paling lama terlihat selama itu.

## Akun tamu

Tamu memakai Anonymous sign-in Supabase, jadi ia baris biasa di `auth.users`
dengan peran `authenticated` — seluruh kebijakan RLS berlaku sama seperti akun
terdaftar, dan pemicu pembuat profil ikut jalan.

Akun tamu menumpuk kalau tidak pernah dibersihkan. Fungsi
`sapu_tamu_lama(interval)` sudah tersedia tapi **sengaja tidak dijadwalkan**,
karena menghapusnya ikut menghapus profil dan komentarnya. Untuk menyalakannya:

```sql
select cron.schedule('sapu-tamu-lama', '0 3 * * *', 'select public.sapu_tamu_lama()');
```

Bawaannya membuang akun tamu yang dibuat lebih dari 7 hari lalu. Membatalkan:
`select cron.unschedule('sapu-tamu-lama');`

## Catatan

- Tabel `follows` beserta penghitungnya sudah ada dan berjalan, tetapi aplikasi
  belum punya halaman profil pengguna lain, jadi angka mengikuti dan pengikut
  masih 0 sampai tampilan itu ditambahkan.
- Gambar tidak pernah dikirim mentah-mentah: pemangkasan dan pengecilan memakai
  `<canvas>` di peramban, dan yang diunggah hanya hasil akhirnya.
- Hak akses seluruhnya bersandar pada RLS. Kunci yang dipakai peramban adalah
  kunci anon, dan tanpa sesi tidak ada satu baris pun yang bisa dibaca.
