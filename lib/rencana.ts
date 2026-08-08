import type { KunciTeks } from "./i18n/kamus";

/**
 * Rencana hari ini: enam langkah yang menerjemahkan panduan menjadi pekerjaan.
 *
 * Panduan tanpa daftar kerja berakhir sebagai bacaan sekali duduk. Daftar ini
 * yang membuatnya berulang — isinya sama tiap hari, dan centangnya kosong lagi
 * tiap tengah malam WIB, karena yang dilatih memang kebiasaannya, bukan
 * penyelesaiannya.
 *
 * Semuanya tinggal di peramban. Tidak ada baris basis data, tidak ada
 * permintaan jaringan: daftar ini catatan pribadi, bukan sesuatu yang perlu
 * diketahui orang lain atau server mana pun.
 */

export type KodeLangkah =
  | "jamEmas"
  | "tanya"
  | "balasBalasan"
  | "temuiOrang"
  | "satuTopik"
  | "tanpaUmpan";

export type ButirRencana = {
  kode: KodeLangkah;
  teks: KunciTeks;
  /** angka atau aturan yang mendasarinya, ditampilkan sebagai baris kecil */
  dasar: KunciTeks;
};

export const RENCANA: readonly ButirRencana[] = [
  { kode: "jamEmas", teks: "rencana.jamEmas", dasar: "rencana.jamEmasDasar" },
  { kode: "tanya", teks: "rencana.tanya", dasar: "rencana.tanyaDasar" },
  {
    kode: "balasBalasan",
    teks: "rencana.balasBalasan",
    dasar: "rencana.balasBalasanDasar",
  },
  { kode: "temuiOrang", teks: "rencana.temuiOrang", dasar: "rencana.temuiOrangDasar" },
  { kode: "satuTopik", teks: "rencana.satuTopik", dasar: "rencana.satuTopikDasar" },
  { kode: "tanpaUmpan", teks: "rencana.tanpaUmpan", dasar: "rencana.tanpaUmpanDasar" },
];

const KODE_DIKENAL = new Set<string>(RENCANA.map((butir) => butir.kode));

const KUNCI_SIMPAN = "twitter-mini.rencana";

type Tersimpan = { tanggal: string; selesai: string[] };

/**
 * Isi centang untuk satu tanggal WIB.
 *
 * Yang tersimpan hanya satu hari. Begitu tanggalnya berganti, catatan kemarin
 * tidak dibaca lagi dan tertimpa sendiri pada centang pertama hari ini —
 * daftarnya memang tidak dimaksudkan sebagai riwayat.
 *
 * Kode yang tidak dikenal dibuang: daftar langkah boleh berubah di rilis
 * berikutnya, dan catatan lama tidak boleh menghidupkan langkah yang sudah
 * tidak ada.
 */
export function bacaRencana(tanggal: string): KodeLangkah[] {
  if (typeof window === "undefined") return [];

  try {
    const mentah = window.localStorage.getItem(KUNCI_SIMPAN);
    if (!mentah) return [];

    const isi = JSON.parse(mentah) as Partial<Tersimpan> | null;
    if (!isi || isi.tanggal !== tanggal || !Array.isArray(isi.selesai)) return [];

    return isi.selesai.filter((kode): kode is KodeLangkah =>
      typeof kode === "string" && KODE_DIKENAL.has(kode),
    );
  } catch {
    /* Penyimpanan lokal bisa ditolak (mode penyamaran, kuota penuh, setelan
       peramban) dan isinya bisa rusak. Keduanya bukan alasan menggagalkan
       halaman — daftarnya cukup mulai dari kosong. */
    return [];
  }
}

export function simpanRencana(tanggal: string, selesai: KodeLangkah[]) {
  if (typeof window === "undefined") return;

  try {
    const isi: Tersimpan = { tanggal, selesai };
    window.localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(isi));
  } catch {
    /* Sama seperti di atas: centangnya tetap berlaku di layar untuk sesi ini,
       hanya tidak terbawa ke kunjungan berikutnya. */
  }
}
