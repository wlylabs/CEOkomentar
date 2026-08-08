import type { KunciTeks } from "./i18n/kamus";

/**
 * Katalog lencana.
 *
 * Satu kode per lencana, ditulis sekali di sini dan dipakai basis data
 * (`lencana_pengguna.lencana`), komponen <Lencana>, dan katalog misi. Menambah
 * lencana baru berarti menambah satu baris di `URUTAN` beserta keterangannya —
 * selebihnya ikut sendiri.
 *
 * Urutannya sekaligus urutan tampil di sebelah nama: yang paling jarang lebih
 * dulu, supaya centang emas akun resmi tidak pernah tergeser ke belakang.
 */
export const URUTAN: KodeLencana[] = ["emas", "biru"];

export type KodeLencana = "emas" | "biru";

const JUDUL: Record<KodeLencana, KunciTeks> = {
  emas: "lencana.emas",
  biru: "lencana.biru",
};

const DIKENAL = new Set<string>(URUTAN);

export function judulLencana(kode: KodeLencana): KunciTeks {
  return JUDUL[kode];
}

/**
 * Membaca kolom `profiles.lencana` apa adanya dari basis data.
 *
 * Kode yang belum dikenal versi antarmuka ini dibuang, bukan digambar sebagai
 * kotak kosong: basis data boleh lebih dulu tahu tentang lencana baru daripada
 * berkas ini. Hasilnya selalu urut sesuai katalog di atas.
 */
export function bacaLencana(nilai: unknown): KodeLencana[] {
  if (!Array.isArray(nilai)) return [];
  const ada = new Set(
    nilai.filter((kode): kode is KodeLencana =>
      typeof kode === "string" && DIKENAL.has(kode),
    ),
  );
  return URUTAN.filter((kode) => ada.has(kode));
}
