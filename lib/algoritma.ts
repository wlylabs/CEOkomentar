import type { KunciTeks } from "./i18n/kamus";

/**
 * Bacaan atas `github.com/twitter/the-algorithm`.
 *
 * Maret 2023 Twitter membuka kode perekomendasi linimasa "For You" — bagaimana
 * kandidat dikumpulkan, dengan apa diperingkat, dan sinyal mana yang dihargai
 * berapa. Berkas ini memindahkan isinya ke dalam aplikasi, bukan sebagai
 * salinan kode melainkan sebagai keterangan: angka-angkanya apa adanya dari
 * repositori, dan kalimat "jadi lakukan ini" disimpan terpisah di `LANGKAH`
 * supaya tidak ada tebakan yang menyamar sebagai kutipan.
 *
 * Batasnya perlu dikatakan sejak awal, dan kartunya memang mengatakannya: yang
 * terbuka adalah potret sistem pada hari itu, bukan mesin yang sedang berjalan
 * hari ini. Yang bertahan lama bukan angkanya melainkan urutannya — percakapan
 * di atas suka, dan umpan negatif jauh di bawah keduanya.
 *
 * Seluruh kalimat tinggal di kamus; di sini hanya kuncinya, supaya panduannya
 * ikut berganti bahasa bersama antarmuka lainnya.
 */

export const REPO_ALGORITMA = "https://github.com/twitter/the-algorithm";
export const REPO_ALGORITMA_ML = "https://github.com/twitter/the-algorithm-ml";

/** README yang memuat tabel bobot heavy ranker beserta keterangan tiap sinyal. */
export const BERKAS_BOBOT =
  "https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md";

/* ============================================================
   Tahapan linimasa
   ============================================================ */

export type KodeTahap = "kandidat" | "peringkat" | "saring" | "sajikan";

export type Tahap = {
  kode: KodeTahap;
  nama: KunciTeks;
  teks: KunciTeks;
};

/** Empat tahap yang disebut README utama repositori, urut dari hulu ke hilir. */
export const TAHAP: readonly Tahap[] = [
  { kode: "kandidat", nama: "algo.tahap.kandidat", teks: "algo.tahap.kandidatTeks" },
  { kode: "peringkat", nama: "algo.tahap.peringkat", teks: "algo.tahap.peringkatTeks" },
  { kode: "saring", nama: "algo.tahap.saring", teks: "algo.tahap.saringTeks" },
  { kode: "sajikan", nama: "algo.tahap.sajikan", teks: "algo.tahap.sajikanTeks" },
];

/* ============================================================
   Dari mana kandidat datang
   ============================================================ */

export type Sumber = {
  kode: string;
  nama: KunciTeks;
  teks: KunciTeks;
  /** angka atau istilah yang dipakai repositori sendiri; kosong bila tidak ada */
  tanda?: KunciTeks;
};

export const SUMBER: readonly Sumber[] = [
  {
    kode: "earlybird",
    nama: "algo.sumber.earlybird",
    teks: "algo.sumber.earlybirdTeks",
    tanda: "algo.sumber.earlybirdTanda",
  },
  { kode: "uteg", nama: "algo.sumber.uteg", teks: "algo.sumber.utegTeks" },
  { kode: "simclusters", nama: "algo.sumber.simclusters", teks: "algo.sumber.simclustersTeks", tanda: "algo.sumber.simclustersTanda" },
  { kode: "realgraph", nama: "algo.sumber.realgraph", teks: "algo.sumber.realgraphTeks" },
  { kode: "frs", nama: "algo.sumber.frs", teks: "algo.sumber.frsTeks" },
];

/* ============================================================
   Bobot sinyal heavy ranker
   ============================================================ */

export type KodeBobot =
  | "laporan"
  | "balasanDibalas"
  | "umpanNegatif"
  | "balasan"
  | "profilKlik"
  | "klikBagus"
  | "klikLama"
  | "ulang"
  | "suka"
  | "video";

export type Bobot = {
  kode: KodeBobot;
  /** nama parameter apa adanya, supaya bisa dicari di repositori */
  parameter: string;
  nilai: number;
  nama: KunciTeks;
  arti: KunciTeks;
};

/**
 * Sepuluh sinyal yang dijumlahkan heavy ranker, dengan bobot seperti tertulis
 * di `the-algorithm-ml`.
 *
 * Urutannya menurut besar nilainya tanpa memandang tanda, bukan positif dulu
 * lalu negatif. Itu disengaja: yang paling menentukan di seluruh daftar justru
 * angka negatif, dan urutan yang memisahkan tanda akan menyembunyikannya di
 * bagian bawah tabel.
 */
