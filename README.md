# Twitter Mini

Antarmuka satu halaman bergaya Twitter yang dibangun dengan Next.js (App Router) dan
TypeScript. Ruang lingkupnya sengaja dibatasi pada dua fitur: **profil** dan **feed
komentar**. Seluruh aplikasi berjalan di satu rute (`/`) tanpa perpindahan halaman.

## Fitur

**Feed komentar**

- Linimasa komentar dan balasan, terbaru di atas
- Komposer dengan penghitung 280 karakter, tinggi menyesuaikan isi, dan pintasan
  `Ctrl`/`Cmd` + `Enter`
- Balasan langsung di dalam kartu komentar, ditandai dengan konteks "Membalas @…"
- Aksi suka dan posting ulang yang bisa dibatalkan, plus salin tautan komentar
- Pencarian yang menyaring berdasarkan isi komentar, nama, atau handle
- Waktu relatif (`9m`, `5j`, `3h`) yang menyegarkan sendiri tiap menit

**Profil**

- Sampul, avatar, bio, lokasi, tanggal bergabung, jumlah mengikuti dan pengikut
- Penyuntingan nama, bio, dan lokasi langsung di halaman
- Tab **Komentar**, **Balasan**, dan **Disukai** yang menyaring feed
- Ringkasan jumlah komentar dan suka yang diterima

**Antarmuka**

- Tata letak responsif: satu kolom dengan navigasi bawah di ponsel, dua kolom di
  tablet, tiga kolom di desktop
- Tema gelap dan terang; mengikuti preferensi sistem, pilihan disimpan di
  `localStorage`, dan ditetapkan sebelum lukisan pertama agar tidak berkedip
- Ikon SVG sepenuhnya, tanpa emoji dan tanpa aset eksternal
- Label ARIA, status tombol yang bisa ditekan, fokus keyboard yang terlihat, serta
  dukungan `prefers-reduced-motion`

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build
npm run start
```

## Struktur

```
app/
  layout.tsx      kerangka dokumen, metadata, penetapan tema awal
  page.tsx        satu-satunya rute
  globals.css     token warna, tata letak, dan seluruh gaya komponen
components/
  App.tsx         pemegang state: komentar, tampilan, tab, pencarian, tema
  Sidebar.tsx     navigasi kiri (desktop dan tablet)
  BottomNav.tsx   navigasi bawah (ponsel)
  RightRail.tsx   pencarian dan ringkasan aktivitas (desktop)
  ProfileHeader.tsx  kepala profil beserta form penyuntingan
  CommentCard.tsx    kartu komentar beserta aksinya
  Composer.tsx    kotak tulis untuk komentar dan balasan
  Avatar.tsx      avatar inisial dengan warna turunan dari handle
  Icons.tsx       kumpulan ikon SVG
  Brand.tsx       tanda visual aplikasi
lib/
  data.ts         data contoh pengguna dan komentar
  time.ts         format waktu relatif dan peringkas angka
  types.ts        tipe bersama
```

Data disimpan di memori peramban: perubahan hilang saat halaman dimuat ulang, kecuali
pilihan tema.
