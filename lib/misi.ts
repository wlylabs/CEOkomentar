import type { KunciTeks } from "./i18n/kamus";
import type { KodeLencana } from "./lencana";

/**
 * Katalog misi.
 *
 * Basis data memegang daftar misi yang berlaku (tabel `misi`) beserta lencana
 * hadiahnya; berkas ini memegang sisi antarmukanya — kalimat, ikon, dan cara
 * misinya dikerjakan. Keduanya bertemu lewat `kode`.
 *
 * Menambah misi baru berarti tiga hal, dan hanya tiga:
 *   1. satu baris `insert into public.misi (kode, lencana, urutan)`;
 *   2. satu entri di `KATALOG` di bawah beserta kalimatnya di kamus;
 *   3. satu pemeriksa di server yang memanggil `selesaikan_misi()` — misi tidak
 *      pernah boleh ditandai selesai dari peramban.
 */

/** Akun resmi yang harus diikuti untuk mendapatkan centang biru. */
export const AKUN_X = "CEOkomentar";

export const PROFIL_X = `https://x.com/${AKUN_X}`;

export type KodeMisi = "ikuti-x";

/**
 * `belum`    — belum pernah diperiksa, atau pemeriksaannya belum lolos
 * `menunggu` — sudah dikirim, menunggu keputusan (dipakai misi bertinjauan)
 * `selesai`  — lencananya sudah diberikan
 */
export type StatusMisi = "belum" | "menunggu" | "selesai";

export type Misi = {
  kode: KodeMisi;
  lencana: KodeLencana;
  urutan: number;
  status: StatusMisi;
  /** keterangan singkat dari pemeriksanya, misalnya username X yang terikat */
  bukti: { x_username?: string };
};

type Keterangan = {
  judul: KunciTeks;
  teks: KunciTeks;
  /** kalimat selama misinya menunggu keputusan; hanya untuk misi bertinjauan */
  menunggu?: KunciTeks;
  /** kalimat yang muncul setelah lencananya didapat */
  selesai: KunciTeks;
  /** langkah-langkah pengerjaan, ditampilkan sebagai daftar bernomor */
  langkah: KunciTeks[];
};

export const KATALOG: Record<KodeMisi, Keterangan> = {
  "ikuti-x": {
    judul: "misi.ikutiX.judul",
    teks: "misi.ikutiX.teks",
    menunggu: "misi.ikutiX.menunggu",
    selesai: "misi.ikutiX.selesai",
    langkah: [
      "misi.ikutiX.langkah1",
      "misi.ikutiX.langkah2",
      "misi.ikutiX.langkah3",
    ],
  },
};

const DIKENAL = new Set<string>(Object.keys(KATALOG));

export function misiDikenal(kode: string): kode is KodeMisi {
  return DIKENAL.has(kode);
}

/**
 * Hasil pemeriksaan yang dibawa pulang alur verifikasi X lewat query string.
 * Nilainya sengaja berupa kata kunci, bukan kalimat: kalimatnya milik kamus,
 * jadi kabar yang muncul mengikuti bahasa yang sedang dipakai.
 */
export const HASIL = [
  "berhasil",
  "sudah",
  "menunggu",
  "belumIkut",
  "belumSegar",
  "terpakai",
  "lain",
  "belumSiap",
  "takTersedia",
  "ditolak",
  "gagal",
  "terlaluSering",
  "dicabut",
] as const;

export type HasilMisi = (typeof HASIL)[number];

const HASIL_DIKENAL = new Set<string>(HASIL);

export function bacaHasil(nilai: string | null): HasilMisi | null {
  return nilai && HASIL_DIKENAL.has(nilai) ? (nilai as HasilMisi) : null;
}

export const PESAN_HASIL: Record<HasilMisi, KunciTeks> = {
  berhasil: "misi.hasil.berhasil",
  sudah: "misi.hasil.sudah",
  menunggu: "misi.hasil.menunggu",
  belumIkut: "misi.hasil.belumIkut",
  belumSegar: "misi.hasil.belumSegar",
  terpakai: "misi.hasil.terpakai",
  lain: "misi.hasil.lain",
  belumSiap: "misi.hasil.belumSiap",
  takTersedia: "misi.hasil.takTersedia",
  ditolak: "misi.hasil.ditolak",
  gagal: "misi.hasil.gagal",
  terlaluSering: "misi.hasil.terlaluSering",
  dicabut: "misi.hasil.dicabut",
};
