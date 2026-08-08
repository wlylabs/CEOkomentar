import type { Bahasa } from "./bahasa";

/**
 * Seluruh teks antarmuka, satu kunci per kalimat.
 *
 * Kamus Indonesia yang menentukan bentuk kuncinya; kamus Inggris diketikkan
 * sebagai `Record<KunciTeks, string>` sehingga kunci yang lupa diterjemahkan
 * atau salah ketik langsung ditolak TypeScript.
 *
 * Isian ditulis `{nama}` dan diisi lewat argumen kedua `teks()`. Beberapa
 * kalimat memuat `<code>`, `<strong>`, atau `<kbd>`; itu dirender komponen
 * lewat `tk()` (lihat kaya.tsx), bukan `dangerouslySetInnerHTML`.
 */
const KAMUS_ID = {
  /* ---------------------------------------------------------------- umum */
  "umum.merek": "Twitter Mini",
  "umum.batal": "Batal",
  "umum.hapus": "Hapus",
  "umum.simpan": "Simpan",
  "umum.cobaLagi": "Coba lagi",
  "umum.memuat": "Memuat…",
  "umum.menyimpan": "Menyimpan…",
  "umum.memproses": "Memproses…",
  "umum.jumlahKomentar": "{jumlah} komentar",

  /* -------------------------------------------------------------- bahasa */
  "bahasa.label": "Bahasa",
  "bahasa.ganti": "Ganti bahasa",
  "bahasa.pilih": "Pilih bahasa: {bahasa}",

  /* --------------------------------------------------------------- meta */
  "meta.deskripsi":
    "Antarmuka bergaya Twitter: komentar berumur 24 jam, jam emas audiens Indonesia, profil, notifikasi, misi lencana, dan tren.",
  "meta.judulSandi": "Kata sandi baru — Twitter Mini",
  "meta.judulUtas": "Komentar @{handle} — Twitter Mini",
  "meta.deskripsiUtas": "“{kutipan}” — @{handle} di Twitter Mini.",

  /* ----------------------------------------------------------- navigasi */
  "nav.utama": "Navigasi utama",
  "nav.beranda": "Beranda",
  "nav.misi": "Misi",
  "nav.notifikasi": "Notifikasi",
  "nav.profil": "Profil",
  "nav.temaTerang": "Tema terang",
  "nav.temaGelap": "Tema gelap",
  "nav.keTemaTerang": "Beralih ke tema terang",
  "nav.keTemaGelap": "Beralih ke tema gelap",
  "nav.keluar": "Keluar",
  "nav.keluarLabel": "Keluar dari akun",
  "nav.tulis": "Tulis komentar",
  "nav.tulisBaru": "Tulis komentar baru",
  "nav.bukaProfil": "Buka profil",
  "nav.kembali": "Kembali ke beranda",

  /* ------------------------------------------------------------ beranda */
  "beranda.judul": "Beranda",
  "beranda.memuat": "Memuat komentar…",
  "beranda.masa": "Hilang setelah {jam} jam",

  /* ----------------------------------------------------------------- tab */
  "tab.komentar": "Komentar",
  "tab.disukai": "Disukai",
  "tab.saringan": "Saringan komentar",

  /* ------------------------------------------------------------ komposer */
  "komposer.bawaan": "Apa komentarmu?",
  "komposer.komentar": "Tulis komentar",
  "komposer.kirim": "Kirim",
  "komposer.petunjuk":
    "Tekan <kbd>Ctrl</kbd> + <kbd>Enter</kbd> untuk mengirim",
  "komposer.sisa": "{sisa} karakter tersisa",
  "komposer.tautan": "Tautan X",
  "komposer.tautanLabel": "Tempel tautan X",
  "komposer.tautanBayangan": "https://x.com/i/status/2085707618681864284",
  "komposer.tautanLampir": "Lampirkan",
  "komposer.tautanBuang": "Buang tautan",
  "komposer.tautanAsing":
    "Hanya tautan X (Twitter) yang bisa ditempel, misalnya https://x.com/i/status/2085707618681864284",

  /* ---------------------------------------------------------------- tautan */
  "tautan.posting": "Postingan di X",
  "tautan.postingMilik": "Postingan @{handle} di X",
  "tautan.profil": "Profil @{handle} di X",
  "tautan.buka": "Buka di X",

  /* -------------------------------------------------------------- daftar */
  "daftar.label": "Daftar {judul}",
  "daftar.muatLagi": "Muat lebih banyak",
  "daftar.memuatKomentar": "Memuat komentar",
  "kosong.judul": "Belum ada yang ditampilkan",
  "kosong.cari": "Tidak ada komentar yang cocok dengan “{kueri}”.",
  "kosong.disukai": "Komentar yang kamu sukai akan muncul di sini.",
  "kosong.komentar": "Komentar yang kamu tulis akan muncul di sini.",
  "kosong.profilOrang": "Tidak ada komentar @{handle} dalam 24 jam terakhir.",
  "kosong.beranda": "Belum ada komentar sama sekali. Tulis yang pertama.",
  "kosong.hapusCari": "Hapus pencarian",

  /* ------------------------------------------------------------ komentar */
  "komentar.konfirmasiLabel": "Konfirmasi hapus",
  "komentar.konfirmasi": "Hapus komentar ini?",
  "komentar.konfirmasiAdmin":
    "Hapus komentar @{handle}? Kamu melakukannya sebagai admin.",
  "komentar.terhapusPada": "Terhapus otomatis pada {waktu}",
  "aksi.ulang": "Posting ulang",
  "aksi.batalUlang": "Batalkan posting ulang",
  "aksi.suka": "Suka",
  "aksi.batalSuka": "Batalkan suka",
  "aksi.salinTautan": "Salin tautan",
  "aksi.tayangJumlah": "{jumlah} tayangan",
  "aksi.lainnya": "Tindakan lain",
  "aksi.tutupMenu": "Tutup menu",
  "lencana.biru": "Akun terverifikasi — sudah mengikuti akun resmi di X",
  "lencana.biruNama": "Centang biru",
  "lencana.emas":
    "Akun resmi — admin yang dapat menghapus komentar siapa pun",
  "lencana.emasNama": "Centang emas",

  /* ----------------------------------------------------------------- misi */
  "misi.sub": "Selesaikan misinya, dapatkan lencananya.",
  "misi.memuat": "Memuat daftar misi…",
  "misi.kosongJudul": "Belum ada misi",
  "misi.kosongTeks": "Misi baru akan muncul di sini begitu dibuka.",
  "misi.hadiah": "Hadiah: {lencana}",
  "misi.status.belum": "Belum selesai",
  "misi.status.menunggu": "Sedang ditinjau",
  "misi.status.selesai": "Selesai",
  "misi.bukti": "Terverifikasi lewat akun X @{username}.",
  "misi.buktiAdmin": "Diberikan admin setelah pengajuanmu diperiksa.",
  "misi.ikutiX.judul": "Ikuti akun resmi di X",
  "misi.ikutiX.teks":
    "Centang biru diberikan kepada akun yang mengikuti @CEOkomentar di X. Ikuti akunnya, lalu posting pengajuanmu di sini — admin yang mencocokkannya dengan daftar pengikut akun resmi.",
  "misi.ikutiX.menunggu":
    "Pengajuanmu sudah tercatat dan sedang ditinjau. Kalau namamu ada di daftar pengikut @CEOkomentar, centang birunya dipasang admin — kamu tidak perlu menekan apa-apa lagi.",
  "misi.ikutiX.selesai":
    "Centang biru sudah menempel di namamu. Selama kamu masih mengikuti @CEOkomentar, lencananya tetap ada.",
  "misi.ikutiX.langkah1": "Buka profil @CEOkomentar di X, lalu tekan Follow.",
  "misi.ikutiX.langkah2":
    "Tempel tautan profil X-mu di kotak bawah ini — profil yang barusan menekan Follow, karena nama itulah yang akan dicari di daftar pengikut.",
  "misi.ikutiX.langkah3":
    "Posting kalimatnya di Twitter Mini apa adanya, tagar #{tagar} sekalian — tagar itulah yang membuat pengajuanmu terkumpul dan terbaca admin. Komentar itu pengajuanmu; admin mencocokkan namamu, lalu memasang centangnya.",
  "misi.ikutiX.buka": "Buka @{akun} di X",
  "misi.klaim.label": "Tautan profil X-mu",
  "misi.klaim.bayangan": "https://x.com/namamu",
  "misi.klaim.asing":
    "Yang ditunggu tautan profil X, misalnya https://x.com/namamu — bukan tautan postingan dan bukan alamat lain.",
  "misi.klaim.kurang": "(tautan profilmu belum diisi)",
  "misi.klaim.salin": "Salin teks",
  "misi.klaim.tulis": "Tulis di Twitter Mini",
  "misi.klaim.catatan":
    "Aplikasi ini tidak meminta izin apa pun atas akun X-mu. Yang dibaca admin cuma komentar yang kamu posting sendiri, dan tautan profil di dalamnya yang dicocokkan dengan daftar pengikut @CEOkomentar.",

  /* --------------------------------------------------------------- kelola */
  "kelola.label": "Lencana akun ini",
  "kelola.judul": "Lencana",
  "kelola.sub":
    "Kamu admin, jadi lencana @{handle} bisa kamu atur dari sini. Cocokkan dulu pengajuan #{tagar} miliknya dengan daftar pengikut akun resmi.",
  "kelola.beri": "Beri",
  "kelola.cabut": "Cabut",
  "kelola.ada": "Dimiliki",
  "kelola.tiada": "Tidak dimiliki",
  "kelola.peran": "Mengikuti peran admin; hanya bisa diubah dari basis data.",
  "kelola.diberikan": "{lencana} diberikan kepada @{handle}",
  "kelola.dicabut": "{lencana} dicabut dari @{handle}",

  /* ----------------------------------------------------------------- utas */
  "utas.judul": "Komentar",
  "utas.memuat": "Memuat komentar…",
  "utas.takAdaJudul": "Komentar tidak ditemukan",
  "utas.takAdaTeks":
    "Komentar ini sudah dihapus atau umurnya sudah lewat {jam} jam.",
  "utas.keBeranda": "Ke beranda",

  /* ----------------------------------------------------------- notifikasi */
  "notif.sub": "Suka, posting ulang, dan pengikut baru.",
  "notif.suka": "menyukai komentarmu",
  "notif.ulang": "memposting ulang komentarmu",
  "notif.ikut": "mulai mengikutimu",
  "notif.belumDibaca": "{jumlah} kabar belum dibaca",
  "notif.kosongJudul": "Belum ada kabar",
  "notif.kosongTeks":
    "Begitu ada yang menyukai, memposting ulang, atau mengikutimu, kabarnya muncul di sini.",

  /* ----------------------------------------------------------------- tren */
  "tren.judul": "Sedang ramai",
  "tren.jumlah": "{komentar} komentar · {penulis} orang",
  "tren.masa": "Dihitung dari 24 jam terakhir.",

  /* ------------------------------------------------------------ jam emas */
  "jam.judul": "Jam emas",
  "jam.potensi": "Potensi viral",
  "jam.dari": "dari 100",
  "jam.tingkat.puncak": "Puncak",
  "jam.tingkat.tinggi": "Tinggi",
  "jam.tingkat.bagus": "Cukup bagus",
  "jam.tingkat.sedang": "Sedang",
  "jam.tingkat.sepi": "Sepi",
  "jam.jendela.pagi": "Pagi",
  "jam.jendela.siang": "Siang",
  "jam.jendela.malam": "Sore–Malam",
  "jam.catatan.pagi": "Puncak tinggi, terkuat {inti}",
  "jam.catatan.siang": "Cukup bagus, jeda makan siang",
  "jam.catatan.malam": "Puncak paling stabil dan paling lama",
  "jam.berlangsung": "Jam emas {jendela} sedang berlangsung",
  "jam.inti": "Sedang di bagian terkuatnya",
  "jam.sisa": "Berakhir {waktu} · {sisa} lagi",
  "jam.berikut": "Berikutnya {jendela} pukul {waktu}",
  "jam.berikutBesok": "Berikutnya {jendela} pukul {waktu} besok",
  "jam.jarak": "{sisa} lagi",
  "jam.ringkas.kini": "{jendela} sampai {waktu}, {sisa} lagi",
  "jam.ringkas.nanti": "{jendela} mulai {waktu}, {sisa} lagi",
  "jam.saran.kirim": "Waktu terbaik untuk mengirim komentar.",
  "jam.saran.layak": "Layak dikirim, tapi yang terbaik simpan untuk jam puncak.",
  "jam.saran.tunda": "Tunda dulu kalau bisa — {jendela} jauh lebih ramai.",
  "jam.hariTerbaik": "Hari terbaik: Selasa–Kamis",
  "jam.hari.terbaik": "Hari ini termasuk hari terkuat.",
  "jam.hari.biasa": "Hari ini sedang-sedang saja.",
  "jam.hari.lemah": "Akhir pekan — jangkauannya cenderung turun, apalagi pagi.",
  "jam.kurva": "Potensi tiap jam sepanjang hari ini, waktu WIB",
  "jam.kurvaJam": "Pukul {waktu} · potensi {skor} dari 100",
  "jam.hariLabel": "Kekuatan tiap hari dalam sepekan",
  "jam.hariIniLabel": "hari ini",
  "jam.zona": "Waktu WIB (UTC+7), mengikuti kebiasaan audiens X Indonesia.",
  "hari.0": "Min",
  "hari.1": "Sen",
  "hari.2": "Sel",
  "hari.3": "Rab",
  "hari.4": "Kam",
  "hari.5": "Jum",
  "hari.6": "Sab",

  /* -------------------------------------------------------------- pasang */
  "pasang.judul": "Pasang aplikasinya",
  "pasang.teks":
    "Tambahkan ke layar utama supaya terbuka seperti aplikasi biasa, lengkap dengan ikonnya sendiri.",
  "pasang.tombol": "Pasang",

  /* ---------------------------------------------------------- panel kanan */
  "rel.label": "Panel samping",
  "rel.ringkasan": "Ringkasan aktivitas",
  "rel.komentar": "Komentar",
  "rel.disukai": "Disukai",
  "rel.sukaDiterima": "Suka diterima",
  "rel.ulangDiterima": "Posting ulang diterima",
  "rel.kaki":
    "Twitter Mini — profil dan feed komentar dengan data tersimpan di Supabase.",
  "rel.kreditAvatar":
    "Avatar bawaan memakai gaya Adventurer Neutral karya Lisa Wischofsky (CC BY 4.0) lewat DiceBear.",

  /* -------------------------------------------------------------- profil */
  "profil.label": "Profil",
  "profil.edit": "Edit profil",
  "profil.gantiSampul": "Ganti sampul",
  "profil.unggahSampul": "Unggah sampul",
  "profil.hapusSampul": "Hapus sampul",
  "profil.gantiFoto": "Ganti foto profil",
  "profil.unggahFoto": "Unggah foto profil",
  "profil.fotoProfil": "Foto profil",
  "profil.sampul": "Sampul",
  "profil.gantiFotoSingkat": "Ganti foto",
  "profil.unggahFotoSingkat": "Unggah foto",
  "profil.hapusFoto": "Hapus foto",
  "profil.bantuanFoto":
    "Dipangkas persegi dari bagian tengah, lalu dikecilkan ke 400 px.",
  "profil.bantuanSampul":
    "JPG, PNG, atau WebP hingga 8 MB. Dipangkas 3:1 lalu dikecilkan ke 1500 × 500 px.",
  "profil.nama": "Nama",
  "profil.bio": "Bio",
  "profil.lokasi": "Lokasi",
  "profil.bergabung": "Bergabung {waktu}",
  "profil.mengikuti": "Mengikuti",
  "profil.pengikut": "Pengikut",
  "profil.buka": "Buka profil @{handle}",
  "profil.ikuti": "Ikuti",
  "profil.sedangMengikuti": "Mengikuti",
  "profil.berhentiIkuti": "Berhenti mengikuti",
  "profil.komentar": "Komentar",
  "profil.sukaDiterima": "Suka diterima",
  "profil.galatIzin": "Tidak punya izin menyimpan perubahan ini.",
  "profil.galatSimpan": "Profil gagal disimpan.",

  /* ---------------------------------------------------------------- foto */
  "foto.bukanGambar": "Berkas yang dipilih bukan gambar.",
  "foto.terlaluBesar": "Ukuran gambar maksimal 8 MB.",
  "foto.tidakTerbaca": "Gambar tidak dapat dibaca.",
  "foto.tanpaKanvas": "Peramban tidak mendukung pemrosesan gambar.",
  "foto.gagalProses": "Gambar gagal diproses. Coba berkas lain.",
  "foto.hasilBesar": "Hasil olahan masih terlalu besar. Coba gambar lain.",

  /* --------------------------------------------------------------- pesan */
  "pesan.komentarTerkirim": "Komentar terkirim",
  "pesan.komentarDihapus": "Komentar dihapus",
  "pesan.mulaiMengikuti": "Mulai mengikuti @{handle}",
  "pesan.berhentiMengikuti": "Berhenti mengikuti @{handle}",
  "pesan.profilTakDitemukan": "Tidak ada akun dengan handle @{handle}",
  "pesan.tautanDisalin": "Tautan komentar disalin",
  "pesan.teksDisalin": "Teks disalin. Tinggal ditempel di kotak tulis.",
  "pesan.papanKlipDitolak": "Peramban menolak akses papan klip",
  "pesan.profilDiperbarui": "Profil diperbarui",
  "pesan.profilGagal": "Profil gagal disimpan",
  "pesan.tutup": "Tutup pesan",

  /* --------------------------------------------------------------- galat */
  "galat.judul": "Komentar tidak bisa dimuat",
  "galat.koneksi": "Koneksi ke server terputus.",
  "galat.muatKomentar": "Komentar gagal dimuat.",
  "galat.muatLagi": "Gagal memuat komentar berikutnya.",
  "galat.kirimKomentar": "Komentar gagal dikirim.",
  "galat.terlaluCepat":
    "Terlalu banyak komentar dalam waktu singkat. Tunggu sebentar, lalu kirim lagi.",
  "galat.suka": "Suka gagal disimpan.",
  "galat.ulang": "Posting ulang gagal disimpan.",
  "galat.ikut": "Perubahan pengikut gagal disimpan.",
  "galat.muatNotifikasi": "Notifikasi gagal dimuat.",
  "galat.muatMisi": "Daftar misi gagal dimuat.",
  "galat.lencana": "Lencana gagal disimpan.",
  "galat.hapusKomentar": "Komentar gagal dihapus.",

  /* -------------------------------------------------------- dialog keluar */
  "keluar.judul": "Keluar dari akun tamu?",
  "keluar.teks":
    "Akun tamu tidak punya email atau kata sandi, jadi sesi ini tidak bisa dimasuki lagi setelah keluar. Komentar yang sudah terkirim tetap tampil sampai umurnya habis, tapi kamu tidak akan bisa menyuntingnya lagi. Buat akun dulu kalau ingin menyimpannya.",
  "keluar.tetap": "Tetap di sini",
  "keluar.keluar": "Keluar",

  /* ------------------------------------------------------------- gerbang */
  "gerbang.judulMasuk": "Masuk ke akunmu",
  "gerbang.judulDaftar": "Buat akun baru",
  "gerbang.judulLupa": "Atur ulang kata sandi",
  "gerbang.subLupa":
    "Masukkan email akunmu. Kami kirimkan tautan untuk membuat kata sandi baru.",
  "gerbang.sub": "Komentar dan profilmu tersimpan di akun ini.",
  "gerbang.nama": "Nama tampilan",
  "gerbang.handle": "Handle",
  "gerbang.email": "Email",
  "gerbang.sandi": "Kata sandi",
  "gerbang.sandiMinimal": "Minimal {jumlah} karakter.",
  "gerbang.tombolMasuk": "Masuk",
  "gerbang.tombolDaftar": "Daftar",
  "gerbang.tombolTautan": "Kirim tautan",
  "gerbang.atau": "atau",
  "gerbang.tamu": "Masuk sebagai tamu",
  "gerbang.catatanTamu":
    "Tanpa email dan kata sandi. Kamu bisa langsung menulis komentar, dan akun tamu bisa diubah jadi permanen kapan saja dari dalam aplikasi.",
  "gerbang.lupaSandi": "Lupa kata sandi?",
  "gerbang.belumPunya": "Belum punya akun?",
  "gerbang.sudahPunya": "Sudah punya akun?",
  "gerbang.kembaliMasuk": "Kembali ke halaman masuk",
  "gerbang.lihatSandi": "Tampilkan kata sandi",
  "gerbang.sembunyikanSandi": "Sembunyikan kata sandi",
  "gerbang.namaTamu": "Tamu {nomor}",
  "gerbang.namaWajib": "Nama tampilan wajib diisi.",
  "gerbang.handleSalah":
    "Handle hanya boleh huruf, angka, dan garis bawah (3–15 karakter).",
  "gerbang.handleTerpakai": "Handle itu sudah dipakai orang lain.",
  "gerbang.kabarLupa":
    "Kalau email itu terdaftar, tautan penggantian kata sandi sudah dikirim.",
  "gerbang.kabarDaftar":
    "Akun dibuat. Buka tautan konfirmasi yang kami kirim ke emailmu untuk mulai memakai akun.",
  "handle.kosong": "3–15 karakter: huruf, angka, atau garis bawah.",
  "handle.salah": "Hanya huruf, angka, dan garis bawah, 3–15 karakter.",
  "handle.memeriksa": "Memeriksa ketersediaan…",
  "handle.tersedia": "@{handle} masih tersedia.",
  "handle.terpakai": "@{handle} sudah dipakai.",

  /* ---------------------------------------------------------- galat auth */
  "galatAuth.kredensial": "Email atau kata sandi salah.",
  "galatAuth.belumKonfirmasi":
    "Email belum dikonfirmasi. Buka tautan yang kami kirim ke kotak masukmu.",
  "galatAuth.sudahTerdaftar": "Email ini sudah terdaftar. Coba masuk saja.",
  "galatAuth.sandiPendek": "Kata sandi minimal {jumlah} karakter.",
  "galatAuth.emailSalah": "Format email tidak dikenali.",
  "galatAuth.batasan": "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  "galatAuth.tamuMati":
    "Masuk sebagai tamu belum diaktifkan. Nyalakan Anonymous Sign-Ins di Supabase Dashboard → Authentication → Sign In / Providers.",
  "galatAuth.jaringan":
    "Tidak bisa menghubungi server. Periksa koneksi dan alamat Supabase.",
  "galatAuth.belumSiap": "Supabase belum dikonfigurasi.",
  "galatAuth.tautanRusak": "Tautan tidak lengkap atau sudah kedaluwarsa.",

  /* ---------------------------------------------------------- bilah tamu */
  "tamu.label": "Akun tamu",
  "tamu.teks":
    "Kamu memakai <strong>akun tamu</strong>. Komentarmu tersimpan seperti biasa, tapi akunnya hanya hidup di peramban ini — sekali keluar, tidak bisa dimasuki lagi.",
  "tamu.buatAkun": "Buat akun",
  "tamu.tutupForm": "Tutup form buat akun",
  "tamu.bantuan":
    "Tambahkan email dan kata sandi. Komentar, profil, dan foto yang sudah ada tetap milik akun yang sama.",
  "tamu.jadikan": "Jadikan permanen",
  "tamu.emailSalah": "Masukkan email yang bisa dihubungi.",
  "tamu.emailDipakai": "Email itu sudah dipakai akun lain.",
  "tamu.cekEmail": "Cek emailmu untuk mengonfirmasi alamat itu",
  "tamu.berhasil": "Akun tamu berhasil dijadikan permanen",

  /* ---------------------------------------------------------- sandi baru */
  "sandi.judul": "Buat kata sandi baru",
  "sandi.kedaluwarsa":
    "Tautan pemulihan sudah kedaluwarsa atau belum dibuka dari email. Minta tautan baru dari halaman masuk.",
  "sandi.sub": "Kata sandi baru langsung berlaku untuk seluruh perangkat.",
  "sandi.baru": "Kata sandi baru",
  "sandi.ulangi": "Ulangi kata sandi",
  "sandi.belumSama": "Dua isian kata sandi belum sama.",
  "sandi.simpan": "Simpan kata sandi",

  /* -------------------------------------------------------------- setup */
  "setup.judul": "Supabase belum terhubung",
  "setup.sub":
    "Aplikasi ini menyimpan akun, komentar, dan foto profil di Supabase. Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi dua nilai di bawah, lalu jalankan ulang server pengembangan.",
  "setup.galat":
    "Jangan lupa menjalankan berkas SQL di <code>supabase/migrations/</code> lewat SQL Editor agar tabel, izin, dan bucket penyimpanannya terbentuk.",

  /* --------------------------------------------------------------- waktu */
  "waktu.detik": "{nilai}d",
  "waktu.menit": "{nilai}m",
  "waktu.jam": "{nilai}j",
  "waktu.hari": "{nilai}h",
  "waktu.sisaMenit": "{nilai}m lagi",
  "waktu.sisaJam": "{nilai}j lagi",
} as const;

