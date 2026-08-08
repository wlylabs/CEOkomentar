import type { KunciTeks } from "./i18n/kamus";

/**
 * Bacaan atas `github.com/xai-org/x-algorithm` — mesin linimasa "For You" yang
 * berjalan sekarang.
 *
 * Januari 2026 X menerbitkan ulang perekomendasinya, kali ini di bawah xAI, dan
 * yang terbit bukan versi baru dari mesin 2023 melainkan mesin yang lain sama
 * sekali. Kalimat repositorinya sendiri yang paling jelas mengatakannya: *"We
 * have eliminated every single hand-engineered feature and most heuristics from
 * the system."* Earlybird, SimClusters, RealGraph, dan seluruh ciri buatan
 * tangan yang dulu diperingkat satu per satu tidak lagi ada di sana. Yang
 * menggantikan mereka satu model: Phoenix, transformer berbasis Grok yang
 * membaca riwayat keterlibatan seorang pemakai lalu meramalkan peluang dua
 * puluh dua tindakan untuk tiap kandidat.
 *
 * Satu hal yang perlu dikatakan lebih dulu, dan panduannya memang
 * mengatakannya: rilis ini membuka **susunannya**, bukan **setelannya**. Rumus
 * penjumlahannya ada, daftar aksinya ada, tetapi tiap bobot dibaca dari
 * `xai_feature_switches::Params` — modul yang tidak ikut diterbitkan. Begitu
 * pula ambang umur postingan, jumlah kandidat yang dipilih, faktor peluruhan
 * keragaman penulis, dan seluruh prompt Grok di `grox/prompts/`. Karena itu
 * `TAK_TERBIT` di bawah bukan catatan kaki melainkan salah satu temuan
 * utamanya, dan satu-satunya angka bobot yang pernah diterbitkan tetap yang
 * lama — lihat `lib/algoritmaArsip.ts`.
 *
 * Diperiksa langsung dari klonanya pada komit `0bfc279` (15 Mei 2026).
 */

export const REPO_KINI = "https://github.com/xai-org/x-algorithm";
export const BERKAS_PERINGKAT = `${REPO_KINI}/blob/main/home-mixer/scorers/ranking_scorer.rs`;
export const BERKAS_PHOENIX = `${REPO_KINI}/blob/main/phoenix/README.md`;
export const BERKAS_GROX = `${REPO_KINI}/tree/main/grox`;

/** Komit yang dibaca, supaya bacaan ini bisa dicocokkan ulang kapan pun. */
export const KOMIT_KINI = "0bfc279";
export const TANGGAL_KINI = "2026-05-15";

/* ============================================================
   Tujuh tahap
   ============================================================ */

export type TahapKini = {
  kode: string;
  nama: KunciTeks;
  teks: KunciTeks;
};

/** Urutan yang dijalankan home-mixer, apa adanya dari README-nya. */
export const TAHAP_KINI: readonly TahapKini[] = [
  { kode: "konteks", nama: "kini.tahap.konteks", teks: "kini.tahap.konteksTeks" },
  { kode: "kandidat", nama: "kini.tahap.kandidat", teks: "kini.tahap.kandidatTeks" },
  { kode: "lengkapi", nama: "kini.tahap.lengkapi", teks: "kini.tahap.lengkapiTeks" },
  { kode: "saringAwal", nama: "kini.tahap.saringAwal", teks: "kini.tahap.saringAwalTeks" },
  { kode: "nilai", nama: "kini.tahap.nilai", teks: "kini.tahap.nilaiTeks" },
  { kode: "pilih", nama: "kini.tahap.pilih", teks: "kini.tahap.pilihTeks" },
  { kode: "saringAkhir", nama: "kini.tahap.saringAkhir", teks: "kini.tahap.saringAkhirTeks" },
];

/* ============================================================
   Dua sumber kandidat
   ============================================================ */

export const SUMBER_KINI: readonly TahapKini[] = [
  { kode: "thunder", nama: "kini.sumber.thunder", teks: "kini.sumber.thunderTeks" },
  { kode: "phoenix", nama: "kini.sumber.phoenix", teks: "kini.sumber.phoenixTeks" },
];

/* ============================================================
   Dua puluh dua aksi yang diramalkan
   ============================================================ */

export type Aksi = {
  /** nama medan di `PhoenixScores`, supaya bisa dicari di repositori */
  medan: string;
  nama: KunciTeks;
  rugi: boolean;
};

