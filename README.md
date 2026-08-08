# Twitter Mini

Antarmuka bergaya Twitter yang dibangun dengan Next.js (App Router), TypeScript,
dan **Supabase**: feed komentar berumur 24 jam, profil yang bisa diikuti,
notifikasi, simpanan, papan tren, dan penunjuk jam emas audiens X Indonesia.
Hampir seluruh aplikasi berjalan di satu rute (`/`) tanpa perpindahan halaman;
satu rute lagi (`/komentar/[id]`) melayani tautan tetap satu komentar.

Aplikasinya juga sebuah **PWA** — bisa dipasang ke layar utama dan punya halaman
luring sendiri.

Tidak ada data contoh di dalam kode. Akun, komentar, suka, posting ulang, foto
profil, dan sampul semuanya tersimpan di Supabase, dan feed yang tampil adalah
isi basis data yang sebenarnya.

Antarmukanya dua bahasa — Indonesia dan Inggris — dan bisa diganti kapan saja
lewat pengalih di navigasi.

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
- **Admin** untuk moderasi: satu-satunya hak tambahannya adalah menghapus
  komentar siapa pun. Lihat "Admin" di bawah

**Feed komentar**

- **Komentar hidup 24 jam** lalu terhapus otomatis. Setiap kartu menampilkan
  sisa umurnya, dan komentar yang lewat batas langsung hilang dari layar tanpa
  perlu memuat ulang
- Linimasa komentar, terbaru di atas, dengan pemuatan bertahap. Komentar berdiri
  sendiri — tidak ada balasan, tidak ada utas
- Komposer dengan penghitung 280 karakter, tinggi menyesuaikan isi, dan pintasan
  `Ctrl`/`Cmd` + `Enter`
- **Tempel tautan X (Twitter)** — dan hanya itu. Menempelkan
  `https://x.com/i/status/2085707618681864284` mengangkat alamatnya jadi
  lampiran yang bisa dilihat dan dicabut sebelum terkirim; alamat dari situs
  lain ditolak saat ditempel maupun saat diketik, jadi tombol kirim tidak akan
  mau berangkat selama masih ada. Bentuk `twitter.com`, `mobile.`, `www.`,
  `/i/status/…`, dan ekor `?s=20` dirapikan jadi satu bentuk baku, sedangkan
  inang yang menyerupai (`x.com.contoh.id`) ditolak. Di kartu komentar,
  tautannya turun jadi kartu tersendiri — tanpa sematan, tanpa permintaan ke
  server X, jadi tidak ada pihak ketiga yang ikut melihat siapa yang membaca
- Suka dan posting ulang yang tersimpan permanen, diterapkan optimistis dan
  dibatalkan sendiri bila server menolak
- Hapus komentar sendiri
- Komentar baru dari orang lain muncul sendiri lewat Supabase Realtime
- Waktu relatif (`9m`, `5j`, `3h`) yang menyegarkan sendiri tiap menit
- **Simpan komentar** untuk dibaca lagi; daftarnya pribadi dan tidak terlihat
  siapa pun, dijaga kebijakan RLS, bukan hanya disembunyikan di antarmuka
- **Tautan tetap** `/komentar/[id]`: satu komentar di halamannya sendiri, dengan
  judul dan deskripsi halaman mengikuti isinya sehingga tautannya sudah bercerita
  sebelum dibuka
- **Tagar dan sebutan bisa ditekan**: `#tagar` menyaring beranda ke komentar
  yang memuatnya — kepingan saringan di atas daftar menyebutkannya dan
  melepaskannya — sedangkan `@handle` membuka profil orang itu

**Jam emas**

- **Kapan menulis** supaya komentar terbaca paling banyak orang, mengikuti
  kebiasaan audiens X/Twitter Indonesia: pagi 07.00–10.00 (terkuat 08.00–09.30),
  siang 12.00–14.00, dan sore–malam 19.00–21.30 — puncak yang paling stabil dan
  paling lama