export type KunciTeks = keyof typeof KAMUS_ID;

const KAMUS_EN: Record<KunciTeks, string> = {
  /* ---------------------------------------------------------------- umum */
  "umum.merek": "Twitter Mini",
  "umum.batal": "Cancel",
  "umum.hapus": "Delete",
  "umum.simpan": "Save",
  "umum.cobaLagi": "Try again",
  "umum.memuat": "Loading…",
  "umum.menyimpan": "Saving…",
  "umum.memproses": "Processing…",
  "umum.jumlahKomentar": "{jumlah} comments",

  /* -------------------------------------------------------------- bahasa */
  "bahasa.label": "Language",
  "bahasa.ganti": "Change language",
  "bahasa.pilih": "Choose language: {bahasa}",

  /* --------------------------------------------------------------- meta */
  "meta.deskripsi":
    "A Twitter-style interface: comments that live 24 hours, golden hours for the Indonesian audience, profiles, notifications, badge missions, and trends.",
  "meta.judulSandi": "New password — Twitter Mini",
  "meta.judulUtas": "@{handle}'s comment — Twitter Mini",
  "meta.deskripsiUtas": "“{kutipan}” — @{handle} on Twitter Mini.",

  /* ----------------------------------------------------------- navigasi */
  "nav.utama": "Main navigation",
  "nav.beranda": "Home",
  "nav.misi": "Missions",
  "nav.notifikasi": "Notifications",
  "nav.profil": "Profile",
  "nav.temaTerang": "Light theme",
  "nav.temaGelap": "Dark theme",
  "nav.keTemaTerang": "Switch to the light theme",
  "nav.keTemaGelap": "Switch to the dark theme",
  "nav.keluar": "Log out",
  "nav.keluarLabel": "Log out of your account",
  "nav.tulis": "Write a comment",
  "nav.tulisBaru": "Write a new comment",
  "nav.bukaProfil": "Open profile",
  "nav.kembali": "Back to home",

  /* ------------------------------------------------------------ beranda */
  "beranda.judul": "Home",
  "beranda.memuat": "Loading comments…",
  "beranda.masa": "Gone after {jam} hours",

  /* ----------------------------------------------------------------- tab */
  "tab.komentar": "Comments",
  "tab.disukai": "Likes",
  "tab.saringan": "Comment filters",

  /* ------------------------------------------------------------ komposer */
  "komposer.bawaan": "What's your comment?",
  "komposer.komentar": "Write a comment",
  "komposer.kirim": "Post",
  "komposer.petunjuk": "Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to post",
  "komposer.sisa": "{sisa} characters left",
  "komposer.tautan": "X link",
  "komposer.tautanLabel": "Paste an X link",
  "komposer.tautanBayangan": "https://x.com/i/status/2085707618681864284",
  "komposer.tautanLampir": "Attach",
  "komposer.tautanBuang": "Remove link",
  "komposer.tautanAsing":
    "Only X (Twitter) links can be pasted, for example https://x.com/i/status/2085707618681864284",

  /* ---------------------------------------------------------------- tautan */
  "tautan.posting": "Post on X",
  "tautan.postingMilik": "@{handle}'s post on X",
  "tautan.profil": "@{handle} on X",
  "tautan.buka": "Open on X",

  /* -------------------------------------------------------------- daftar */
  "daftar.label": "{judul} list",
  "daftar.muatLagi": "Load more",
  "daftar.memuatKomentar": "Loading comments",
  "kosong.judul": "Nothing to show yet",
  "kosong.cari": "No comments match “{kueri}”.",
  "kosong.disukai": "Comments you like will show up here.",
  "kosong.komentar": "Comments you write will show up here.",
  "kosong.profilOrang": "Nothing from @{handle} in the last 24 hours.",
  "kosong.beranda": "No comments at all yet. Write the first one.",
  "kosong.hapusCari": "Clear the search",

  /* ------------------------------------------------------------ komentar */
  "komentar.konfirmasiLabel": "Confirm deletion",
  "komentar.konfirmasi": "Delete this comment?",
  "komentar.konfirmasiAdmin":
    "Delete @{handle}'s comment? You are doing this as an admin.",
  "komentar.terhapusPada": "Deleted automatically at {waktu}",
  "aksi.ulang": "Repost",
  "aksi.batalUlang": "Undo repost",
  "aksi.suka": "Like",
  "aksi.batalSuka": "Undo like",
  "aksi.salinTautan": "Copy link",
  "aksi.tayangJumlah": "{jumlah} views",
  "aksi.lainnya": "More actions",
  "aksi.tutupMenu": "Close menu",
  "lencana.biru": "Verified account — follows the official account on X",
  "lencana.biruNama": "Blue check",
  "lencana.emas": "Official account — admin, can delete anyone's comment",
  "lencana.emasNama": "Gold check",

  /* ----------------------------------------------------------------- misi */
  "misi.sub": "Finish the mission, earn the badge.",
  "misi.memuat": "Loading the mission list…",
  "misi.kosongJudul": "No missions yet",
  "misi.kosongTeks": "New missions will show up here as they open.",
  "misi.hadiah": "Reward: {lencana}",
  "misi.status.belum": "Not finished",
  "misi.status.menunggu": "Under review",
  "misi.status.selesai": "Done",
  "misi.bukti": "Verified through the X account @{username}.",
  "misi.buktiAdmin": "Awarded by an admin after your claim was checked.",
  "misi.ikutiX.judul": "Follow the official account on X",
  "misi.ikutiX.teks":
    "The blue check goes to accounts that follow @CEOkomentar on X. Follow it, then post your claim here — an admin matches it against the official account's follower list.",
  "misi.ikutiX.menunggu":
    "Your claim is recorded and under review. If your name is on @CEOkomentar's follower list, an admin puts the blue check on it — nothing left for you to press.",
  "misi.ikutiX.selesai":
    "The blue check is on your name. It stays as long as you keep following @CEOkomentar.",
  "misi.ikutiX.langkah1": "Open @CEOkomentar on X and press Follow.",
  "misi.ikutiX.langkah2":
    "Paste the link to your X profile in the box below — the profile that just pressed Follow, since that is the name looked up in the follower list.",
  "misi.ikutiX.langkah3":
    "Post the sentence on Twitter Mini as it is, #{tagar} included — that tag is what gathers claims where an admin can read them. That comment is your claim; an admin matches your name and puts the check on it.",
  "misi.ikutiX.buka": "Open @{akun} on X",
  "misi.klaim.label": "Link to your X profile",
  "misi.klaim.bayangan": "https://x.com/yourname",
  "misi.klaim.asing":
    "A link to an X profile is expected, like https://x.com/yourname — not a link to a post, and not another address.",
  "misi.klaim.kurang": "(your profile link is still empty)",
  "misi.klaim.salin": "Copy text",
  "misi.klaim.tulis": "Write it on Twitter Mini",
  "misi.klaim.catatan":
    "This app asks for no access at all to your X account. All an admin reads is the comment you posted yourself, and the profile link inside it that gets matched against @CEOkomentar's follower list.",

  /* --------------------------------------------------------------- kelola */
  "kelola.label": "Badges on this account",
  "kelola.judul": "Badges",
  "kelola.sub":
    "You are an admin, so @{handle}'s badges are yours to set here. Match their #{tagar} claim against the official follower list first.",
  "kelola.beri": "Award",
  "kelola.cabut": "Revoke",
  "kelola.ada": "Held",
  "kelola.tiada": "Not held",
  "kelola.peran": "Follows the admin role; only the database can change it.",
  "kelola.diberikan": "{lencana} awarded to @{handle}",
  "kelola.dicabut": "{lencana} revoked from @{handle}",

  /* ----------------------------------------------------------------- utas */
  "utas.judul": "Comment",
  "utas.memuat": "Loading the comment…",
  "utas.takAdaJudul": "Comment not found",
  "utas.takAdaTeks":
    "This comment was deleted or is already older than {jam} hours.",
  "utas.keBeranda": "Go home",

  /* ----------------------------------------------------------- notifikasi */
  "notif.sub": "Likes, reposts, and new followers.",
  "notif.suka": "liked your comment",
  "notif.ulang": "reposted your comment",
  "notif.ikut": "started following you",
  "notif.belumDibaca": "{jumlah} unread notifications",
  "notif.kosongJudul": "Nothing here yet",
  "notif.kosongTeks":
    "The moment someone likes, reposts, or follows you, it shows up here.",

  /* ----------------------------------------------------------------- tren */
  "tren.judul": "Trending",
  "tren.jumlah": "{komentar} comments · {penulis} people",
  "tren.masa": "Counted over the last 24 hours.",

  /* ------------------------------------------------------------ jam emas */
  "jam.judul": "Golden hours",
  "jam.potensi": "Viral potential",
  "jam.dari": "out of 100",
  "jam.tingkat.puncak": "Peak",
  "jam.tingkat.tinggi": "High",
  "jam.tingkat.bagus": "Decent",
  "jam.tingkat.sedang": "Moderate",
  "jam.tingkat.sepi": "Quiet",
  "jam.jendela.pagi": "Morning",
  "jam.jendela.siang": "Midday",
  "jam.jendela.malam": "Evening",
  "jam.catatan.pagi": "High peak, strongest {inti}",
  "jam.catatan.siang": "Decent — the lunch break",
  "jam.catatan.malam": "The steadiest and longest peak",
  "jam.berlangsung": "{jendela} golden hours are running",
  "jam.inti": "Right in the strongest stretch",
  "jam.sisa": "Ends at {waktu} · {sisa} left",
  "jam.berikut": "Next: {jendela} at {waktu}",
  "jam.berikutBesok": "Next: {jendela} at {waktu} tomorrow",
  "jam.jarak": "in {sisa}",
  "jam.ringkas.kini": "{jendela} until {waktu}, {sisa} left",
  "jam.ringkas.nanti": "{jendela} from {waktu}, in {sisa}",
  "jam.saran.kirim": "The best moment to post a comment.",
  "jam.saran.layak": "Worth posting, but save your best for a peak.",
  "jam.saran.tunda": "Hold it if you can — {jendela} is far busier.",
  "jam.hariTerbaik": "Best days: Tuesday–Thursday",
  "jam.hari.terbaik": "Today is one of the strongest days.",
  "jam.hari.biasa": "Today is an average day.",
  "jam.hari.lemah": "Weekend — reach tends to drop, mornings most of all.",
  "jam.kurva": "Hour-by-hour potential for today, Jakarta time",
  "jam.kurvaJam": "{waktu} · potential {skor} out of 100",
  "jam.hariLabel": "How strong each day of the week is",
  "jam.hariIniLabel": "today",
  "jam.zona": "Jakarta time (UTC+7), following Indonesian X audience habits.",
  "hari.0": "Sun",
  "hari.1": "Mon",
  "hari.2": "Tue",
  "hari.3": "Wed",
  "hari.4": "Thu",
  "hari.5": "Fri",
  "hari.6": "Sat",

  /* -------------------------------------------------------------- pasang */
  "pasang.judul": "Install the app",
  "pasang.teks":
    "Add it to your home screen so it opens like any other app, icon and all.",
  "pasang.tombol": "Install",

  /* ---------------------------------------------------------- panel kanan */
  "rel.label": "Side panel",
  "rel.ringkasan": "Activity summary",
  "rel.komentar": "Comments",
  "rel.disukai": "Likes",
  "rel.sukaDiterima": "Likes received",
  "rel.ulangDiterima": "Reposts received",
  "rel.kaki":
    "Twitter Mini — a profile and comment feed with everything stored in Supabase.",
  "rel.kreditAvatar":
    "Default avatars use the Adventurer Neutral style by Lisa Wischofsky (CC BY 4.0) via DiceBear.",

  /* -------------------------------------------------------------- profil */
  "profil.label": "Profile",
  "profil.edit": "Edit profile",
  "profil.gantiSampul": "Change banner",
  "profil.unggahSampul": "Upload banner",
  "profil.hapusSampul": "Remove banner",
  "profil.gantiFoto": "Change profile photo",
  "profil.unggahFoto": "Upload profile photo",
  "profil.fotoProfil": "Profile photo",
  "profil.sampul": "Banner",
  "profil.gantiFotoSingkat": "Change photo",
  "profil.unggahFotoSingkat": "Upload photo",
  "profil.hapusFoto": "Remove photo",
  "profil.bantuanFoto":
    "Cropped to a square from the center, then scaled down to 400 px.",
  "profil.bantuanSampul":
    "JPG, PNG, or WebP up to 8 MB. Cropped to 3:1, then scaled down to 1500 × 500 px.",
  "profil.nama": "Name",
  "profil.bio": "Bio",
  "profil.lokasi": "Location",
  "profil.bergabung": "Joined {waktu}",
  "profil.mengikuti": "Following",
  "profil.pengikut": "Followers",
  "profil.buka": "Open @{handle}'s profile",
  "profil.ikuti": "Follow",
  "profil.sedangMengikuti": "Following",
  "profil.berhentiIkuti": "Unfollow",
  "profil.komentar": "Comments",
  "profil.sukaDiterima": "Likes received",
  "profil.galatIzin": "You do not have permission to save this change.",
  "profil.galatSimpan": "The profile could not be saved.",

  /* ---------------------------------------------------------------- foto */
  "foto.bukanGambar": "The file you picked is not an image.",
  "foto.terlaluBesar": "Images can be at most 8 MB.",
  "foto.tidakTerbaca": "The image could not be read.",
  "foto.tanpaKanvas": "This browser cannot process images.",
  "foto.gagalProses": "The image could not be processed. Try another file.",
  "foto.hasilBesar": "The processed image is still too large. Try another one.",

  /* --------------------------------------------------------------- pesan */
  "pesan.komentarTerkirim": "Comment posted",
  "pesan.komentarDihapus": "Comment deleted",
  "pesan.mulaiMengikuti": "Following @{handle}",
  "pesan.berhentiMengikuti": "Unfollowed @{handle}",
  "pesan.profilTakDitemukan": "No account with the handle @{handle}",
  "pesan.tautanDisalin": "Comment link copied",
  "pesan.teksDisalin": "Text copied. Just paste it in the composer.",
  "pesan.papanKlipDitolak": "The browser denied clipboard access",
  "pesan.profilDiperbarui": "Profile updated",
  "pesan.profilGagal": "The profile could not be saved",
  "pesan.tutup": "Dismiss message",

  /* --------------------------------------------------------------- galat */
  "galat.judul": "Comments could not be loaded",
  "galat.koneksi": "The connection to the server was lost.",
  "galat.muatKomentar": "The comments could not be loaded.",
  "galat.muatLagi": "The next batch of comments could not be loaded.",
  "galat.kirimKomentar": "The comment could not be posted.",
  "galat.terlaluCepat":
    "Too many comments in a short time. Wait a moment, then post again.",
  "galat.suka": "The like could not be saved.",
  "galat.ulang": "The repost could not be saved.",
  "galat.ikut": "The follow could not be saved.",
  "galat.muatNotifikasi": "Notifications could not be loaded.",
  "galat.muatMisi": "The mission list could not be loaded.",
  "galat.lencana": "The badge could not be saved.",
  "galat.hapusKomentar": "The comment could not be deleted.",

  /* -------------------------------------------------------- dialog keluar */
  "keluar.judul": "Log out of the guest account?",
  "keluar.teks":
    "A guest account has no email or password, so this session cannot be opened again once you log out. Comments you already posted stay up until they expire, but you will not be able to edit them. Create an account first if you want to keep it.",
  "keluar.tetap": "Stay here",
  "keluar.keluar": "Log out",

  /* ------------------------------------------------------------- gerbang */
  "gerbang.judulMasuk": "Sign in to your account",
  "gerbang.judulDaftar": "Create a new account",
  "gerbang.judulLupa": "Reset your password",
  "gerbang.subLupa":
    "Enter your account email. We will send you a link to set a new password.",
  "gerbang.sub": "Your comments and profile live in this account.",
  "gerbang.nama": "Display name",
  "gerbang.handle": "Handle",
  "gerbang.email": "Email",
  "gerbang.sandi": "Password",
  "gerbang.sandiMinimal": "At least {jumlah} characters.",
  "gerbang.tombolMasuk": "Sign in",
  "gerbang.tombolDaftar": "Sign up",
  "gerbang.tombolTautan": "Send link",
  "gerbang.atau": "or",
  "gerbang.tamu": "Continue as a guest",
  "gerbang.catatanTamu":
    "No email, no password. You can start commenting right away, and a guest account can be made permanent at any time from inside the app.",
  "gerbang.lupaSandi": "Forgot your password?",
  "gerbang.belumPunya": "No account yet?",
  "gerbang.sudahPunya": "Already have an account?",
  "gerbang.kembaliMasuk": "Back to the sign-in page",
  "gerbang.lihatSandi": "Show password",
  "gerbang.sembunyikanSandi": "Hide password",
  "gerbang.namaTamu": "Guest {nomor}",
  "gerbang.namaWajib": "A display name is required.",
  "gerbang.handleSalah":
    "A handle may only contain letters, numbers, and underscores (3–15 characters).",
  "gerbang.handleTerpakai": "That handle is already taken.",
  "gerbang.kabarLupa":
    "If that email is registered, a password reset link is on its way.",
  "gerbang.kabarDaftar":
    "Account created. Open the confirmation link we sent to your email to start using it.",
  "handle.kosong": "3–15 characters: letters, numbers, or underscores.",
  "handle.salah": "Letters, numbers, and underscores only, 3–15 characters.",
  "handle.memeriksa": "Checking availability…",
  "handle.tersedia": "@{handle} is still available.",
  "handle.terpakai": "@{handle} is already taken.",

  /* ---------------------------------------------------------- galat auth */
  "galatAuth.kredensial": "Wrong email or password.",
  "galatAuth.belumKonfirmasi":
    "This email is not confirmed yet. Open the link we sent to your inbox.",
  "galatAuth.sudahTerdaftar":
    "This email is already registered. Try signing in instead.",
  "galatAuth.sandiPendek": "Passwords must be at least {jumlah} characters.",
  "galatAuth.emailSalah": "That email format is not recognized.",
  "galatAuth.batasan": "Too many attempts. Wait a moment, then try again.",
  "galatAuth.tamuMati":
    "Guest sign-in is not enabled. Turn on Anonymous Sign-Ins in the Supabase Dashboard → Authentication → Sign In / Providers.",
  "galatAuth.jaringan":
    "The server could not be reached. Check your connection and the Supabase URL.",
  "galatAuth.belumSiap": "Supabase is not configured yet.",
  "galatAuth.tautanRusak": "That link is incomplete or has expired.",

  /* ---------------------------------------------------------- bilah tamu */
  "tamu.label": "Guest account",
  "tamu.teks":
    "You are using a <strong>guest account</strong>. Your comments are saved as usual, but the account only lives in this browser — once you log out, there is no way back in.",
  "tamu.buatAkun": "Create an account",
  "tamu.tutupForm": "Close the create account form",
  "tamu.bantuan":
    "Add an email and a password. The comments, profile, and photos you already have stay with the very same account.",
  "tamu.jadikan": "Make it permanent",
  "tamu.emailSalah": "Enter an email you can be reached at.",
  "tamu.emailDipakai": "That email already belongs to another account.",
  "tamu.cekEmail": "Check your email to confirm that address",
  "tamu.berhasil": "The guest account is permanent now",

  /* ---------------------------------------------------------- sandi baru */
  "sandi.judul": "Create a new password",
  "sandi.kedaluwarsa":
    "The recovery link has expired or was not opened from the email. Ask for a new link from the sign-in page.",
  "sandi.sub": "A new password takes effect on every device right away.",
  "sandi.baru": "New password",
  "sandi.ulangi": "Repeat the password",
  "sandi.belumSama": "The two passwords do not match yet.",
  "sandi.simpan": "Save password",

  /* -------------------------------------------------------------- setup */
  "setup.judul": "Supabase is not connected",
  "setup.sub":
    "This app keeps accounts, comments, and profile photos in Supabase. Copy <code>.env.example</code> to <code>.env.local</code>, fill in the two values below, then restart the development server.",
  "setup.galat":
    "Do not forget to run the SQL files in <code>supabase/migrations/</code> from the SQL Editor so the tables, permissions, and storage buckets exist.",

  /* --------------------------------------------------------------- waktu */
  "waktu.detik": "{nilai}s",
  "waktu.menit": "{nilai}m",
  "waktu.jam": "{nilai}h",
  "waktu.hari": "{nilai}d",
  "waktu.sisaMenit": "{nilai}m left",
  "waktu.sisaJam": "{nilai}h left",
};

export const KAMUS: Record<Bahasa, Record<KunciTeks, string>> = {
  id: KAMUS_ID,
  en: KAMUS_EN,
};

export type Isian = Record<string, string | number>;

/**
 * Mengambil satu kalimat dan mengisi `{nama}` bila ada. Bisa dipanggil di mana
 * saja — komponen memakai `t()` dari useBahasa, sedangkan Route Handler dan
 * `generateMetadata` memanggil fungsi ini langsung.
 */
export function teks(bahasa: Bahasa, kunci: KunciTeks, isian?: Isian): string {
  const kalimat = KAMUS[bahasa][kunci];
  if (!isian) return kalimat;
  return kalimat.replace(/\{(\w+)\}/g, (utuh, nama: string) =>
    nama in isian ? String(isian[nama]) : utuh,
  );
}
