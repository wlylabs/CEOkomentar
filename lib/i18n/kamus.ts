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
    "Antarmuka bergaya Twitter: komentar berumur 24 jam, jam emas audiens Indonesia, panduan algoritma X, profil, notifikasi, misi lencana, dan tren.",
  "meta.judulSandi": "Kata sandi baru — Twitter Mini",
  "meta.judulUtas": "Komentar @{handle} — Twitter Mini",
  "meta.deskripsiUtas": "“{kutipan}” — @{handle} di Twitter Mini.",

  /* ----------------------------------------------------------- navigasi */
  "nav.utama": "Navigasi utama",
  "nav.beranda": "Beranda",
  "nav.panduan": "Panduan",
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
    "Centang biru diberikan kepada akun yang mengikuti @{akun} di X. Ikuti akunnya, lalu posting pengajuanmu di sini — admin yang mencocokkannya dengan daftar pengikut akun resmi.",
  "misi.ikutiX.menunggu":
    "Pengajuanmu sudah tercatat dan sedang ditinjau. Kalau namamu ada di daftar pengikut @{akun}, centang birunya dipasang admin — kamu tidak perlu menekan apa-apa lagi.",
  "misi.ikutiX.selesai":
    "Centang biru sudah menempel di namamu. Selama kamu masih mengikuti @{akun}, lencananya tetap ada.",
  "misi.ikutiX.langkah1": "Buka profil @{akun} di X, lalu tekan Follow.",
  "misi.ikutiX.langkah2":
    "Tempel tautan profil X-mu di kotak bawah ini — profil yang barusan menekan Follow, karena nama itulah yang akan dicari di daftar pengikut.",
  "misi.ikutiX.langkah3":
    "Posting kalimatnya di Twitter Mini apa adanya, tagar #{tagar} sekalian — tagar itulah yang membuat pengajuanmu terkumpul dan terbaca admin. Komentar itu pengajuanmu; admin mencocokkan namamu, lalu memasang centangnya.",
  "misi.ikutiX.buka": "Buka @{akun} di X",
  "misi.klaim.label": "Tautan profil X-mu",
  "misi.klaim.bayangan": "https://x.com/namamu",
  /* Kalimat yang diposting pemakai sebagai pengajuan. Tagarnya tetap
     `{tagar}` di semua bahasa — itu yang mengumpulkan pengajuan jadi satu. */
  "misi.klaim.kalimat": "Sudah follow akun @{akun} #{tagar}",
  "misi.klaim.pratinjau": "Yang akan diposting",
  "misi.klaim.asing":
    "Yang ditunggu tautan profil X, misalnya https://x.com/namamu — bukan tautan postingan dan bukan alamat lain.",
  "misi.klaim.kurang": "(tautan profilmu belum diisi)",
  "misi.klaim.tulis": "Tulis di Twitter Mini",
  "misi.klaim.catatan":
    "Aplikasi ini tidak meminta izin apa pun atas akun X-mu. Yang dibaca admin cuma komentar yang kamu posting sendiri, dan tautan profil di dalamnya yang dicocokkan dengan daftar pengikut @{akun}.",

  /* --------------------------------------------------------------- kelola */
  "kelola.label": "Lencana akun ini",
  "kelola.judul": "Lencana",
  "kelola.sub":
    "Cocokkan dulu pengajuan #{tagar} milik @{handle} dengan daftar pengikut akun resmi, baru pasang centangnya.",
  "kelola.beri": "Beri",
  "kelola.cabut": "Cabut",
  "kelola.ada": "Dimiliki",
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
  /* Hanya pernah muncul di daftar admin: kabar bahwa sebuah pengajuan misi
     baru saja diposting dan menunggu diputuskan. */
  "notif.misi": "memposting pengajuan misi follow",
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

  /* ------------------------------------------------------------- panduan */
  "panduan.sub":
    "Kapan menulis, apa yang dihargai linimasa X, dan aturan Creator Studio.",
  "panduan.kapan": "Kapan menulis hari ini",
  "panduan.kapanSub":
    "Jam yang sama menentukan dua-duanya: berapa orang yang melihat, dan berapa yang sempat membalas selagi kamu masih di layar.",
  "panduan.tulisSekarang": "Jam emas sedang berlangsung — tulis sekarang",
  "panduan.tulisTetap": "Tulis komentar sekarang",

  "panduan.rencana": "Rencana hari ini",
  "panduan.rencanaSub":
    "Enam langkah yang sama tiap hari, kosong lagi tiap tengah malam WIB. Centangnya hanya disimpan di peramban ini.",
  "panduan.rencanaMaju": "{selesai} dari {total} selesai",
  "panduan.rencanaTuntas":
    "Enam-enamnya selesai. Sisanya biarkan waktu yang bekerja — daftar ini kosong lagi besok pagi.",

  "panduan.algoritma": "Bagaimana linimasa X memilih",
  "panduan.algoritmaSub":
    "Maret 2023 Twitter membuka kode perekomendasi “For You” di GitHub. Yang di bawah ini bacaan atas kode itu: empat tahap yang dilewati sebuah postingan sebelum sampai ke layar orang lain.",
  "panduan.sumber": "Dari mana kandidat datang",
  "panduan.saring": "Yang menyaring setelahnya",
  "panduan.bobot": "Bobot tiap sinyal",
  "panduan.bobotSub":
    "Heavy ranker menjumlahkan peluang sepuluh hal terjadi, masing-masing dikalikan bobotnya. Angka di bawah ini tertulis apa adanya di repositorinya — panjang bilahnya sebanding lurus dengan angkanya.",
  "panduan.setaraUntung": "Sebanding dengan {jumlah} suka",
  "panduan.setaraRugi": "Menghapus nilai {jumlah} suka",
  "panduan.bobotCatatan":
    "Yang terbuka adalah potret sistemnya pada 2023, bukan mesin yang berjalan hari ini; X sudah mengubahnya berkali-kali sejak itu. Yang bertahan bukan angkanya melainkan urutannya: percakapan jauh di atas suka, dan satu laporan menghapus lebih banyak daripada yang bisa dikumpulkan ratusan suka.",

  "panduan.langkah": "Artinya buat yang menulis",
  "panduan.langkahSub":
    "Enam kesimpulan, masing-masing dengan angka atau aturan yang mendasarinya. Baris kecil di bawah tiap kalimat adalah dasarnya, bukan hiasan — silakan diperiksa sendiri di repositorinya.",

  "panduan.kreator": "Kebijakan Creator Studio X",
  "panduan.kreatorSub":
    "Jangkauan baru berarti uang setelah akunnya memenuhi syarat program X, dan syarat itu bisa hilang karena taktik yang justru dijanjikan menaikkan jangkauan.",
  "panduan.syarat": "Syarat masuk",
  "panduan.larangan": "Yang mencabut monetisasi",
  "panduan.bacaAturan": "Aturannya",
  "panduan.bukaStudio": "Buka Creator Studio",
  "panduan.bukaStandar": "Baca standar monetisasi",
  "panduan.kreatorCatatan":
    "Dicocokkan terakhir dengan halaman bantuan X pada {waktu}. Ambang dan tarifnya milik X dan berubah tanpa pemberitahuan — yang berlaku selalu yang tertulis di halaman aslinya, bukan salinan di sini.",

  "panduan.rujukan": "Dari mana angkanya",
  "panduan.rujukanRepo": "Kode perekomendasi linimasa yang dibuka Twitter.",
  "panduan.rujukanMl": "Model pembelajaran mesinnya, termasuk heavy ranker.",
  "panduan.rujukanBobot": "Tabel bobot sepuluh sinyal beserta keterangannya.",
  "panduan.rujukanX": "Halaman bantuan X untuk program kreator.",
  "panduan.rujukanCatatan":
    "Twitter Mini tidak terhubung ke X dan tidak meminta izin apa pun atas akunmu. Halaman ini bacaan atas dokumen yang terbuka untuk umum, bukan data dari dalam X.",

  /* -------------------------------------------------------- rencana harian */
  "rencana.jamEmas":
    "Kirim satu postingan utama di dalam jendela jam emas hari ini.",
  "rencana.jamEmasDasar": "Pagi 07.00–10.00, siang 12.00–14.00, malam 19.00–21.30 WIB.",
  "rencana.tanya": "Tutup postingannya dengan pertanyaan yang gampang dijawab.",
  "rencana.tanyaDasar": "Bobot balasan 13,5 — satu balasan sebanding 27 suka.",
  "rencana.balasBalasan":
    "Balas setiap balasan yang masuk selama satu jam pertama.",
  "rencana.balasBalasanDasar":
    "Balasan yang dibalas penulisnya berbobot 75 — sebanding 150 suka.",
  "rencana.temuiOrang":
    "Balas lima akun lain di topik yang sama, di jam yang sama.",
  "rencana.temuiOrangDasar":
    "RealGraph menaksir peluang dua akun berinteraksi lagi dari riwayatnya.",
  "rencana.satuTopik": "Bertahan di satu topik sepanjang hari ini.",
  "rencana.satuTopikDasar":
    "SimClusters mengelompokkan akun ke sekitar 145 rb komunitas dari graf follow.",
  "rencana.tanpaUmpan":
    "Tanpa umpan keterlibatan: tidak ada “RT kalau setuju”, tidak ada balasan pancingan.",
  "rencana.tanpaUmpanDasar":
    "Umpan negatif −74, laporan −369, dan Creator Monetization Standards melarangnya.",

  /* ------------------------------------------------------------ algoritma */
  "algo.tahap.kandidat": "Kumpulkan kandidat",
  "algo.tahap.kandidatTeks":
    "Beberapa layanan mengumpulkan calon postingan dari dua kolam: yang ditulis akun yang kamu ikuti, dan yang datang dari luar lingkaranmu. Sekitar separuh linimasa berasal dari kolam pertama.",
  "algo.tahap.peringkat": "Peringkatkan",
  "algo.tahap.peringkatTeks":
    "Penyaring ringan memangkas dulu jumlahnya, lalu heavy ranker menilai sisanya dengan sekitar 6.000 ciri per postingan dan mengurutkannya.",
  "algo.tahap.saring": "Campur dan saring",
  "algo.tahap.saringTeks":
    "Urutan tadi belum jadi linimasa. Di sini penulis yang sama dijarangkan, isi dari dalam dan luar lingkaran diseimbangkan, dan apa pun yang tidak boleh tampil dibuang.",
  "algo.tahap.sajikan": "Sajikan",
  "algo.tahap.sajikanTeks":
    "Hasilnya dikirim ke beranda, notifikasi, dan permukaan lain — masing-masing dengan campuran yang berbeda.",

  "algo.sumber.earlybird": "Indeks pencarian (Earlybird)",
  "algo.sumber.earlybirdTeks":
    "Mencari dan memeringkat postingan dari akun yang kamu ikuti. Inilah sumber terbesarnya.",
  "algo.sumber.earlybirdTanda": "±50% linimasa",
  "algo.sumber.uteg": "User-Tweet Entity Graph",
  "algo.sumber.utegTeks":
    "Graf interaksi orang-dengan-postingan yang disimpan di memori. Menemukan kandidat dengan menelusurinya: apa yang disukai akun-akun yang kamu ikuti.",
  "algo.sumber.simclusters": "SimClusters",
  "algo.sumber.simclustersTeks":
    "Mengelompokkan akun menjadi komunitas berdasarkan graf follow, lalu merekomendasikan postingan yang ramai di komunitas yang sama denganmu.",
  "algo.sumber.simclustersTanda": "±145 rb komunitas",
  "algo.sumber.realgraph": "RealGraph",
  "algo.sumber.realgraphTeks":
    "Menaksir peluang satu akun berinteraksi dengan akun lain, dihitung dari riwayat interaksi keduanya. Kekuatan hubungan, bukan sekadar status mengikuti.",
  "algo.sumber.frs": "Follow Recommendation Service",
  "algo.sumber.frsTeks":
    "Merekomendasikan akun yang layak diikuti, berikut postingannya.",

  "algo.bobot.laporan": "Dilaporkan",
  "algo.bobot.laporanArti": "Peluang pembaca menekan “Laporkan postingan”.",
  "algo.bobot.balasanDibalas": "Balasan yang dibalas penulisnya",
  "algo.bobot.balasanDibalasArti":
    "Peluang pembaca membalas postingannya, dan balasan itu ditanggapi penulis postingan.",
  "algo.bobot.umpanNegatif": "Umpan negatif",
  "algo.bobot.umpanNegatifArti":
    "Peluang pembaca menekan “tampilkan lebih jarang”, membisukan, atau memblokir penulisnya.",
  "algo.bobot.balasan": "Balasan",
  "algo.bobot.balasanArti": "Peluang pembaca membalas postingannya.",
  "algo.bobot.profilKlik": "Klik profil yang berlanjut",
  "algo.bobot.profilKlikArti":
    "Peluang pembaca membuka profil penulisnya lalu menyukai atau membalas sebuah postingan di sana.",
  "algo.bobot.klikBagus": "Masuk percakapan lalu ikut",
  "algo.bobot.klikBagusArti":
    "Peluang pembaca membuka percakapan postingan ini lalu membalas atau menyukai sesuatu di dalamnya.",
  "algo.bobot.klikLama": "Masuk percakapan lalu bertahan",
  "algo.bobot.klikLamaArti":
    "Peluang pembaca membuka percakapannya dan tinggal di sana setidaknya dua menit.",
  "algo.bobot.ulang": "Posting ulang",
  "algo.bobot.ulangArti": "Peluang pembaca memposting ulang.",
  "algo.bobot.suka": "Suka",
  "algo.bobot.sukaArti": "Peluang pembaca menyukainya.",
  "algo.bobot.video": "Video ditonton separuh",
  "algo.bobot.videoArti":
    "Untuk postingan bervideo: peluang pembaca menonton setidaknya separuhnya.",

  "algo.saring.visibilitas": "Penyaring visibilitas",
  "algo.saring.visibilitasTeks":
    "Akun yang diblokir dan dibisukan, setelan konten sensitif, dan kewajiban hukum. Berjalan sebelum yang lain.",
  "algo.saring.ragam": "Keragaman penulis",
  "algo.saring.ragamTeks":
    "Menjarangkan postingan berturut-turut dari akun yang sama, sekalipun semuanya menang di pemeringkatan.",
  "algo.saring.imbang": "Imbang dalam–luar lingkaran",
  "algo.saring.imbangTeks":
    "Menjaga campuran antara akun yang kamu ikuti dan yang belum, supaya linimasa tidak menjadi satu-satunya di antara keduanya.",
  "algo.saring.lelah": "Kelelahan umpan balik",
  "algo.saring.lelahTeks":
    "Menurunkan yang mirip dengan apa yang baru saja ditolak pembacanya.",
  "algo.saring.kembar": "Penyingkiran kembar",
  "algo.saring.kembarTeks":
    "Membuang postingan yang sudah dilihat dan kandidat yang sama dari beberapa sumber sekaligus.",

  "algo.langkah.percakapan":
    "Tulis sesuatu yang bisa dijawab, bukan sesuatu yang bisa disukai.",
  "algo.langkah.percakapanDasar":
    "Balasan 13,5 lawan suka 0,5 — satu balasan menandingi 27 suka.",
  "algo.langkah.balasBalik":
    "Balas balasan yang masuk. Ini satu-satunya bagian yang seluruhnya ada di tanganmu.",
  "algo.langkah.balasBalikDasar":
    "Balasan yang dibalas penulisnya 75 — bobot positif terbesar di seluruh daftar.",
  "algo.langkah.utuh":
    "Buat postingannya berdiri sendiri; percakapannya harus bisa hidup di dalam postingan itu, bukan di tempat lain.",
  "algo.langkah.utuhDasar":
    "Empat dari sepuluh sinyal bernilai dua digit menghitung apa yang terjadi di dalam percakapannya.",
  "algo.langkah.topik":
    "Bertahan di satu topik. Akun yang tidak jelas berbicara tentang apa sulit ditempatkan.",
  "algo.langkah.topikDasar":
    "SimClusters menempatkan akun ke komunitas dari graf follow; kandidat luar lingkaran datang dari sana.",
  "algo.langkah.jarak":
    "Beri jarak antarpostingan, jangan memborong satu jam emas dengan lima postingan sekaligus.",
  "algo.langkah.jarakDasar":
    "Keragaman penulis menjarangkan postingan berturut-turut dari akun yang sama.",
  "algo.langkah.umpan":
    "Jangan memancing keterlibatan. Yang membuat orang menekan “tampilkan lebih jarang” lebih mahal daripada apa pun yang bisa dikumpulkan.",
  "algo.langkah.umpanDasar":
    "Umpan negatif −74 dan laporan −369 lawan suka 0,5.",

  /* -------------------------------------------------------------- kreator */
  "kreator.program.bagiHasil": "Bagi hasil iklan",
  "kreator.program.bagiHasilTeks":
    "Bagian dari pendapatan iklan yang tampil di balasan postinganmu. X menghitungnya dari keterlibatan pelanggan berbayar, bukan dari jumlah tayangan mentah.",
  "kreator.program.langganan": "Langganan kreator",
  "kreator.program.langgananTeks":
    "Pembaca membayar bulanan untuk konten khusus. Potongan toko aplikasi berlaku bila langganannya dibeli lewat aplikasi ponsel.",
  "kreator.program.tip": "Tip",
  "kreator.program.tipTeks":
    "Pembayaran sekali jalan langsung dari pembaca, tanpa syarat tayangan.",

  "kreator.syarat.premium": "Langganan X Premium aktif",
  "kreator.syarat.premiumTeks":
    "Akunnya harus berlangganan Premium (atau tingkat di atasnya) dan tetap aktif selama ikut program.",
  "kreator.syarat.pengikut": "Minimal 500 pengikut",
  "kreator.syarat.pengikutTeks":
    "Dihitung dari pengikut sungguhan; akun yang membeli pengikut justru berhadapan dengan aturan manipulasi.",
  "kreator.syarat.tayangan": "5 juta tayangan organik dalam 3 bulan",
  "kreator.syarat.tayanganTeks":
    "Kira-kira 1,7 juta sebulan, dan hitungannya berjalan mundur — sekali turun di bawahnya, kepesertaannya berhenti.",
  "kreator.syarat.pembayaran": "Akun pembayaran yang terhubung",
  "kreator.syarat.pembayaranTeks":
    "Lewat penyedia pembayaran yang dipakai X, di negara yang didukung, dengan identitas yang terverifikasi.",
  "kreator.syarat.standar": "Patuh pada standar monetisasi",
  "kreator.syarat.standarTeks":
    "Berlaku terus, bukan sekali saat mendaftar. Pelanggarannya menghentikan pembayaran walau syarat lainnya terpenuhi.",

  "kreator.larangan.umpan":
    "Umpan keterlibatan: meminta suka, balasan, atau posting ulang sebagai syarat, termasuk giveaway berantai.",
  "kreator.larangan.spam":
    "Spam dan manipulasi: akun ganda, balasan massal, pembelian keterlibatan.",
  "kreator.larangan.jiplak":
    "Konten jiplakan atau unggahan ulang tanpa tambahan apa pun dari kamu.",
  "kreator.larangan.sesat":
    "Konten menyesatkan, termasuk judul yang tidak sesuai isinya.",
  "kreator.larangan.kasar":
    "Ujaran kebencian, kekerasan, dan pelecehan — termasuk di balasan yang kamu tulis sendiri.",
  "kreator.larangan.dewasa":
    "Konten dewasa di luar program yang memang disediakan X untuk itu.",

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
  "profil.akunX": "Akun X",
  "profil.akunXBayangan": "https://x.com/namamu",
  "profil.akunXBantuan":
    "Tempel tautan profil X-mu atau ketik namanya saja. Namanya muncul di profil dan bisa ditekan untuk membukanya di X. Kosongkan untuk melepas tautannya.",
  "profil.akunXSalah":
    "Yang ditunggu tautan profil X, misalnya https://x.com/namamu — bukan tautan postingan dan bukan alamat lain.",
  "profil.akunXBuka": "Buka @{akun} di X",
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
    "A Twitter-style interface: comments that live 24 hours, golden hours for the Indonesian audience, a playbook for the X algorithm, profiles, notifications, badge missions, and trends.",
  "meta.judulSandi": "New password — Twitter Mini",
  "meta.judulUtas": "@{handle}'s comment — Twitter Mini",
  "meta.deskripsiUtas": "“{kutipan}” — @{handle} on Twitter Mini.",

  /* ----------------------------------------------------------- navigasi */
  "nav.utama": "Main navigation",
  "nav.beranda": "Home",
  "nav.panduan": "Playbook",
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
    "The blue check goes to accounts that follow @{akun} on X. Follow it, then post your claim here — an admin matches it against the official account's follower list.",
  "misi.ikutiX.menunggu":
    "Your claim is recorded and under review. If your name is on @{akun}'s follower list, an admin puts the blue check on it — nothing left for you to press.",
  "misi.ikutiX.selesai":
    "The blue check is on your name. It stays as long as you keep following @{akun}.",
  "misi.ikutiX.langkah1": "Open @{akun} on X and press Follow.",
  "misi.ikutiX.langkah2":
    "Paste the link to your X profile in the box below — the profile that just pressed Follow, since that is the name looked up in the follower list.",
  "misi.ikutiX.langkah3":
    "Post the sentence on Twitter Mini as it is, #{tagar} included — that tag is what gathers claims where an admin can read them. That comment is your claim; an admin matches your name and puts the check on it.",
  "misi.ikutiX.buka": "Open @{akun} on X",
  "misi.klaim.label": "Link to your X profile",
  "misi.klaim.bayangan": "https://x.com/yourname",
  "misi.klaim.kalimat": "Now following @{akun} #{tagar}",
  "misi.klaim.pratinjau": "What gets posted",
  "misi.klaim.asing":
    "A link to an X profile is expected, like https://x.com/yourname — not a link to a post, and not another address.",
  "misi.klaim.kurang": "(your profile link is still empty)",
  "misi.klaim.tulis": "Write it on Twitter Mini",
  "misi.klaim.catatan":
    "This app asks for no access at all to your X account. All an admin reads is the comment you posted yourself, and the profile link inside it that gets matched against @{akun}'s follower list.",

  /* --------------------------------------------------------------- kelola */
  "kelola.label": "Badges on this account",
  "kelola.judul": "Badges",
  "kelola.sub":
    "Match @{handle}'s #{tagar} claim against the official follower list first, then put the check on it.",
  "kelola.beri": "Award",
  "kelola.cabut": "Revoke",
  "kelola.ada": "Held",
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
  "notif.misi": "posted a follow-mission claim",
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

  /* ------------------------------------------------------------- panduan */
  "panduan.sub":
    "When to post, what the X timeline rewards, and the Creator Studio rules.",
  "panduan.kapan": "When to post today",
  "panduan.kapanSub":
    "The same hour decides both things: how many people see it, and how many can reply while you are still on the screen.",
  "panduan.tulisSekarang": "Golden hours are running — post now",
  "panduan.tulisTetap": "Write a comment now",

  "panduan.rencana": "Today's plan",
  "panduan.rencanaSub":
    "The same six steps every day, cleared again at midnight Jakarta time. The ticks live in this browser only.",
  "panduan.rencanaMaju": "{selesai} of {total} done",
  "panduan.rencanaTuntas":
    "All six done. Let time do the rest — the list is empty again tomorrow morning.",

  "panduan.algoritma": "How the X timeline picks",
  "panduan.algoritmaSub":
    "In March 2023 Twitter opened the “For You” recommendation code on GitHub. What follows is a reading of that code: the four stages a post passes through before it reaches anyone else's screen.",
  "panduan.sumber": "Where candidates come from",
  "panduan.saring": "What filters them afterwards",
  "panduan.bobot": "The weight of each signal",
  "panduan.bobotSub":
    "The heavy ranker adds up the probability of ten things happening, each multiplied by its weight. The numbers below are written exactly like that in the repository — bar length is directly proportional to the number.",
  "panduan.setaraUntung": "Worth {jumlah} likes",
  "panduan.setaraRugi": "Wipes out {jumlah} likes",
  "panduan.bobotCatatan":
    "What was opened is a snapshot of the system in 2023, not the machine running today; X has changed it many times since. What lasts is not the numbers but their order: conversation far above likes, and a single report erasing more than hundreds of likes can gather.",

  "panduan.langkah": "What it means for you",
  "panduan.langkahSub":
    "Six conclusions, each with the number or rule behind it. The small line under every sentence is that basis, not decoration — check it yourself in the repository.",

  "panduan.kreator": "X Creator Studio policy",
  "panduan.kreatorSub":
    "Reach only turns into money once the account meets X's program requirements — and those requirements can be lost to the very tactics that promise more reach.",
  "panduan.syarat": "Requirements to get in",
  "panduan.larangan": "What takes monetization away",
  "panduan.bacaAturan": "Its rules",
  "panduan.bukaStudio": "Open Creator Studio",
  "panduan.bukaStandar": "Read the monetization standards",
  "panduan.kreatorCatatan":
    "Last checked against X's help pages in {waktu}. The thresholds and rates belong to X and change without notice — what applies is always what the original page says, not this copy.",

  "panduan.rujukan": "Where the numbers come from",
  "panduan.rujukanRepo": "The timeline recommendation code Twitter opened.",
  "panduan.rujukanMl": "Its machine learning models, the heavy ranker included.",
  "panduan.rujukanBobot": "The table of ten signal weights and what each one means.",
  "panduan.rujukanX": "X's help pages for the creator programs.",
  "panduan.rujukanCatatan":
    "Twitter Mini is not connected to X and asks for no access at all to your account. This page is a reading of publicly open documents, not data from inside X.",

  /* -------------------------------------------------------- rencana harian */
  "rencana.jamEmas": "Post one main piece inside today's golden hours.",
  "rencana.jamEmasDasar":
    "Morning 07:00–10:00, midday 12:00–14:00, evening 19:00–21:30 Jakarta time.",
  "rencana.tanya": "End it with a question that is easy to answer.",
  "rencana.tanyaDasar": "Reply weight 13.5 — one reply is worth 27 likes.",
  "rencana.balasBalasan": "Answer every reply that lands in the first hour.",
  "rencana.balasBalasanDasar":
    "A reply the author engages with weighs 75 — worth 150 likes.",
  "rencana.temuiOrang": "Reply to five other accounts on the same topic, same hours.",
  "rencana.temuiOrangDasar":
    "RealGraph estimates how likely two accounts are to interact again from their history.",
  "rencana.satuTopik": "Stay on one topic for the whole day.",
  "rencana.satuTopikDasar":
    "SimClusters sorts accounts into around 145k communities from the follow graph.",
  "rencana.tanpaUmpan":
    "No engagement bait: no “RT if you agree”, no fishing replies.",
  "rencana.tanpaUmpanDasar":
    "Negative feedback −74, report −369, and the Creator Monetization Standards forbid it.",

  /* ------------------------------------------------------------ algoritma */
  "algo.tahap.kandidat": "Gather candidates",
  "algo.tahap.kandidatTeks":
    "Several services collect candidate posts from two pools: what the accounts you follow wrote, and what comes from outside your circle. About half the timeline comes from the first pool.",
  "algo.tahap.peringkat": "Rank them",
  "algo.tahap.peringkatTeks":
    "A light ranker trims the pile first, then the heavy ranker scores what is left using around 6,000 features per post and puts them in order.",
  "algo.tahap.saring": "Mix and filter",
  "algo.tahap.saringTeks":
    "That order is not a timeline yet. Here the same author is spaced out, in-network and out-of-network content is balanced, and anything that must not appear is dropped.",
  "algo.tahap.sajikan": "Serve",
  "algo.tahap.sajikanTeks":
    "The result goes out to the home timeline, notifications, and other surfaces — each with a different mix.",

  "algo.sumber.earlybird": "Search index (Earlybird)",
  "algo.sumber.earlybirdTeks":
    "Finds and ranks posts from the accounts you follow. This is the largest source of all.",
  "algo.sumber.earlybirdTanda": "±50% of the timeline",
  "algo.sumber.uteg": "User-Tweet Entity Graph",
  "algo.sumber.utegTeks":
    "An in-memory graph of people and the posts they touched. It finds candidates by walking it: what the accounts you follow liked.",
  "algo.sumber.simclusters": "SimClusters",
  "algo.sumber.simclustersTeks":
    "Groups accounts into communities from the follow graph, then recommends posts that are busy in the same communities as you.",
  "algo.sumber.simclustersTanda": "±145k communities",
  "algo.sumber.realgraph": "RealGraph",
  "algo.sumber.realgraphTeks":
    "Estimates how likely one account is to interact with another, computed from their interaction history. The strength of a tie, not merely the fact of a follow.",
  "algo.sumber.frs": "Follow Recommendation Service",
  "algo.sumber.frsTeks": "Recommends accounts worth following, and their posts.",

  "algo.bobot.laporan": "Reported",
  "algo.bobot.laporanArti": "The probability the reader clicks “Report post”.",
  "algo.bobot.balasanDibalas": "Reply engaged by the author",
  "algo.bobot.balasanDibalasArti":
    "The probability the reader replies to the post and that reply is engaged by the post's author.",
  "algo.bobot.umpanNegatif": "Negative feedback",
  "algo.bobot.umpanNegatifArti":
    "The probability the reader asks for “show less often”, mutes, or blocks the author.",
  "algo.bobot.balasan": "Reply",
  "algo.bobot.balasanArti": "The probability the reader replies to the post.",
  "algo.bobot.profilKlik": "Profile click that goes further",
  "algo.bobot.profilKlikArti":
    "The probability the reader opens the author's profile and then likes or replies to a post there.",
  "algo.bobot.klikBagus": "Into the conversation, then joins",
  "algo.bobot.klikBagusArti":
    "The probability the reader opens this post's conversation and replies to or likes something inside it.",
  "algo.bobot.klikLama": "Into the conversation, then stays",
  "algo.bobot.klikLamaArti":
    "The probability the reader opens the conversation and stays there for at least two minutes.",
  "algo.bobot.ulang": "Repost",
  "algo.bobot.ulangArti": "The probability the reader reposts it.",
  "algo.bobot.suka": "Like",
  "algo.bobot.sukaArti": "The probability the reader likes it.",
  "algo.bobot.video": "Video watched halfway",
  "algo.bobot.videoArti":
    "For a video post: the probability the reader watches at least half of it.",

  "algo.saring.visibilitas": "Visibility filtering",
  "algo.saring.visibilitasTeks":
    "Blocked and muted accounts, sensitive content settings, and legal obligations. Runs ahead of the rest.",
  "algo.saring.ragam": "Author diversity",
  "algo.saring.ragamTeks":
    "Spaces out consecutive posts from the same account, even when every one of them won on ranking.",
  "algo.saring.imbang": "In-network / out-of-network balance",
  "algo.saring.imbangTeks":
    "Keeps a mix of accounts you follow and accounts you do not, so the timeline never becomes only one of the two.",
  "algo.saring.lelah": "Feedback fatigue",
  "algo.saring.lelahTeks":
    "Pushes down whatever resembles what the reader just turned away.",
  "algo.saring.kembar": "Deduplication",
  "algo.saring.kembarTeks":
    "Drops posts already seen and the same candidate arriving from several sources at once.",

  "algo.langkah.percakapan":
    "Write something answerable, not something likeable.",
  "algo.langkah.percakapanDasar":
    "Reply 13.5 against like 0.5 — one reply matches 27 likes.",
  "algo.langkah.balasBalik":
    "Answer the replies you get. This is the one part entirely in your hands.",
  "algo.langkah.balasBalikDasar":
    "A reply engaged by the author weighs 75 — the largest positive weight on the whole list.",
  "algo.langkah.utuh":
    "Let the post stand on its own; the conversation has to be able to live inside it, not somewhere else.",
  "algo.langkah.utuhDasar":
    "Four of the ten double-digit signals count what happens inside the conversation.",
  "algo.langkah.topik":
    "Stay on one topic. An account with no clear subject is hard to place.",
  "algo.langkah.topikDasar":
    "SimClusters puts accounts into communities from the follow graph; out-of-network candidates come from there.",
  "algo.langkah.jarak":
    "Leave space between posts; do not spend one golden window on five posts at once.",
  "algo.langkah.jarakDasar":
    "Author diversity spaces out consecutive posts from the same account.",
  "algo.langkah.umpan":
    "Never fish for engagement. Whatever makes someone press “show less often” costs more than anything you could gather.",
  "algo.langkah.umpanDasar":
    "Negative feedback −74 and report −369 against like 0.5.",

  /* -------------------------------------------------------------- kreator */
  "kreator.program.bagiHasil": "Ads revenue sharing",
  "kreator.program.bagiHasilTeks":
    "A share of the ad revenue shown in the replies to your posts. X computes it from engagement by paying subscribers, not from raw impression counts.",
  "kreator.program.langganan": "Creator subscriptions",
  "kreator.program.langgananTeks":
    "Readers pay monthly for subscriber-only content. App store cuts apply when the subscription is bought inside a mobile app.",
  "kreator.program.tip": "Tips",
  "kreator.program.tipTeks":
    "One-off payments straight from readers, with no impression requirement.",

  "kreator.syarat.premium": "An active X Premium subscription",
  "kreator.syarat.premiumTeks":
    "The account must subscribe to Premium (or a tier above it) and stay subscribed while it is in the program.",
  "kreator.syarat.pengikut": "At least 500 followers",
  "kreator.syarat.pengikutTeks":
    "Counted as real followers; an account that buys them runs into the manipulation rules instead.",
  "kreator.syarat.tayangan": "5 million organic impressions in 3 months",
  "kreator.syarat.tayanganTeks":
    "Roughly 1.7 million a month, on a rolling count — drop below it and participation stops.",
  "kreator.syarat.pembayaran": "A connected payout account",
  "kreator.syarat.pembayaranTeks":
    "Through the payment provider X uses, in a supported country, with verified identity.",
  "kreator.syarat.standar": "Compliance with the monetization standards",
  "kreator.syarat.standarTeks":
    "Ongoing, not a one-time check at sign-up. Breaking them stops payouts even when every other requirement is met.",

  "kreator.larangan.umpan":
    "Engagement bait: demanding likes, replies, or reposts as a condition, chain giveaways included.",
  "kreator.larangan.spam":
    "Spam and manipulation: duplicate accounts, mass replies, bought engagement.",
  "kreator.larangan.jiplak":
    "Plagiarised content, or reposts that add nothing of your own.",
  "kreator.larangan.sesat":
    "Misleading content, including headlines that do not match what follows.",
  "kreator.larangan.kasar":
    "Hateful conduct, violence, and harassment — in the replies you write yourself as well.",
  "kreator.larangan.dewasa":
    "Adult content outside the program X provides for it.",

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
  "profil.akunX": "X account",
  "profil.akunXBayangan": "https://x.com/yourname",
  "profil.akunXBantuan":
    "Paste the link to your X profile, or just type the name. It shows on your profile and opens on X when pressed. Leave it empty to drop the link.",
  "profil.akunXSalah":
    "A link to an X profile is expected, like https://x.com/yourname — not a link to a post, and not another address.",
  "profil.akunXBuka": "Open @{akun} on X",
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