- **Potensi viral 0–100** untuk saat ini juga, lengkap dengan tingkatnya
  (Puncak, Tinggi, Cukup bagus, Sedang, Sepi) dan satu kalimat saran: kirim
  sekarang, atau tunggu jendela berikutnya
- **Kurva 24 jam** hari ini, satu batang tiap jam, dengan jam yang sedang
  berjalan ditandai
- **Kekuatan tiap hari**: Selasa–Kamis paling kuat, Sabtu dan Minggu paling
  lemah — terutama paginya, titik terendah sepanjang pekan
- Semuanya dihitung dalam **WIB (UTC+7)**, bukan jam perangkat: yang menentukan
  adalah kapan audiensnya membuka linimasa, bukan di zona mana penulisnya duduk
- Tampil sebagai kartu di panel kanan pada layar lebar, dan sebagai satu baris
  ringkas tepat di atas kotak tulis di ponsel

**Ikuti, notifikasi, dan tren**

- **Ikuti dan berhenti mengikuti** siapa pun dari profilnya. Angka pengikut
  berubah seketika di layar lalu dikukuhkan pemicu basis data; label "Mengikuti"
  berganti "Berhenti mengikuti" saat kursor menyentuhnya
- Profil orang lain dibuka dengan menekan nama, foto, atau sebutan `@handle` di
  mana pun ia muncul
- **Notifikasi** untuk suka, posting ulang, dan pengikut baru. Barisnya
  ditulis pemicu basis data — aplikasi tidak punya izin membuatnya — dan
  membatalkan suka atau berhenti mengikuti ikut menarik kabarnya kembali
- Lencana angka di navigasi menyala lewat Realtime dan padam begitu daftarnya
  dibuka
- **Tren 24 jam** di panel kanan: tagar teramai dihitung langsung dari komentar
  yang masih hidup lewat satu fungsi SQL, tanpa tabel yang perlu dijaga sinkron

**Profil**

- Sampul, avatar, bio, lokasi, tanggal bergabung, jumlah mengikuti dan pengikut
- Foto profil dan sampul bisa diganti atau dihapus: gambar dipangkas di peramban
  (persegi untuk avatar, 3:1 untuk sampul), dikecilkan, diubah ke WebP, lalu
  diunggah ke Supabase Storage. Berkas lama dibuang setelah baris profil
  tersimpan
- Penyuntingan nama, bio, dan lokasi langsung di halaman
- Tab **Komentar**, **Disukai**, dan **Disimpan** yang menyaring
  feed lewat kueri terpisah, bukan penyaringan di sisi peramban. Tab "Disimpan"
  hanya ada di profil sendiri
- **Avatar bawaan DiceBear** bergaya *adventurer-neutral*, dibangkitkan dari
  handle sehingga satu orang selalu mendapat wajah yang sama. SVG-nya dirakit di
  dalam aplikasi, jadi tidak ada permintaan ke server DiceBear dan avatarnya
  tetap muncul saat luring
- Ringkasan aktivitas dihitung di basis data lewat satu fungsi

**Antarmuka**

- Tata letak responsif: satu kolom dengan navigasi bawah di ponsel, dua kolom di
  tablet, tiga kolom di desktop
- **Dua bahasa, Indonesia dan Inggris**, lengkap sampai format waktu dan angka
  (`5j` ↔ `5h`, `1,2 rb` ↔ `1.2K`). Pilihannya disimpan di kuki dan dibaca di
  server, jadi halaman pertama sudah berbahasa benar tanpa berkedip
- Tema gelap dan terang; mengikuti preferensi sistem, pilihan disimpan di
  `localStorage`, dan ditetapkan sebelum lukisan pertama agar tidak berkedip
- Ikon SVG sepenuhnya, tanpa emoji dan tanpa aset eksternal
- Sorotan sentuh biru bawaan Chrome, cincin fokus pada klik tetikus, dan latar
  biru isian otomatis Chrome semuanya dinetralkan; fokus papan tik tetap terlihat
