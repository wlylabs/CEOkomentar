/**
 * Dua bahasa antarmuka: Indonesia dan Inggris.
 *
 * Pilihannya disimpan di kuki, bukan localStorage, karena halaman pertama
 * dirender di server. Server harus sudah tahu bahasanya sebelum HTML dikirim
 * supaya tidak ada teks yang berkedip berganti bahasa setelah hidrasi.
 */

export type Bahasa = "id" | "en";

export const BAHASA_BAWAAN: Bahasa = "id";

export const DAFTAR_BAHASA: Bahasa[] = ["id", "en"];

export const KUNCI_BAHASA = "tm-bahasa";

/** Satu tahun; pilihan bahasa tidak perlu ditanyakan tiap kunjungan. */
export const UMUR_KUKI_BAHASA = 60 * 60 * 24 * 365;

/** Nama bahasa ditulis dalam bahasanya sendiri, seperti kebiasaan pemilih bahasa. */
export const NAMA_BAHASA: Record<Bahasa, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

/** Label pendek untuk tombol sempit. */
export const KODE_BAHASA: Record<Bahasa, string> = {
  id: "ID",
  en: "EN",
};

/** Lokal untuk Intl.NumberFormat dan sejenisnya. */
export const LOKAL: Record<Bahasa, string> = {
  id: "id-ID",
  en: "en-US",
};

export function bacaBahasa(nilai: string | null | undefined): Bahasa {
  return nilai === "en" || nilai === "id" ? nilai : BAHASA_BAWAAN;
}

/** Bahasa berikutnya dalam putaran; dipakai tombol pengalih dua arah. */
export function bahasaLain(bahasa: Bahasa): Bahasa {
  return bahasa === "id" ? "en" : "id";
}
