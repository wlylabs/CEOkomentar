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

/** Keterangan lengkap; dipakai sebagai judul tanda centang di sebelah nama. */
const JUDUL: Record<KodeLencana, KunciTeks> = {
  emas: "lencana.emas",
  biru: "lencana.biru",
};

/** Sebutan pendeknya, untuk kalimat yang tidak muat memuat keterangannya. */
const NAMA: Record<KodeLencana, KunciTeks> = {
  emas: "lencana.emasNama",
  biru: "lencana.biruNama",
};

const DIKENAL = new Set<string>(URUTAN);

/**
 * Lencana yang melekat pada peran, bukan pada perbuatan.
 *
 * Centang emas dipasang dan dilepas pemicu basis data mengikuti kolom
 * `is_admin`, jadi ia tidak bisa diberikan atau dicabut satu per satu: yang
 * memberikannya adalah pengangkatan adminnya sendiri. Admin yang mengelola
 * lencana orang lain melihatnya sebagai baris yang terkunci, bukan sebagai
 * tombol yang menolak saat ditekan.
 */
const PERAN = new Set<KodeLencana>(["emas"]);

export function judulLencana(kode: KodeLencana): KunciTeks {
  return JUDUL[kode];
}

export function namaLencana(kode: KodeLencana): KunciTeks {
  return NAMA[kode];
}

/** Benar untuk lencana yang boleh diatur admin lewat /api/admin/lencana. */
export function dapatDiatur(kode: KodeLencana): boolean {
  return !PERAN.has(kode);
}

export function lencanaDikenal(kode: string): kode is KodeLencana {
  return DIKENAL.has(kode);
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
