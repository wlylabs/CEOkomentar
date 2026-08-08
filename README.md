# Twitter Mini

Antarmuka bergaya Twitter yang dibangun dengan Next.js (App Router), TypeScript,
dan **Supabase**: feed komentar berumur 24 jam, profil yang bisa diikuti,
notifikasi, misi lencana, papan tren, penunjuk jam emas audiens X Indonesia, dan
panduan mengembangkan akun X yang dibaca dari dua rilis kode perekomendasi X
sendiri.
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

**Panduan**

Satu halaman tersendiri di navigasi, tempat jam emas bertemu bacaan yang
menjelaskan kenapa jam itu penting: **dua rilis kode perekomendasi X** yang
dibuka ke publik, dan kebijakan Creator Studio yang menentukan kapan jangkauan
menjadi uang.

Dua rilis, bukan satu, karena keduanya menjawab pertanyaan yang berbeda.
[xai-org/x-algorithm](https://github.com/xai-org/x-algorithm) (2026) adalah
mesin yang **berjalan sekarang**, dan ia menerbitkan susunannya tanpa satu pun
angka bobot. [twitter/the-algorithm](https://github.com/twitter/the-algorithm)
(2023) sudah dipensiunkan, dan ia satu-satunya yang pernah menerbitkan angka
itu. Halaman ini menaruh yang berjalan lebih dulu dan yang lama sesudahnya,
dengan alasan keduanya masih ada tertulis di tempatnya.

- **Kartu jam emas penuh** — bukan baris ringkas — beserta satu tombol yang
  membawa langsung ke kotak tulis, dan yang berbunyi berbeda saat jendelanya
  memang sedang berlangsung. Di layar lebar kartu yang sama dilepas dari panel
  kanan selama halaman ini terbuka, supaya tidak ada dua salinan bersebelahan
- **Rencana hari ini**: enam langkah yang sama tiap hari, masing-masing dengan
  angka atau aturan yang mendasarinya, dengan bilah kemajuan di atasnya.
  Centangnya kosong lagi tiap tengah malam WIB — yang dilatih kebiasaannya,
  bukan penyelesaiannya — dan seluruhnya tinggal di `localStorage`: tidak ada
  baris basis data dan tidak ada permintaan jaringan
- **Bagaimana linimasa X memilih hari ini**, dibaca langsung dari klona
  `xai-org/x-algorithm` pada komit `0bfc279` (15 Mei 2026) — bukan dari
  ringkasan orang lain:
  - dua sumber kandidat (**Thunder** menyimpan postingan dalam lingkaran di
    memori; **Phoenix** mengambil yang di luar lingkaran lewat model dua menara)
    dan satu pemeringkat untuk keduanya
  - tujuh tahap yang dijalankan tiap permintaan, dari mengumpulkan konteks
    pembaca sampai penyaring visibilitas terakhir
  - **22 aksi** yang diramalkan untuk tiap postingan — 17 menaikkan skor, 5
    menurunkannya — ditampilkan sebagai kepingan karena bobotnya memang tidak
    ada. "Dilewati tanpa berhenti" berdiri di sisi yang merugikan
  - **tiga rumus yang benar-benar tertulis**, termasuk pengali keragaman penulis
    `(1 − lantai) × peluruhan^posisi + lantai`, yang memakai *peringkat
    postingan itu di antara postingan penulis yang sama* — bukan jarak waktunya
  - **Grok membaca tiap postingan** lewat `grox/`: penyaring mutu yang
    mengeluarkan nilai mutu sekaligus nilai untuk isi dangkal, pengelas spam
    yang khusus dijalankan untuk akun berpengikut sedikit, pemeriksa tujuh
    kebijakan, peringkat balasan, dan sematan multimoda dari teks, gambar, dan
    suara sekaligus
  - **yang tidak ikut diterbitkan**, disebut satu per satu: seluruh angka bobot
    (dibaca dari modul saklar fitur yang tidak ada di repositori), ambang umur
    postingan, faktor peluruhan keragaman, prompt Grok, dan model produksinya.
    Ini bukan catatan kaki — inilah alasan setiap "bobot menurut algoritma X
    2026" yang beredar tidak berasal dari repositori itu
- **Mesin sebelumnya, dan kenapa masih dibaca**: empat tahap 2023, sumber
  kandidatnya (Earlybird ±50% linimasa, UTEG, SimClusters ±145 rb komunitas,
  RealGraph, FRS), dan penyaringnya
- **Bobot sepuluh sinyal heavy ranker** apa adanya dari
  [twitter/the-algorithm-ml](https://github.com/twitter/the-algorithm-ml), tiap
  satunya dengan bilah sepanjang angkanya dan terjemahan ke satuan yang bisa
  dibayangkan: satu balasan sebanding 27 suka, satu balasan yang dibalas
  penulisnya sebanding 150 suka, satu laporan menghapus nilai 738 suka. Nama
  parameter aslinya ikut ditulis supaya angkanya bisa dicari sendiri —
  dan kartunya mengatakan lebih dulu bahwa yang berlaku darinya urutannya,
  bukan besarnya
- **Kebijakan Creator Studio X**: tiga programnya, syarat masuk (langganan
  Premium, 500 pengikut, 5 juta tayangan organik dalam tiga bulan, akun
  pembayaran, kepatuhan yang berlaku terus), dan enam hal yang mencabut
  monetisasi — umpan keterlibatan di urutan pertama, persis taktik yang paling
  sering dijanjikan menaikkan jangkauan
- **Tafsir dipisahkan dari kutipan.** Angka, rumus, dan nama layanan datang dari
  repositori; kalimat "jadi lakukan ini" berdiri di bloknya sendiri, dan tiap
  satunya membawa dasarnya di baris kecil di bawahnya — dengan tahun rilisnya
  disebut, karena enam kesimpulan itu ditarik dari dua rilis sekaligus. Halaman
  ditutup daftar rujukan lengkap sampai berkasnya, catatan bahwa X menyatakan
  memperbarui repositorinya tiap empat pekan, dan pengingat bahwa ambang milik
  X berubah tanpa pemberitahuan
- Twitter Mini tidak terhubung ke X dan tidak meminta izin apa pun atas akun
  siapa pun: seluruh isi halaman ini bacaan atas dokumen yang terbuka untuk umum

**Ikuti, notifikasi, dan tren**

- **Ikuti dan berhenti mengikuti** siapa pun dari profilnya. Angka pengikut
  berubah seketika di layar lalu dikukuhkan pemicu basis data; label "Mengikuti"
  berganti "Berhenti mengikuti" saat kursor menyentuhnya
- Profil orang lain dibuka dengan menekan nama, foto, atau sebutan `@handle` di
  mana pun ia muncul
- **Notifikasi** untuk suka, posting ulang, dan pengikut baru — dan, khusus di
  daftar admin, untuk pengajuan misi yang baru diposting. Barisnya ditulis
  pemicu basis data — aplikasi tidak punya izin membuatnya — dan membatalkan
  suka atau berhenti mengikuti ikut menarik kabarnya kembali
- Lencana angka di navigasi menyala lewat Realtime dan padam begitu daftarnya
  dibuka
- **Tren 24 jam** di panel kanan: tagar teramai dihitung langsung dari komentar
  yang masih hidup lewat satu fungsi SQL, tanpa tabel yang perlu dijaga sinkron

**Misi dan lencana**

- **Misi centang biru**: mengikuti [@gaptekcat](https://x.com/gaptekcat) di
  X, lalu **memposting pengajuannya di Twitter Mini** — satu kalimat tetap
  beserta tautan profil X yang menekan Follow. Kartu misinya yang menyusun
  kalimatnya, dan satu tombol mengirimkannya ke kotak tulis
- **Yang memutuskan admin, bukan tombol**: pengajuan itu komentar biasa yang
  berdiri di beranda; admin membacanya, mencocokkan tautan profilnya dengan
  daftar pengikut akun resmi, lalu memberi lencananya dari kartu profil pengaju
- **Pengajuannya mengabari admin** seperti suka dan posting ulang mengabari
  penulis komentar: begitu komentar bertagar `#TwitterMini` masuk, satu baris
  muncul di daftar notifikasi tiap admin dan menunjuk langsung ke komentarnya
- **Tagar `#TwitterMini`** mengumpulkan seluruh pengajuan jadi satu: menekannya
  di kartu mana pun menyaring beranda ke daftar yang perlu diperiksa. Kalimat
  pengajuannya ikut bahasa antarmuka; tagarnya tidak, jadi pengajuan berbahasa
  apa pun tetap berkumpul di satu tempat
- **Tidak ada jalan memberi lencana pada diri sendiri**: tabel misi dan lencana
  tidak punya satu pun kebijakan tulis untuk pengguna, dan fungsi pemberinya
  hanya bisa dipanggil `service_role` dari server
- **Panel lencana admin**: satu baris per lencana yang bisa diberikan — hari ini
  tepat centang biru — dengan tombol beri dan cabut. Centang emas tidak ikut
  ditampilkan sama sekali: ia mengikuti peran admin, bukan pemberian
- **Bisa bertambah**: katalog misi hidup di basis data dan katalog lencananya di
  `lib/lencana.ts`; misi berikutnya tidak memerlukan perubahan skema

**Profil**

- Sampul, avatar, bio, lokasi, tanggal bergabung, jumlah mengikuti dan pengikut
- **Akun X pemiliknya**, diisi sendiri lewat sunting profil dan tampil di baris
  yang sama dengan lokasi: lambang X, nama akunnya, dan menekannya membuka
  profil itu di x.com. Ia sengaja tidak digambar seperti tautan — warnanya sama
  dengan teks meta di sebelahnya, tanpa garis bawah dan tanpa biru; garis
  bawahnya baru muncul saat kursor menyentuhnya
- Foto profil dan sampul bisa diganti atau dihapus: gambar dipangkas di peramban
  (persegi untuk avatar, 3:1 untuk sampul), dikecilkan, diubah ke WebP, lalu
  diunggah ke Supabase Storage. Berkas lama dibuang setelah baris profil
  tersimpan
- Penyuntingan nama, bio, lokasi, dan akun X langsung di halaman. Membuka form
  itu **tidak menaikkan papan tik**: tidak ada isian yang tersorot otomatis,
  jadi separuh layar tidak tertutup sebelum sempat melihat foto, sampul, dan bio
  — yang justru lebih sering diubah daripada namanya
- Tab **Komentar** dan **Disukai** yang menyaring feed lewat kueri terpisah,
  bukan penyaringan di sisi peramban
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
2. Buka **SQL Editor**, lalu jalankan seluruh berkas di
   `supabase/migrations/` secara berurutan:

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
   - `20260808090000_tanpa-simpanan.sql` — pembongkaran fitur simpan komentar:
     tabel `bookmarks` beserta kebijakan, indeks, dan haknya
   - `20260808100000_misi-lencana.sql` — katalog misi, kemajuan per akun, daftar
     lencana, ikatan akun X, dan fungsi pemberian lencana yang hanya bisa
     dipanggil `service_role`
   - `20260808110000_penguat-keamanan.sql` — penguncian kolom yang hanya boleh
     ditulis pemicu (penghitung suka, posting ulang, dan pengikut), handle akun
     resmi yang tidak bisa diambil alih, serta rem laju penulisan komentar
   - `20260808120000_pengikut-resmi.sql` — daftar pengikut akun resmi beserta
     waktu penyegarannya, pemeriksa misi yang mencocokkan nama ke daftar itu,
     antrean tinjauan yang dikosongkan setiap penyegaran, dan penutupan
     `selesaikan_misi_x()` yang lama
   - `20260808130000_lencana-admin.sql` — `atur_lencana_admin()` yang memberi
     dan mencabut lencana atas keputusan admin, sekaligus menyesuaikan kemajuan
     misinya; dan penutupan `periksa_misi_x()` yang pemanggilnya sudah tidak ada
   - `20260808140000_profil-x.sql` — kolom `x_username` di `profiles`, isian
     profil yang diketik sendiri pemiliknya beserta pembatas bentuk handle X
   - `20260808150000_kabar-misi.sql` — kabar berjenis `misi`: pemicu yang
     mengabari tiap admin begitu komentar bertagar `#TwitterMini` diposting,
     tagar pengajuan sebagai fungsi SQL, dan kunci unik notifikasi yang
     diperlebar supaya satu perbuatan bisa mengabari lebih dari satu orang

   Semuanya aman dijalankan ulang. Bila memakai Supabase CLI:
   `supabase db push`.
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

Agar admin bisa memberi dan mencabut lencana, ada satu nilai tambahan —
opsional, dan dijelaskan di bagian [Misi dan lencana](#misi-dan-lencana).

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

   Agar admin bisa memberi dan mencabut lencana, tambahkan pula
   `SUPABASE_SERVICE_ROLE_KEY` (lihat bagian
   [Misi dan lencana](#misi-dan-lencana)). Nilai itu **tanpa** awalan
   `NEXT_PUBLIC_` dan tidak boleh diberi awalan itu: `service_role` melewati
   seluruh kebijakan RLS, dan hanya Route Handler di server yang memakainya.
   Bila lencananya tidak dipakai, nilai itu boleh dikosongkan dan sisa aplikasi
   tetap berjalan.
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
   sebelumnya di proyek itu: kesembilan berkas SQL, pg_cron, dan Anonymous
   sign-in.
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
  api/misi/x/       pengikut: penyegaran daftar pengikut akun resmi oleh admin
  api/admin/        lencana: pemberian dan pencabutan lencana oleh admin
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
  Panduan.tsx       halaman panduan: jam emas, rencana harian, algoritma, kebijakan
  DaftarMisi.tsx    kartu misi, penyusun kalimat pengajuan, dan tombol kirimnya
  KelolaLencana.tsx panel lencana milik admin di kartu profil orang lain
  Lencana.tsx       lencana yang berjajar di sebelah nama akun
  DaftarNotifikasi.tsx daftar suka, posting ulang, pengikut baru, dan pengajuan misi
  LencanaKabar.tsx  titik merah berisi jumlah kabar yang belum dibaca
  Kabar.tsx         kabar sekilas di sudut layar: berhasil, info, dan galat
  TombolTema.tsx    pengalih tema terang/gelap dalam dua bentuk
  Composer.tsx      kotak tulis komentar
  Avatar.tsx        foto profil bila ada, jika tidak avatar DiceBear
  PemilihBahasa.tsx pengalih Indonesia/Inggris dalam tiga bentuk
  TombolPasang.tsx  ajakan memasang aplikasi, muncul bila peramban menawarkannya
  DaftarSW.tsx      pendaftaran service worker
  menu.ts           lima tujuan navigasi, dipakai bilah samping dan bilah bawah
  Icons.tsx         kumpulan ikon SVG
  Brand.tsx         tanda visual aplikasi
lib/
  api.ts            seluruh baca-tulis ke Supabase dan pemetaan ke tipe aplikasi
  akun.ts           akun yang sedang masuk, dibaca di server sebelum merender
  algoritmaArsip.ts bacaan atas twitter/the-algorithm 2023: tahap, sumber, bobot
  algoritmaKini.ts  bacaan atas xai-org/x-algorithm 2026: tahap, aksi, rumus, Grok
  avatar.ts         avatar bawaan DiceBear yang dibangkitkan dari handle
  jamEmas.ts        jendela jam emas WIB dan hitungan potensi jangkauannya
  kebijakan.ts      masa hidup komentar, disamakan dengan basis data
  kreator.ts        program, syarat, dan larangan Creator Studio X
  lencana.ts        katalog lencana: kode, urutan tampil, dan keterangannya
  misi.ts           katalog misi: kalimat, langkah, dan penyusun teks pengajuan
  rencana.ts        enam langkah harian panduan dan penyimpanan centangnya
  tautan.ts         pengenalan dan perapian tautan X; penolak alamat lain
  tema.ts           tema terang/gelap: skrip pra-lukis, peralihan, warna bilah
  i18n/             daftar bahasa, kamus ID/EN, konteks React, dan teks berformat
  keamanan/         header keamanan beserta CSP, dan rem laju Route Handler
  supabase/         klien peramban, klien server, klien layanan, tipe, kredensial
  image.ts          pemangkasan dan pengecilan gambar di sisi peramban
  time.ts           format waktu dan angka mengikuti bahasa yang dipakai
  types.ts          tipe bersama
proxy.ts            penyegaran sesi Supabase dan header keamanan tiap permintaan
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

1. Menyimpan berkas build (`/_next/static/*`), ikon, dan `public/luring.js`,
   yang isinya tidak pernah berubah tanpa ganti nama berkas.
2. Menjawab permintaan halaman dengan `public/luring.html` ketika jaringan mati.
   Skrip temanya berkas terpisah (`luring.js`), bukan sebaris, supaya halaman
   itu tetap berjalan di bawah Content Security Policy aplikasi.

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
Di antarmuka ia tampil sebagai centang emas di sebelah nama, dan tombol hapus
ikut muncul pada komentar orang lain.

Siapa yang admin ditentukan `public.handle_admin()` di
`supabase/migrations/20260807150000_admin.sql`:

```sql
create or replace function public.handle_admin()
returns text[] language sql immutable parallel safe as $$
  select array['gaptekcat']::text[];
$$;
```

Pemicu `profiles_tandai_admin` menyalakan `is_admin` saat profil dengan handle
itu dibuat, jadi **@gaptekcat tetap menjadi admin walau akunnya baru
didaftarkan setelah migrasi dijalankan**. Pemicunya sengaja hanya berjalan pada
`INSERT`: kalau ikut berjalan saat handle diubah, siapa pun yang kelak mengambil
alih handle yang ditinggalkan akan mewarisi haknya juga.

Karena handle yang dipakai sebagai penanda, **daftarkan handle itu lebih dulu**.
Handle bersifat unik dan siapa pun bisa mengambilnya; yang lebih dulu memakai
`@gaptekcat` yang akan diangkat.

Akun resmi ini sebelumnya bernama `@CEOkomentar`. Karena pemicu pengangkatan
hanya berjalan pada `INSERT`, mengganti daftar di atas tidak menyentuh profil
yang sudah terdaftar — perpindahannya dikerjakan
`supabase/migrations/20260808160000_handle-admin-baru.sql`, yang mengganti
handle baris profilnya sekaligus. Basis data yang belum punya profil ber-handle
lama tidak terpengaruh berkas itu.

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
mengembalikan `is_admin`, `verified`, `lencana`, dan kedua penghitung pengikut
ke nilai lamanya untuk setiap perubahan yang datang dari sesi pengguna; perintah
tanpa `auth.uid()` — SQL Editor, migrasi, `service_role` — tetap bisa
mengubahnya.

## Misi dan lencana

Lencana tidak diberikan karena diminta, melainkan karena syaratnya diperiksa —
oleh seorang manusia. Misi pertama, dan sejauh ini satu-satunya, adalah
**mengikuti @gaptekcat di X**, dengan hadiah **centang biru**.

Akun X yang harus diikuti ditulis sekali di `lib/misi.ts` sebagai `AKUN_X`;
seluruh kalimat di kamus menyebutnya lewat isian `{akun}`, jadi menggantinya
cukup satu baris. Ia **bukan** handle admin di aplikasi ini walau namanya
sekarang sama — yang itu ditetapkan `public.handle_admin()` di basis data dan
berdiri sendiri.

### Bagaimana pengajuannya berjalan

Aplikasi tidak bertanya "apakah kamu sudah follow?" lewat kotak centang, dan
tidak pula percaya pada jawaban peramban. Yang terjadi:

1. Pemakai membuka **Misi**, menekan tombol yang mengantarnya ke profil
   @gaptekcat di X, lalu menekan Follow di sana.
2. Ia menempelkan **tautan profil X-nya sendiri** di kotak pada kartu misi —
   profil yang barusan menekan Follow. Bentuk apa pun diterima:
   `https://x.com/budi`, `x.com/budi`, `@budi`, atau `budi`; yang menunjuk
   sebuah postingan dan yang bukan alamat X ditolak sebelum tombolnya menyala.
3. Kartu misinya menyusun kalimat pengajuan:

   ```
   Sudah follow akun @gaptekcat #TwitterMini
   https://x.com/budi
   ```

   **Tulis di Twitter Mini** menuangkannya langsung ke kotak tulis di beranda,
   dengan tautan profilnya sudah terpisah sebagai lampiran — persis seperti
   tempelan tautan biasa. Tidak ada tombol salin: kalimatnya sudah utuh di
   kotak tulis begitu tombolnya ditekan, jadi papan klip tidak dilewati sama
   sekali.
4. Komentar itulah pengajuannya. Ia berdiri di beranda seperti komentar lain,
   dan **tiap admin mendapat kabarnya di daftar notifikasi** — satu baris
   "memposting pengajuan misi follow" yang membuka komentarnya bila ditekan.
   Kabar itu ditulis pemicu `notifikasi_klaim_misi()`, dan ikut hilang bersama
   komentarnya, entah dihapus atau habis umur 24 jamnya.
5. Admin membuka profil pengaju di aplikasi, mencocokkan tautan profil X-nya
   dengan daftar pengikut @gaptekcat, lalu menekan **Beri** pada baris centang
   biru di panel lencana.

Tagar **#TwitterMini** ikut di kalimatnya bukan sebagai hiasan. Aplikasi ini
tidak punya kotak cari — yang menyaring beranda hanyalah tagar yang ditekan —
jadi tanpa satu tagar bersama, admin harus menggulir seluruh beranda mencari
pengajuan di antara komentar biasa. Dengan tagar itu, menekannya sekali (di
kartu mana pun, atau di papan tren yang menghitungnya) menyisakan tepat daftar
pengajuan yang belum diputuskan. Bunyinya ditulis sekali di `lib/misi.ts`,
sebagai `TAGAR_KLAIM`.

Kalimat klaimnya **ikut bahasa antarmuka**, seperti teks lain di aplikasi ini:
yang memposting membaca kalimatnya dalam bahasanya sendiri, dan kalimat itu
tinggal di kamus sebagai `misi.klaim.kalimat`. Yang tetap sama di semua bahasa
hanya tagarnya — dan justru tagar itulah yang dipakai admin untuk menyaring,
jadi pengajuan berbahasa Indonesia dan berbahasa Inggris tetap berkumpul di satu
daftar yang sama.

#### Kenapa tidak diperiksa sendiri oleh aplikasi

Sampai versi sebelumnya ada tombol **Hubungkan X & verifikasi** yang mengantar
pemakai ke alur izin X (OAuth 2.0 + PKCE), menanyakan siapa pemilik tokennya,
lalu mencocokkan namanya ke daftar pengikut yang diunggah pengelola.

Yang menjadi masalah bukan bagian OAuth-nya, melainkan apa yang bisa ditanyakan
sesudahnya. `GET /2/users/:id/following` **tidak diberikan X kepada aplikasi
self-serve** — ia tinggal di kontrak enterprise — sehingga pengikutannya tidak
pernah bisa ditanyakan langsung, dan pencocokannya tetap bergantung pada daftar
yang diunggah manusia. Sejak Februari 2026 X juga menghapus tier gratisnya.
Yang tersisa dari alur itu hanyalah harga yang tetap dibayar pemakainya: satu
halaman izin pihak ketiga, satu aplikasi X yang harus didaftarkan pengelola, dan
tiga kredensial yang harus diisi — untuk sebuah keputusan yang ujungnya tetap
diambil manusia.

Karena itu bagian yang tidak menghasilkan apa-apa dihapus seluruhnya, dan yang
tersisa dibuat jujur: pemakai mengajukan, admin memutuskan. Rute
`/api/misi/x/mulai`, `/api/misi/x/kembali`, seluruh isi `lib/x/`, serta fungsi
`periksa_misi_x()` di basis data ikut dihapus — pintu yang tidak dipakai lagi
ditutup, apalagi pintu yang bisa menulis lencana.

### Panel lencana admin

Ada di kartu profil, dan **hanya di profil orang lain**: lencana sendiri tidak
diberikan sendiri, sekalipun oleh admin. Satu baris per lencana di katalog,
masing-masing dengan tombol **Beri** atau **Cabut**.

```
POST /api/admin/lencana
{ "pengguna": "<uuid>", "lencana": "biru", "beri": true }
→ { "lencana": ["biru"] }
```

Jawabannya adalah daftar lencana sasaran **setelah** perubahannya, jadi kartu
profil tidak perlu menebak hasilnya sendiri — dan nama pengaju yang sedang
berdiri di beranda ikut berganti centang tanpa memuat ulang.

Rutenya menolak permintaan lintas asal, menanyakan keadminan kepada basis data
lewat `apakah_admin()` — bukan kepada apa pun yang dikirim peramban — menjawab
404 untuk siapa pun yang bukan admin, dan direm di 120 perubahan per jam per
akun. Penulisannya sendiri tetap lewat `service_role`.

**Centang emas tidak bisa diberikan dari sini.** Ia cerminan peran: pemicu
`profiles_lencana_admin` memasangnya saat `is_admin` menyala dan melepasnya saat
padam. Memberikannya satu per satu berarti menaruh tanda "admin yang dapat
menghapus komentar siapa pun" pada akun yang tidak bisa melakukannya — dan
pemicu yang sama akan mencabutnya lagi pada perubahan `is_admin` berikutnya.
Karena itu barisnya tidak ditampilkan sama sekali di panel lencana: yang tampil
hanya `DIATUR` di `lib/lencana.ts` — lencana yang benar-benar berpindah tangan
lewat tombol — dan yang mengangkat admin tetap SQL Editor (lihat bagian
[Admin](#admin)). Rutenya tetap menolak centang emas dengan 409 kalau ada yang
memanggilnya langsung.

#### Apa yang dikerjakan `atur_lencana_admin()`

Selain menulis ke `lencana_pengguna`, ia menyesuaikan kemajuan misinya:

- **Beri** — bila lencananya kebetulan hadiah sebuah misi yang aktif, yang
  dipanggil adalah `selesaikan_misi()` dengan bukti `{"oleh": "admin"}`, jadi
  kartu misi pengaju berubah menjadi "Selesai" beserta kalimat "Diberikan admin
  setelah pengajuanmu diperiksa". Lencana yang bukan hadiah misi diberikan
  langsung lewat `beri_lencana()`.
- **Cabut** — `batalkan_misi()` melepas kemajuan misinya, lalu barisnya dihapus
  dari `lencana_pengguna` sekalian untuk lencana yang dulu diberikan langsung.

Tanpa penyesuaian itu kartu misi akan berkata "belum selesai" tepat di sebelah
lencana yang sudah menempel di nama pemiliknya.

Tiga hal yang membuatnya sulit diakali:

- **Peramban tidak ikut memutuskan.** Tabel `misi_pengguna` dan
  `lencana_pengguna` hanya punya kebijakan `select` untuk pemiliknya; tidak ada
  `insert`, `update`, maupun `delete` untuk peran `authenticated`. Kolom
  `profiles.lencana` dan `profiles.verified` dikembalikan ke nilai lamanya oleh
  pemicu untuk setiap `update` yang datang dari sesi pengguna.
- **Keadminan tidak pernah datang dari peramban.** Rutenya menanyakannya kepada
  basis data memakai sesi kuki yang sedang berjalan, dan `is_admin` sendiri tidak
  bisa dinyalakan dari aplikasi.
- **Pengajuannya publik.** Komentar klaim berdiri di beranda, bisa dilihat siapa
  saja, dan memuat tautan profil yang bisa dicocokkan siapa saja. Lencana yang
  diberikan tanpa pengajuan yang cocok akan terlihat.

### Menyegarkan daftar pengikut

Satu rute, khusus admin, dan seluruh isinya diganti sekali jalan — nama yang
tidak ikut terkirim berarti sudah tidak mengikuti. Daftar ini kini menjadi
catatan rujukan admin saat memeriksa pengajuan, bukan lagi pemutus otomatis.

```
POST /api/misi/x/pengikut
{ "teks": "@budi\nsiti_a, rahmat99" }        # tempelan mentah, atau
{ "daftar": ["budi", "siti_a", "rahmat99"] } # larik nama
```

Awalan `@` dilepas, pemisahnya spasi/koma/baris baru, huruf besar-kecil tidak
membedakan, dan nama yang bentuknya bukan username X dibuang tanpa membatalkan
sisanya. Jawabannya `{ "jumlah": 3, "disegarkan_at": "…" }`.

`GET /api/misi/x/pengikut` memulangkan keadaan sekarang: berapa nama yang
tercatat dan kapan terakhir disegarkan.

Daftar kosong **ditolak** kecuali dikirim bersama `"paksa": true`; tanpa
penjagaan itu satu unggahan yang gagal di tengah jalan bisa mengosongkan
tabelnya tanpa ada yang menyadarinya. Rute ini menolak permintaan lintas asal,
menanyakan keadminan kepada basis data, dan direm di dua belas penyegaran per
jam per akun.

Setiap penyegaran juga mengosongkan antrean tinjauan yang tersisa dari alur
lama: akun yang dulu sempat menghubungkan akun X-nya dan namanya baru saja masuk
daftar tetap mendapat lencananya. Antrean itu tidak bertambah lagi — yang baru
mengajukan lewat komentar, bukan lewat ikatan akun X.

### Menyalakannya

Satu nilai di `.env.local` (lihat `.env.example`):

```
SUPABASE_SERVICE_ROLE_KEY=...   # Project Settings → API → service_role
```

Tanpa nilai itu misinya tetap tampil beserta langkah-langkahnya, kalimat
pengajuannya tetap bisa diposting, tetapi tombol di panel lencana
menjawab "Lencana gagal disimpan" — tidak ada lencana yang bisa berpindah tangan
lewat jalan lain. Selebihnya aplikasi berjalan seperti biasa.

Kuncinya sengaja tanpa awalan `NEXT_PUBLIC_` — ia melewati seluruh kebijakan RLS
dan tidak boleh pernah sampai ke peramban. `lib/supabase/admin.ts` menolak
dijalankan di sana.

Tidak ada lagi yang perlu didaftarkan di X Developer Portal. `X_CLIENT_ID`,
`X_CLIENT_SECRET`, dan `APP_URL` tidak dipakai sama sekali dan boleh dihapus
dari environment variable mana pun.

### Menambah misi baru

Tiga langkah, dan tidak ada perubahan skema:

1. `insert into public.misi (kode, lencana, urutan) values ('kode-misi', 'kode-lencana', 2);`
2. Tambahkan lencananya di `lib/lencana.ts` (bila baru) dan misinya di
   `KATALOG` pada `lib/misi.ts`, beserta kalimatnya di `lib/i18n/kamus.ts`.
3. Tentukan cara memutuskannya di server: pemeriksa yang memanggil
   `selesaikan_misi()` dengan kunci `service_role`, atau — seperti misi pertama
   — keputusan admin lewat `atur_lencana_admin()`. Sebuah misi tidak pernah
   boleh ditandai selesai dari peramban.


## Keamanan

Yang dilakukan aplikasi ini untuk menjaga dirinya, dan yang sengaja tidak.

**Di basis data.** Row Level Security menyala di seluruh tabel, dan kebijakannya
ditulis per peran, bukan per rute. Kebijakan RLS menjawab "baris mana", jadi
pertanyaan "kolom mana" dijawab pemicu penjaga: penghitung suka, posting ulang,
dan pengikut hanya boleh ditulis pemicu bawaannya; `author_id` sebuah komentar
tidak bisa berpindah; handle akun resmi tidak bisa diambil alih lewat penyuntingan
profil; dan `is_admin`, `verified`, serta `lencana` selalu kembali ke nilai
lamanya bila perubahannya datang dari sesi pengguna. Pemicu tepercaya
membedakan dirinya lewat tanda transaksi yang tidak bisa dipasang dari
PostgREST. Penulisan komentar direm di dua belas per menit per akun.

**Di jalur permintaan.** `proxy.ts` memasang Content Security Policy bernonce
untuk setiap jawaban — `script-src 'self' 'nonce-…' 'strict-dynamic'`, tanpa
`unsafe-inline` — sehingga skrip yang tidak berasal dari aplikasi ini tidak akan
berjalan sekalipun berhasil disisipkan. Bersamanya ikut `frame-ancestors 'none'`,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` yang menutup kamera sampai pembayaran,
`Cross-Origin-Opener-Policy`, dan HSTS pada permintaan https. Halaman luring
memakai aturan tanpa nonce karena ia berkas statis; skripnya berkas terpisah dari
asal yang sama.

**Di rute admin.** Keduanya — pemberian lencana dan penyegaran daftar pengikut —
menolak permintaan lintas asal lewat header `Origin`, menanyakan keadminan
kepada basis data alih-alih kepada peramban, menjawab 404 untuk siapa pun yang
bukan admin, dan direm per akun maupun per alamat. Badan permintaannya dibatasi
ukurannya dan diperiksa bentuknya sebelum satu pun nilai diteruskan ke basis
data. Yang menulis tetap fungsi `SECURITY DEFINER` milik `service_role`, bukan
kueri lepas.

**Yang tidak dilakukan.** Tidak ada skrip pihak ketiga, tidak ada pelacak, dan
tidak ada permintaan ke luar selain ke Supabase — sejak alur izin X dihapus,
aplikasi ini tidak pernah menghubungi server X sama sekali. Kartu tautan X
digambar dari alamatnya sendiri tanpa memuat apa pun dari sana. Service worker
sengaja tidak menyimpan HTML halaman maupun jawaban Supabase, supaya tidak ada
komentar atau profil yang tertinggal di perangkat setelah pemakainya keluar.

**Yang perlu diingat.** Rem laju Route Handler hidup di memori proses, jadi
hitungannya per-instans; lapis yang tidak bisa dilewati ada di basis data.
Handle admin diberikan kepada yang lebih dulu mendaftarkannya — daftarkan lebih
dulu (lihat bagian [Admin](#admin)).

## Catatan

- Angka sosial memakai satu aturan di seluruh aplikasi (`angkaSosial` di
  `lib/time.ts`): utuh sampai 9.999, lalu disingkat satu desimal yang dipotong,
  bukan dibulatkan — 1.999.999 menjadi `1,9 jt`, bukan `2 jt`.
- Notifikasi 'ikut' tidak punya komentar yang membawanya pergi, jadi hanya jenis
  itu yang menumpuk; `sapu_notifikasi_lama()` dijadwalkan tiap hari bila pg_cron
  tersedia. Kabar 'misi' menggantung pada komentarnya seperti 'suka' dan
  'ulang', jadi ia pergi sendiri saat pengajuannya habis umur.
- Jam emas adalah pola kebiasaan, bukan ramalan: angkanya tetap dari hari ke
  hari (`lib/jamEmas.ts`), tidak dihitung dari data pemakaian aplikasi ini, dan
  selalu memakai WIB berapa pun jam perangkat pembacanya.
- Avatar bawaan memakai gaya *Adventurer Neutral* karya Lisa Wischofsky
  (CC BY 4.0) lewat DiceBear. Keterangannya ada di kaki panel kanan aplikasi.
- Gambar tidak pernah dikirim mentah-mentah: pemangkasan dan pengecilan memakai
  `<canvas>` di peramban, dan yang diunggah hanya hasil akhirnya.
- Hak akses seluruhnya bersandar pada RLS. Kunci yang dipakai peramban adalah
  kunci anon, dan tanpa sesi tidak ada satu baris pun yang bisa dibaca.
- Lencana tidak pernah lahir dari peramban. Yang bisa memberikannya hanya fungsi
  `SECURITY DEFINER` yang haknya dicabut dari `public` lalu diberikan kepada
  `service_role` saja.
- Tombol hapus pada komentar orang lain hanya muncul untuk admin, tetapi yang
  benar-benar menentukan tetap kebijakan RLS `DELETE` di basis data.