export const BOBOT: readonly Bobot[] = [
  {
    kode: "laporan",
    parameter: "scored_tweets_model_weight_report",
    nilai: -369,
    nama: "algo.bobot.laporan",
    arti: "algo.bobot.laporanArti",
  },
  {
    kode: "balasanDibalas",
    parameter: "scored_tweets_model_weight_reply_engaged_by_author",
    nilai: 75,
    nama: "algo.bobot.balasanDibalas",
    arti: "algo.bobot.balasanDibalasArti",
  },
  {
    kode: "umpanNegatif",
    parameter: "scored_tweets_model_weight_negative_feedback_v2",
    nilai: -74,
    nama: "algo.bobot.umpanNegatif",
    arti: "algo.bobot.umpanNegatifArti",
  },
  {
    kode: "balasan",
    parameter: "scored_tweets_model_weight_reply",
    nilai: 13.5,
    nama: "algo.bobot.balasan",
    arti: "algo.bobot.balasanArti",
  },
  {
    kode: "profilKlik",
    parameter: "scored_tweets_model_weight_good_profile_click",
    nilai: 12,
    nama: "algo.bobot.profilKlik",
    arti: "algo.bobot.profilKlikArti",
  },
  {
    kode: "klikBagus",
    parameter: "scored_tweets_model_weight_good_click",
    nilai: 11,
    nama: "algo.bobot.klikBagus",
    arti: "algo.bobot.klikBagusArti",
  },
  {
    kode: "klikLama",
    parameter: "scored_tweets_model_weight_good_click_v2",
    nilai: 10,
    nama: "algo.bobot.klikLama",
    arti: "algo.bobot.klikLamaArti",
  },
  {
    kode: "ulang",
    parameter: "scored_tweets_model_weight_retweet",
    nilai: 1,
    nama: "algo.bobot.ulang",
    arti: "algo.bobot.ulangArti",
  },
  {
    kode: "suka",
    parameter: "scored_tweets_model_weight_fav",
    nilai: 0.5,
    nama: "algo.bobot.suka",
    arti: "algo.bobot.sukaArti",
  },
  {
    kode: "video",
    parameter: "scored_tweets_model_weight_video_playback50",
    nilai: 0.005,
    nama: "algo.bobot.video",
    arti: "algo.bobot.videoArti",
  },
];

/** Bobot suka, satuan pembanding yang paling gampang dibayangkan. */
const BOBOT_SUKA = 0.5;

/** Bobot terbesar di daftar, dipakai sebagai panjang penuh bilah. */
const BOBOT_TERBESAR = Math.max(...BOBOT.map((b) => Math.abs(b.nilai)));

/**
 * Berapa suka yang setara dengan satu sinyal.
 *
 * Angka 13,5 tidak mengatakan apa-apa sendirian; "satu balasan sebanding 27
 * suka" mengatakan seluruhnya. Tandanya dibuang — yang negatif dibaca sebagai
 * kerugian lewat kalimatnya sendiri, bukan lewat angka minus di sini.
 */
export function setaraSuka(nilai: number) {
  return Math.round(Math.abs(nilai) / BOBOT_SUKA);
}

/**
 * Panjang bilah sebuah bobot dalam persen, sebanding lurus dengan angkanya.
 *
 * Sengaja tidak diperhalus dengan akar atau logaritma: yang ingin diperlihatkan
 * memang betapa timpangnya jarak antara laporan dan suka, dan skala yang
 * "diratakan" justru menghapus temuan utamanya. Yang terkecil diberi lantai
 * tipis supaya tetap terlihat sebagai bilah, bukan sebagai baris kosong.
 */
export function panjangBobot(nilai: number) {
  return Math.max(1.2, (Math.abs(nilai) / BOBOT_TERBESAR) * 100);
}

/* ============================================================
   Penyaring setelah pemeringkatan
   ============================================================ */

export type Saring = {
  kode: string;
  nama: KunciTeks;
  teks: KunciTeks;
};

/** Heuristik dan penyaring yang disebut README home-mixer. */
export const SARING: readonly Saring[] = [
  { kode: "visibilitas", nama: "algo.saring.visibilitas", teks: "algo.saring.visibilitasTeks" },
  { kode: "ragam", nama: "algo.saring.ragam", teks: "algo.saring.ragamTeks" },
  { kode: "imbang", nama: "algo.saring.imbang", teks: "algo.saring.imbangTeks" },
  { kode: "lelah", nama: "algo.saring.lelah", teks: "algo.saring.lelahTeks" },
  { kode: "kembar", nama: "algo.saring.kembar", teks: "algo.saring.kembarTeks" },
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
 * Enam kesimpulan, dan tiap satunya membawa dasarnya sendiri.
 *
 * Pemisahan ini yang membedakan panduan dari kabar burung: kalimat di `teks`
 * adalah tafsir kami, sedangkan `dasar` adalah angka atau aturan yang bisa
 * dibuka dan diperiksa sendiri di repositori maupun di halaman kebijakan X.
 */
export const LANGKAH: readonly Langkah[] = [
  { kode: "percakapan", teks: "algo.langkah.percakapan", dasar: "algo.langkah.percakapanDasar" },
  { kode: "balasBalik", teks: "algo.langkah.balasBalik", dasar: "algo.langkah.balasBalikDasar" },
  { kode: "utuh", teks: "algo.langkah.utuh", dasar: "algo.langkah.utuhDasar" },
  { kode: "topik", teks: "algo.langkah.topik", dasar: "algo.langkah.topikDasar" },
  { kode: "jarak", teks: "algo.langkah.jarak", dasar: "algo.langkah.jarakDasar" },
  { kode: "umpan", teks: "algo.langkah.umpan", dasar: "algo.langkah.umpanDasar" },
];
