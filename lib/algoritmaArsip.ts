import type { KunciTeks } from "./i18n/kamus";

/**
 * Bacaan atas `github.com/twitter/the-algorithm` — rilis 2023, yang sudah
 * digantikan.
 *
 * Maret 2023 Twitter membuka kode perekomendasi linimasa "For You": bagaimana
 * kandidat dikumpulkan, dengan apa diperingkat, dan sinyal mana yang dihargai
 * berapa. Rilis 2026 di `lib/algoritmaKini.ts` menggantikan hampir seluruh
 * mesinnya, tetapi berkas ini tetap tinggal karena satu alasan yang tidak bisa
 * digantikan rilis mana pun: **hanya di sinilah bobot tiap sinyal pernah
 * diterbitkan sebagai angka.** Penerus 2026-nya memuat rumusnya, memuat daftar
 * aksinya, dan tidak memuat satu pun angkanya.
 *
 * Jadi yang dibaca dari berkas ini bukan besar bobotnya hari ini melainkan
 * arahnya: percakapan jauh di atas suka, dan umpan negatif jauh di bawah
 * keduanya. Kartunya di panduan mengatakan persis itu, dan mengatakannya
 * sebelum menampilkan satu pun angka.
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
  { kode: "kandidat", nama: "arsip.tahap.kandidat", teks: "arsip.tahap.kandidatTeks" },
  { kode: "peringkat", nama: "arsip.tahap.peringkat", teks: "arsip.tahap.peringkatTeks" },
  { kode: "saring", nama: "arsip.tahap.saring", teks: "arsip.tahap.saringTeks" },
  { kode: "sajikan", nama: "arsip.tahap.sajikan", teks: "arsip.tahap.sajikanTeks" },
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
    nama: "arsip.sumber.earlybird",
    teks: "arsip.sumber.earlybirdTeks",
    tanda: "arsip.sumber.earlybirdTanda",
  },
  { kode: "uteg", nama: "arsip.sumber.uteg", teks: "arsip.sumber.utegTeks" },
  { kode: "simclusters", nama: "arsip.sumber.simclusters", teks: "arsip.sumber.simclustersTeks", tanda: "arsip.sumber.simclustersTanda" },
  { kode: "realgraph", nama: "arsip.sumber.realgraph", teks: "arsip.sumber.realgraphTeks" },
  { kode: "frs", nama: "arsip.sumber.frs", teks: "arsip.sumber.frsTeks" },
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
    nama: "arsip.bobot.laporan",
    arti: "arsip.bobot.laporanArti",
  },
  {
    kode: "balasanDibalas",
    parameter: "scored_tweets_model_weight_reply_engaged_by_author",
    nilai: 75,
    nama: "arsip.bobot.balasanDibalas",
    arti: "arsip.bobot.balasanDibalasArti",
  },
  {
    kode: "umpanNegatif",
    parameter: "scored_tweets_model_weight_negative_feedback_v2",
    nilai: -74,
    nama: "arsip.bobot.umpanNegatif",
    arti: "arsip.bobot.umpanNegatifArti",
  },
  {
    kode: "balasan",
    parameter: "scored_tweets_model_weight_reply",
    nilai: 13.5,
    nama: "arsip.bobot.balasan",
    arti: "arsip.bobot.balasanArti",
  },
  {
    kode: "profilKlik",
    parameter: "scored_tweets_model_weight_good_profile_click",
    nilai: 12,
    nama: "arsip.bobot.profilKlik",
    arti: "arsip.bobot.profilKlikArti",
  },
  {
    kode: "klikBagus",
    parameter: "scored_tweets_model_weight_good_click",
    nilai: 11,
    nama: "arsip.bobot.klikBagus",
    arti: "arsip.bobot.klikBagusArti",
  },
  {
    kode: "klikLama",
    parameter: "scored_tweets_model_weight_good_click_v2",
    nilai: 10,
    nama: "arsip.bobot.klikLama",
    arti: "arsip.bobot.klikLamaArti",
  },
  {
    kode: "ulang",
    parameter: "scored_tweets_model_weight_retweet",
    nilai: 1,
    nama: "arsip.bobot.ulang",
    arti: "arsip.bobot.ulangArti",
  },
  {
    kode: "suka",
    parameter: "scored_tweets_model_weight_fav",
    nilai: 0.5,
    nama: "arsip.bobot.suka",
    arti: "arsip.bobot.sukaArti",
  },
  {
    kode: "video",
    parameter: "scored_tweets_model_weight_video_playback50",
    nilai: 0.005,
    nama: "arsip.bobot.video",
    arti: "arsip.bobot.videoArti",
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
  { kode: "visibilitas", nama: "arsip.saring.visibilitas", teks: "arsip.saring.visibilitasTeks" },
  { kode: "ragam", nama: "arsip.saring.ragam", teks: "arsip.saring.ragamTeks" },
  { kode: "imbang", nama: "arsip.saring.imbang", teks: "arsip.saring.imbangTeks" },
  { kode: "lelah", nama: "arsip.saring.lelah", teks: "arsip.saring.lelahTeks" },
  { kode: "kembar", nama: "arsip.saring.kembar", teks: "arsip.saring.kembarTeks" },
];

/* Kesimpulan untuk penulis tidak lagi tinggal di sini. Sejak rilis 2026 ia
   ditarik dari dua rilis sekaligus, jadi tempatnya `LANGKAH` di
   `lib/algoritmaKini.ts` — bukan di berkas yang hanya mengenal salah satunya. */