- Label ARIA, status tombol yang bisa ditekan, dan dukungan `prefers-reduced-motion`
- **Satu aturan angka ala Twitter** di seluruh aplikasi: utuh sampai 9.999, di
  atas itu disingkat satu desimal yang dipotong — bukan dibulatkan — sehingga
  tidak ada angka yang pernah tampak lebih besar dari yang sebenarnya. Angka
  penuhnya tetap terbaca lewat judul saat kursor berhenti di atasnya
- **Rasa aplikasi**: bilah atas turun melewati poni layar saat dipasang, tarikan
  berlebih tidak memantul, tombol menekan sedikit saat disentuh, dan kerangka
  aplikasi tidak ikut tersorot saat teks komentar diseret

## Menyiapkan Supabase

1. Buat proyek di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, lalu jalankan keenam berkas di `supabase/migrations/`
   secara berurutan:

   - `20260807090000_awal.sql` — tabel, pemicu penghitung, kebijakan RLS, dua
     bucket penyimpanan, dan fungsi bantu
   - `20260807120000_kedaluwarsa-dan-tamu.sql` — masa hidup komentar 24 jam,
     penyapu berkala, dan pembersih akun tamu
   - `20260807150000_admin.sql` — kolom `is_admin`, pengangkatan otomatis untuk
     handle admin, penjaga kolom istimewa, dan hak hapus komentar bagi admin
   - `20260807180000_pengikut-admin.sql` — jumlah pengikut akun resmi disamakan
     dengan jumlah penduduk Indonesia
   - `20260807210000_jejaring.sql` — tabel simpanan, tabel notifikasi beserta
     pemicunya, fungsi tren tagar, kebijakan RLS untuk keduanya, dan penyapu
     notifikasi lama
   - `20260807230000_tanpa-balasan.sql` — pembongkaran fitur balasan: kolom
     `parent_id` dan `reply_count`, pemicu penghitung dan pemicu notifikasinya,
     kabar berjenis `balas`, serta kolom "balasan" pada `statistik_pengguna()`.
     Balasan yang telanjur ada ikut terhapus

   Keenamnya aman dijalankan ulang. Bila memakai Supabase CLI: `supabase db push`.
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
   sebelumnya di proyek itu: ketiga berkas SQL, pg_cron, dan Anonymous sign-in.
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
  layout.tsx        kerangka dokumen, metadata, bahasa awal, penetapan tema
  page.tsx          rute utama: penyiapan, gerbang masuk, atau aplikasi
  komentar/[id]/    tautan tetap satu komentar
  manifest.ts       keterangan aplikasi untuk pemasangan (PWA)
  sandi-baru/       halaman penggantian kata sandi dari tautan email
  auth/callback/    penukaran kode tautan email menjadi sesi
  globals.css       token warna, tata letak, dan seluruh gaya komponen
components/
  App.tsx           pemegang state: feed, tampilan, tab, saringan tagar, kabar
  AuthScreen.tsx    daftar, masuk, tamu, dan permintaan pemulihan kata sandi
  BilahTamu.tsx     ajakan mengubah akun tamu menjadi permanen
  SandiBaru.tsx     form kata sandi baru
  Setup.tsx         petunjuk bila kredensial Supabase belum ada
  Sidebar.tsx       navigasi kiri (desktop dan tablet)
  BottomNav.tsx     navigasi bawah (ponsel)
  RightRail.tsx     tren, ringkasan aktivitas, dan kartu akun (desktop)
  ProfileHeader.tsx kepala profil, tombol ikuti, form penyuntingan, unggah media
  CommentCard.tsx   kartu komentar beserta aksinya
  TeksKomentar.tsx  isi komentar dengan tagar, sebutan, dan tautan X
  TautanX.tsx       kartu untuk tautan X yang dilampirkan di komentar
  Utas.tsx          halaman tautan tetap satu komentar
  JamEmas.tsx       jam emas audiens Indonesia: kartu panel kanan dan baris ringkas
  DaftarNotifikasi.tsx daftar suka, posting ulang, dan pengikut baru
  LencanaKabar.tsx  titik merah berisi jumlah kabar yang belum dibaca
  Kabar.tsx         kabar sekilas di sudut layar: berhasil, info, dan galat
  TombolTema.tsx    pengalih tema terang/gelap dalam dua bentuk
  Composer.tsx      kotak tulis komentar
  Avatar.tsx        foto profil bila ada, jika tidak avatar DiceBear
  PemilihBahasa.tsx pengalih Indonesia/Inggris dalam tiga bentuk
  TombolPasang.tsx  ajakan memasang aplikasi, muncul bila peramban menawarkannya
  DaftarSW.tsx      pendaftaran service worker
  menu.ts           tiga tujuan navigasi, dipakai bilah samping dan bilah bawah
  Icons.tsx         kumpulan ikon SVG
  Brand.tsx         tanda visual aplikasi
