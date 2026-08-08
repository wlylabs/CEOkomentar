import type { KunciTeks } from "./i18n/kamus";

/**
 * Kebijakan Creator Studio X (Twitter), sejauh yang diumumkan X sendiri.
 *
 * Creator Studio adalah tempat X mengumpulkan analitik, program bagi hasil, dan
 * langganan berbayar sebuah akun. Yang dituliskan di sini hanya syarat dan
 * aturan yang terbuka di halaman bantuan X — bukan cara memintasnya, dan bukan
 * angka yang beredar dari mulut ke mulut.
 *
 * Semua ambangnya milik X dan berubah tanpa pemberitahuan. Karena itu ada
 * `DIPERIKSA` di bawah, dan kartunya selalu menutup dengan tautan ke halaman
 * aslinya: yang berlaku adalah yang tertulis di sana pada hari kamu membacanya,
 * bukan salinan di dalam aplikasi ini.
 */

/**
 * Kapan daftar ini terakhir dicocokkan dengan halaman bantuan X.
 *
 * Ditulis sebagai tanggal ISO, bukan sebagai kalimat, supaya bulannya bisa
 * dieja sesuai bahasa antarmuka lewat `bulanTahun()` — dan supaya yang
 * memperbaruinya nanti cukup mengganti satu angka.
 */
export const DIPERIKSA = "2026-08-01";

export const BANTUAN_X = "https://help.x.com/en/using-x";
export const TAUTAN_STANDAR = `${BANTUAN_X}/creator-monetization-standards`;
export const TAUTAN_BAGI_HASIL = `${BANTUAN_X}/x-ads-revenue-sharing`;
export const TAUTAN_LANGGANAN = `${BANTUAN_X}/creator-subscriptions`;
export const STUDIO = "https://x.com/i/monetization";

/* ============================================================
   Program
   ============================================================ */

export type Program = {
  kode: string;
  nama: KunciTeks;
  teks: KunciTeks;
  tautan: string;
};

export const PROGRAM: readonly Program[] = [
  {
    kode: "bagiHasil",
    nama: "kreator.program.bagiHasil",
    teks: "kreator.program.bagiHasilTeks",
    tautan: TAUTAN_BAGI_HASIL,
  },
  {
    kode: "langganan",
    nama: "kreator.program.langganan",
    teks: "kreator.program.langgananTeks",
    tautan: TAUTAN_LANGGANAN,
  },
  {
    kode: "tip",
    nama: "kreator.program.tip",
    teks: "kreator.program.tipTeks",
    tautan: `${BANTUAN_X}/tips`,
  },
];

/* ============================================================
   Syarat masuk
   ============================================================ */

export type Syarat = {
  kode: string;
  nama: KunciTeks;
  teks: KunciTeks;
};

export const SYARAT: readonly Syarat[] = [
  { kode: "premium", nama: "kreator.syarat.premium", teks: "kreator.syarat.premiumTeks" },
  { kode: "pengikut", nama: "kreator.syarat.pengikut", teks: "kreator.syarat.pengikutTeks" },
  { kode: "tayangan", nama: "kreator.syarat.tayangan", teks: "kreator.syarat.tayanganTeks" },
  { kode: "pembayaran", nama: "kreator.syarat.pembayaran", teks: "kreator.syarat.pembayaranTeks" },
  { kode: "standar", nama: "kreator.syarat.standar", teks: "kreator.syarat.standarTeks" },
];

/* ============================================================
   Yang membuat sebuah akun kehilangan monetisasinya
   ============================================================ */

/**
 * Ringkasan Creator Monetization Standards.
 *
 * Bagian inilah yang paling sering bertabrakan dengan "kiat viral" yang beredar:
 * beberapa taktik yang dijanjikan menaikkan jangkauan justru persis yang
 * dilarang di sini — dan sekalinya monetisasi dicabut, jangkauan tidak lagi jadi
 * pertanyaan.
 */
export const LARANGAN: readonly { kode: string; teks: KunciTeks }[] = [
  { kode: "umpan", teks: "kreator.larangan.umpan" },
  { kode: "spam", teks: "kreator.larangan.spam" },
  { kode: "jiplak", teks: "kreator.larangan.jiplak" },
  { kode: "sesat", teks: "kreator.larangan.sesat" },
  { kode: "kasar", teks: "kreator.larangan.kasar" },
  { kode: "dewasa", teks: "kreator.larangan.dewasa" },
];
