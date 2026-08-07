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
- Masuk, keluar, dan pemulihan kata sandi lewat tautan email
- Sesi disimpan di kuki dan disegarkan tiap permintaan, jadi halaman yang
  dirender di server sudah tahu siapa yang masuk
- Profil dibuat otomatis oleh pemicu basis data pada setiap pendaftaran

**Feed komentar**

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
2. Buka **SQL Editor**, tempelkan isi `supabase/migrations/20260807090000_awal.sql`,
   lalu jalankan. Berkas itu membuat tabel, pemicu penghitung, kebijakan RLS,
   dua bucket penyimpanan, dan fungsi bantu. Aman dijalankan ulang.
   Bila memakai Supabase CLI: `supabase db push`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi dari
   **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

4. Di **Authentication → URL Configuration**, tambahkan
   `http://localhost:3000/auth/callback` ke *Redirect URLs* agar tautan
   konfirmasi dan pemulihan kata sandi bisa kembali ke aplikasi.
5. Masih di **Authentication → Providers → Email**, matikan *Confirm email* bila
   ingin akun baru langsung bisa dipakai tanpa membuka email.

Selama kedua nilai di `.env.local` kosong, aplikasi menampilkan layar penyiapan
alih-alih halaman kosong.

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
  AuthScreen.tsx    daftar, masuk, dan permintaan pemulihan kata sandi
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
  supabase/         klien peramban, klien server, tipe basis data, kredensial
  image.ts          pemangkasan dan pengecilan gambar di sisi peramban
  time.ts           format waktu relatif dan peringkas angka
  types.ts          tipe bersama
proxy.ts            penyegaran sesi Supabase tiap permintaan
supabase/migrations/ skema, kebijakan RLS, bucket, dan fungsi basis data
```

## Catatan

- Tabel `follows` beserta penghitungnya sudah ada dan berjalan, tetapi aplikasi
  belum punya halaman profil pengguna lain, jadi angka mengikuti dan pengikut
  masih 0 sampai tampilan itu ditambahkan.
- Gambar tidak pernah dikirim mentah-mentah: pemangkasan dan pengecilan memakai
  `<canvas>` di peramban, dan yang diunggah hanya hasil akhirnya.
- Hak akses seluruhnya bersandar pada RLS. Kunci yang dipakai peramban adalah
  kunci anon, dan tanpa sesi tidak ada satu baris pun yang bisa dibaca.