lib/
  api.ts            seluruh baca-tulis ke Supabase dan pemetaan ke tipe aplikasi
  akun.ts           akun yang sedang masuk, dibaca di server sebelum merender
  avatar.ts         avatar bawaan DiceBear yang dibangkitkan dari handle
  jamEmas.ts        jendela jam emas WIB dan hitungan potensi jangkauannya
  kebijakan.ts      masa hidup komentar, disamakan dengan basis data
  tautan.ts         pengenalan dan perapian tautan X; penolak alamat lain
  tema.ts           tema terang/gelap: skrip pra-lukis, peralihan, warna bilah
  i18n/             daftar bahasa, kamus ID/EN, konteks React, dan teks berformat
  supabase/         klien peramban, klien server, tipe basis data, kredensial
  image.ts          pemangkasan dan pengecilan gambar di sisi peramban
  time.ts           format waktu dan angka mengikuti bahasa yang dipakai
  types.ts          tipe bersama
proxy.ts            penyegaran sesi Supabase tiap permintaan
public/             ikon PWA, service worker, dan halaman luring
supabase/migrations/ skema, kebijakan RLS, bucket, masa hidup, dan fungsi bantu
```

## PWA

`app/manifest.ts` menghasilkan `/manifest.webmanifest`, ikonnya ada di `public/`
(192, 512, dan satu versi *maskable* yang digambar penuh sampai tepi), dan
`public/sw.js` didaftarkan oleh `components/DaftarSW.tsx` setelah halaman selesai
dimuat. Di peramban yang menawarkannya, kartu "Pasang aplikasinya" muncul di
panel kanan; Safari memasang lewat menu Bagikan dan tidak pernah mengirim
tawaran itu, jadi di sana kartunya memang tidak ada.

Service worker-nya sengaja hanya mengerjakan dua hal:

1. Menyimpan berkas build (`/_next/static/*`) dan ikon, yang isinya tidak pernah
   berubah tanpa ganti nama berkas.
2. Menjawab permintaan halaman dengan `public/luring.html` ketika jaringan mati.

Yang **tidak** disimpan: HTML halaman dan jawaban Supabase. Keduanya milik satu
akun yang sedang masuk, dan menyimpannya berarti komentar serta profil orang bisa
tertinggal di perangkat setelah ia keluar. Karena itu feed tetap memerlukan
jaringan — yang bekerja luring adalah kerangka aplikasinya.

Versi baru mengambil alih lewat `skipWaiting`, dan halaman yang tadinya dipegang
versi lama dimuat ulang sekali agar kerangkanya tidak berpasangan dengan berkas
build yang sudah berganti. Menaikkan `VERSI` di `public/sw.js` membuang seluruh
simpanan lama.

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

## Dua bahasa

Seluruh teks antarmuka ada di `lib/i18n/kamus.ts`, satu kunci per kalimat.
Kamus Indonesia yang menentukan bentuk kuncinya; kamus Inggris diketikkan
sebagai `Record<KunciTeks, string>` sehingga kunci yang lupa diterjemahkan
langsung ditolak `npm run typecheck`. Menambah kalimat berarti menambah satu
baris di kedua kamus, bukan menyebar teks di dalam komponen.

Pilihan bahasa disimpan di kuki `tm-bahasa`, bukan `localStorage` seperti tema.
Alasannya: halaman ini dirender di server, jadi server harus sudah tahu
bahasanya sebelum HTML dikirim — kalau tidak, teks sempat tampil dalam bahasa
yang salah lalu berganti setelah hidrasi. `app/layout.tsx` membaca kuki itu,
mengisi atribut `lang`, lalu meneruskannya ke `PenyediaBahasa`.

Yang ikut berganti bukan cuma kalimat:

| | Indonesia | Inggris |
| --- | --- | --- |
| Waktu relatif | `9m`, `5j`, `3h` | `9m`, `5h`, `3d` |
| Sisa umur komentar | `23j lagi` | `23h left` |
| Tanggal | `7 Agu 2026` | `Aug 7, 2026` |
| Angka ringkas | `12,3 rb`, `3,4 jt` | `12.3K`, `3.4M` |
| Pemisah ribuan | `3.400` | `3,400` |

Nama bulan ditulis sendiri di `lib/time.ts`, tidak lewat `Intl`, supaya server
dan peramban selalu menghasilkan teks yang sama persis dan hidrasi tidak pernah
mengeluh.

Galat yang datang dari Supabase tetap berbahasa Inggris kecuali yang sering
ditemui pemakai — kredensial salah, email sudah terdaftar, batas percobaan —
yang dipetakan ke kalimat sendiri di `components/AuthScreen.tsx`.

Pengalihnya ada di tiga tempat: satu baris di navigasi kiri, tombol bulat di
bilah atas ponsel, dan dua pilihan berdampingan di halaman masuk, penyiapan,
serta kata sandi baru.

## Tema terang dan gelap

Berbeda dengan bahasa, tema disimpan di `localStorage` (`tm-tema`): server tidak
perlu tahu, karena yang berubah hanya warna. Tanpa pilihan tersimpan, setelan
sistem yang dipakai — dan tetap diikuti bila setelan itu berubah saat halaman
terbuka.

Temanya hidup di DOM, bukan di state React. `SKRIP_TEMA` (lihat `lib/tema.ts`)
dijalankan di `<head>` sebelum lukisan pertama dan memasang `data-tema` di
`<html>`; seluruh warna adalah variabel CSS yang menggantung pada atribut itu.
React sengaja tidak ikut mencerminkannya, sebab cerminan itu baru terisi benar
setelah halaman selesai terhidrasi — dan selama jeda tersebut warnanya berkedip
setiap kali halaman dimuat ulang. Karena alasan yang sama `TombolTema.tsx`
merender matahari dan bulan sekaligus, lalu CSS menyembunyikan yang tidak
sesuai.

Saat tombolnya ditekan, `beralihTema` menempelkan kelas `tema-beralih` selama
220 ms. Kelas itulah yang menyalakan transisi warna, jadi warna meleleh ke tema
baru tanpa membuat setiap hover dan setiap kartu baru ikut beranimasi di luar
peralihan. Pemakai yang meminta `prefers-reduced-motion: reduce` tidak
mendapat lelehannya.

`<meta name="theme-color">` dibuat skrip yang sama, bukan lewat
`viewport.themeColor` milik Next: meta bawaan Next selalu terikat
`prefers-color-scheme`, sehingga bilah status ponsel tetap hitam ketika pemakai
memilih tema terang di atas sistem yang gelap. `public/luring.html` memuat
salinan skrip itu supaya halaman luring ikut tema yang sama.

## Admin

Admin adalah akun biasa dengan satu hak tambahan: **menghapus komentar siapa
pun**. Tidak ada yang lain — admin tidak bisa membaca komentar kedaluwarsa,
menyunting profil orang lain, atau mengangkat admin baru dari dalam aplikasi.
Di antarmuka ia tampil sebagai lencana **ADMIN** di sebelah nama, dan tombol
hapus ikut muncul pada komentar orang lain.

Siapa yang admin ditentukan `public.handle_admin()` di
`supabase/migrations/20260807150000_admin.sql`:

```sql
create or replace function public.handle_admin()
returns text[] language sql immutable parallel safe as $$
  select array['CEOkomentar']::text[];
$$;
```

Pemicu `profiles_tandai_admin` menyalakan `is_admin` saat profil dengan handle
itu dibuat, jadi **@CEOkomentar tetap menjadi admin walau akunnya baru
didaftarkan setelah migrasi dijalankan**. Pemicunya sengaja hanya berjalan pada
`INSERT`: kalau ikut berjalan saat handle diubah, siapa pun yang kelak mengambil
alih handle yang ditinggalkan akan mewarisi haknya juga.

Karena handle yang dipakai sebagai penanda, **daftarkan handle itu lebih dulu**.
Handle bersifat unik dan siapa pun bisa mengambilnya; yang lebih dulu memakai
`@CEOkomentar` yang akan diangkat.

Menambah admin: tambahkan handle ke fungsi di atas lalu jalankan ulang berkas
migrasinya. Untuk satu akun yang sudah ada:

```sql
update public.profiles set is_admin = true where lower(handle) = lower('handleku');
```

Mencabutnya: `set is_admin = false` dengan cara yang sama.

Perintah itu harus dijalankan dari SQL Editor, bukan dari aplikasi. Kebijakan
RLS mengizinkan tiap orang menyunting barisnya sendiri, dan tanpa penjagaan itu
termasuk kolom `is_admin` — satu panggilan `update` dari peramban sudah cukup
untuk mengangkat diri sendiri. Pemicu `profiles_jaga_kolom_istimewa`
mengembalikan `is_admin` dan `verified` ke nilai lamanya untuk setiap perubahan
yang datang dari sesi pengguna; perintah tanpa `auth.uid()` — SQL Editor,
migrasi, `service_role` — tetap bisa mengubahnya.

## Catatan

- Angka sosial memakai satu aturan di seluruh aplikasi (`angkaSosial` di
  `lib/time.ts`): utuh sampai 9.999, lalu disingkat satu desimal yang dipotong,
  bukan dibulatkan — 1.999.999 menjadi `1,9 jt`, bukan `2 jt`.
- Simpanan tidak memperpanjang umur komentar. Barisnya ikut terhapus bersama
  komentarnya, jadi daftar simpanan tidak pernah menunjuk ke komentar yang sudah
  tidak ada.
- Notifikasi 'ikut' tidak punya komentar yang membawanya pergi, jadi hanya jenis
  itu yang menumpuk; `sapu_notifikasi_lama()` dijadwalkan tiap hari bila pg_cron
  tersedia.
- Jam emas adalah pola kebiasaan, bukan ramalan: angkanya tetap dari hari ke
  hari (`lib/jamEmas.ts`), tidak dihitung dari data pemakaian aplikasi ini, dan
  selalu memakai WIB berapa pun jam perangkat pembacanya.
- Avatar bawaan memakai gaya *Adventurer Neutral* karya Lisa Wischofsky
  (CC BY 4.0) lewat DiceBear. Keterangannya ada di kaki panel kanan aplikasi.
- Gambar tidak pernah dikirim mentah-mentah: pemangkasan dan pengecilan memakai
  `<canvas>` di peramban, dan yang diunggah hanya hasil akhirnya.
- Hak akses seluruhnya bersandar pada RLS. Kunci yang dipakai peramban adalah
  kunci anon, dan tanpa sesi tidak ada satu baris pun yang bisa dibaca.
- Tombol hapus pada komentar orang lain hanya muncul untuk admin, tetapi yang
  benar-benar menentukan tetap kebijakan RLS `DELETE` di basis data.