/**
 * Seluruh keluaran model peringkat, urut seperti dijumlahkan
 * `compute_weighted_score`.
 *
 * Tanpa bobot — bukan karena disingkat di sini, melainkan karena memang tidak
 * ada di repositorinya. Yang bisa dibaca hanyalah tanda: tujuh belas
 * dijumlahkan sebagai `positive_sum`, lima sisanya sebagai `negative_sum`. Itu
 * pun sudah mengatakan sesuatu — "tidak berhenti membaca" dan "menekan tidak
 * tertarik" duduk di sisi yang berlawanan, dan keduanya dinilai untuk tiap
 * postingan, tiap kali.
 */
export const AKSI: readonly Aksi[] = [
  { medan: "favorite_score", nama: "kini.aksi.suka", rugi: false },
  { medan: "reply_score", nama: "kini.aksi.balas", rugi: false },
  { medan: "retweet_score", nama: "kini.aksi.ulang", rugi: false },
  { medan: "quote_score", nama: "kini.aksi.kutip", rugi: false },
  { medan: "share_score", nama: "kini.aksi.bagikan", rugi: false },
  { medan: "share_via_dm_score", nama: "kini.aksi.bagikanDm", rugi: false },
  { medan: "share_via_copy_link_score", nama: "kini.aksi.bagikanTautan", rugi: false },
  { medan: "click_score", nama: "kini.aksi.buka", rugi: false },
  { medan: "profile_click_score", nama: "kini.aksi.bukaProfil", rugi: false },
  { medan: "quoted_click_score", nama: "kini.aksi.bukaKutipan", rugi: false },
  { medan: "photo_expand_score", nama: "kini.aksi.bukaFoto", rugi: false },
  { medan: "vqv_score", nama: "kini.aksi.video", rugi: false },
  { medan: "quoted_vqv_score", nama: "kini.aksi.videoKutipan", rugi: false },
  { medan: "dwell_score", nama: "kini.aksi.berhenti", rugi: false },
  { medan: "dwell_time", nama: "kini.aksi.lamaBerhenti", rugi: false },
  { medan: "click_dwell_time", nama: "kini.aksi.lamaDibuka", rugi: false },
  { medan: "follow_author_score", nama: "kini.aksi.ikutiPenulis", rugi: false },
  { medan: "not_dwelled_score", nama: "kini.aksi.dilewati", rugi: true },
  { medan: "not_interested_score", nama: "kini.aksi.takTertarik", rugi: true },
  { medan: "mute_author_score", nama: "kini.aksi.bisukan", rugi: true },
  { medan: "block_author_score", nama: "kini.aksi.blokir", rugi: true },
  { medan: "report_score", nama: "kini.aksi.laporkan", rugi: true },
];

export const AKSI_UNTUNG = AKSI.filter((a) => !a.rugi).length;
export const AKSI_RUGI = AKSI.filter((a) => a.rugi).length;

/* ============================================================
   Mekanik yang benar-benar tertulis
   ============================================================ */

export type Mekanik = {
  kode: string;
  nama: KunciTeks;
  /** rumusnya, ditulis dalam kata supaya terbaca tanpa memahami Rust */
  rumus: string;
  teks: KunciTeks;
};

/**
 * Tiga perhitungan yang lolos ke rilis publik lengkap dengan bentuknya.
 *
 * Nilai peubahnya tetap tidak ada, tetapi bentuk rumus sudah cukup untuk satu
 * kesimpulan yang tidak bisa ditawar: pengali keragaman penulis memakai
 * **peringkat postingan itu di antara postingan penulis yang sama**, bukan
 * jarak waktunya. Postingan keduamu yang lolos ke satu tanggapan dikalikan
 * peluruhan pangkat satu, yang ketiga pangkat dua, dan seterusnya — memborong
 * satu jam dengan lima postingan menghukum empat di antaranya, dan tidak ada
 * jumlah keterlibatan yang membatalkan pengali itu.
 */
export const MEKANIK: readonly Mekanik[] = [
  {
    kode: "jumlah",
    nama: "kini.mekanik.jumlah",
    rumus: "Σ (bobot × P(aksi))",
    teks: "kini.mekanik.jumlahTeks",
  },
  {
    kode: "ragam",
    nama: "kini.mekanik.ragam",
    rumus: "(1 − lantai) × peluruhan^posisi + lantai",
    teks: "kini.mekanik.ragamTeks",
  },
  {
    kode: "luar",
    nama: "kini.mekanik.luar",
    rumus: "skor × faktor_luar_jaringan",
    teks: "kini.mekanik.luarTeks",
  },
];

/* ============================================================
   Grok membaca tiap postingan
   ============================================================ */

/**
 * `grox/` — layanan pemahaman isi yang baru muncul di rilis Mei 2026.
 *
 * Sembilan rencana berjalan berbarengan atas tiap postingan (`PlanMaster`), dan
 * semuanya model bahasa yang benar-benar membaca teks serta medianya. Inilah
 * perubahan yang paling mengubah nasihat praktis: mutu tidak lagi ditaksir dari
 * ciri yang dihitung, melainkan dinilai satu model yang membaca postinganmu.
 */
export const GROX: readonly { kode: string; nama: KunciTeks; teks: KunciTeks }[] = [
  { kode: "banger", nama: "kini.grox.banger", teks: "kini.grox.bangerTeks" },
  { kode: "spam", nama: "kini.grox.spam", teks: "kini.grox.spamTeks" },
  { kode: "aman", nama: "kini.grox.aman", teks: "kini.grox.amanTeks" },
  { kode: "balasan", nama: "kini.grox.balasan", teks: "kini.grox.balasanTeks" },
  { kode: "sematan", nama: "kini.grox.sematan", teks: "kini.grox.sematanTeks" },
];

/** Tujuh kebijakan yang diperiksa `safety_ptos.py`, apa adanya dari kodenya. */
export const KEBIJAKAN_AMAN: readonly KunciTeks[] = [
  "kini.aman.spam",
  "kini.aman.benci",
  "kini.aman.kekerasan",
  "kini.aman.mediaKekerasan",
  "kini.aman.dewasa",
  "kini.aman.ilegal",
  "kini.aman.sakitDiri",
];

/* ============================================================
   Yang tidak ikut diterbitkan
   ============================================================ */

/**
 * Batas rilisnya, disebutkan satu per satu.
 *
 * Ini bagian yang paling gampang dilewatkan pembaca ringkasan pihak ketiga, dan
 * paling menentukan cara membaca sisanya: setiap kali sebuah panduan menyebut
 * angka bobot "menurut algoritma X 2026", angka itu tidak datang dari
 * repositori 2026 — karena di sana angkanya memang tidak ada.
 */
export const TAK_TERBIT: readonly { kode: string; nama: KunciTeks; teks: KunciTeks }[] = [
  { kode: "bobot", nama: "kini.takTerbit.bobot", teks: "kini.takTerbit.bobotTeks" },
  { kode: "ambang", nama: "kini.takTerbit.ambang", teks: "kini.takTerbit.ambangTeks" },
  { kode: "prompt", nama: "kini.takTerbit.prompt", teks: "kini.takTerbit.promptTeks" },
  { kode: "model", nama: "kini.takTerbit.model", teks: "kini.takTerbit.modelTeks" },
];

/* ============================================================
   Turunannya untuk penulis
   ============================================================ */

export type Langkah = {
  kode: string;
  teks: KunciTeks;
  /** angka atau aturan yang menjadi dasarnya; ditampilkan di bawah kalimatnya */
  dasar: KunciTeks;
};

/**
 * Enam kesimpulan yang ditarik dari dua rilis sekaligus, dan tiap satunya
 * membawa dasarnya sendiri.
 *
 * Pemisahan ini yang membedakan panduan dari kabar burung: kalimat di `teks`
 * adalah tafsir kami, sedangkan `dasar` adalah angka, rumus, atau aturan yang
 * bisa dibuka dan diperiksa sendiri — di salah satu dari dua repositori itu,
 * atau di halaman kebijakan X.
 */
export const LANGKAH: readonly Langkah[] = [
  { kode: "percakapan", teks: "langkah.percakapan", dasar: "langkah.percakapanDasar" },
  { kode: "balasBalik", teks: "langkah.balasBalik", dasar: "langkah.balasBalikDasar" },
  { kode: "utuh", teks: "langkah.utuh", dasar: "langkah.utuhDasar" },
  { kode: "topik", teks: "langkah.topik", dasar: "langkah.topikDasar" },
  { kode: "jarak", teks: "langkah.jarak", dasar: "langkah.jarakDasar" },
  { kode: "umpan", teks: "langkah.umpan", dasar: "langkah.umpanDasar" },
];
