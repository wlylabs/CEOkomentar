import type { KunciTeks } from "./i18n/kamus";
import type { KodeLencana } from "./lencana";
import { uraiTautanX } from "./tautan";

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
 *   3. satu cara memutuskannya di server — pemeriksa yang memanggil
 *      `selesaikan_misi()`, atau keputusan admin lewat `atur_lencana_admin()`.
 *      Misi tidak pernah boleh ditandai selesai dari peramban.
 */

/**
 * Akun X yang harus diikuti untuk mendapatkan centang biru.
 *
 * Ditulis sekali di sini dan dipakai seluruh antarmuka: tombol yang membuka
 * profilnya, kalimat pengajuan yang disalin pemakai, dan setiap kalimat di
 * kamus yang menyebutnya lewat isian `{akun}`. Menggantinya cukup satu baris.
 *
 * Ini bukan handle admin di aplikasi ini — yang itu ditetapkan
 * `public.handle_admin()` di basis data dan kebetulan pernah sama.
 */
export const AKUN_X = "gaptekcat";

export const PROFIL_X = `https://x.com/${AKUN_X}`;

export type KodeMisi = "ikuti-x";

/**
 * `belum`    — belum pernah diajukan, atau pengajuannya belum diputuskan
 * `menunggu` — sudah diajukan, menunggu keputusan (dipakai misi bertinjauan)
 * `selesai`  — lencananya sudah diberikan
 */
export type StatusMisi = "belum" | "menunggu" | "selesai";

export type Misi = {
  kode: KodeMisi;
  lencana: KodeLencana;
  urutan: number;
  status: StatusMisi;
  /** keterangan singkat dari yang memutuskannya */
  bukti: { x_username?: string; oleh?: string };
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

/* ============================================================
   Klaim yang diposting sendiri
   ============================================================ */

/**
 * Tagar yang menempel di setiap pengajuan.
 *
 * Aplikasi ini tidak punya kotak cari — yang menyaring beranda hanyalah tagar
 * yang ditekan. Tanpa satu tagar bersama, admin harus menggulir seluruh beranda
 * mencari pengajuan di antara komentar biasa; dengan tagar ini, menekannya
 * sekali (di kartu mana pun atau di papan tren) menyisakan tepat pengajuannya.
 *
 * Ia sekaligus satu-satunya bagian pengajuan yang tidak ikut berganti bahasa:
 * kalimatnya diterjemahkan (`misi.klaim.kalimat` di kamus), tagarnya tidak.
 * Itulah sebabnya pengajuan berbahasa Indonesia dan berbahasa Inggris tetap
 * berkumpul di satu tagar yang sama.
 */
export const TAGAR_KLAIM = "TwitterMini";

/** Handle X: huruf, angka, dan garis bawah, paling panjang 15. */
const POLA_HANDLE = /^[A-Za-z0-9_]{1,15}$/;

/**
 * Membaca isian "tautan profil X" dengan lapang dada.
 *
 * Yang diterima: tautan penuh (`https://x.com/budi`), tautan tanpa protokol
 * (`x.com/budi`), nama berawalan @, dan nama polos. Yang ditolak: tautan ke
 * sebuah postingan, alamat di luar X, dan nama yang bentuknya tidak mungkin
 * menjadi handle X. Mengembalikan handle-nya saja, tanpa @.
 */
export function bacaProfilX(masukan: string): string | null {
  const bersih = masukan.trim();
  if (!bersih) return null;

  if (POLA_HANDLE.test(bersih.replace(/^@/, ""))) {
    return bersih.replace(/^@/, "");
  }

  const tautan = uraiTautanX(bersih);
  /* Tautan yang menunjuk sebuah postingan punya `status`; yang dibutuhkan di
     sini profilnya, karena itu yang bisa dicocokkan ke daftar pengikut. */
  if (!tautan || tautan.status || !tautan.handle) return null;
  return tautan.handle;
}

export function tautanProfilX(handle: string): string {
  return `https://x.com/${handle}`;
}

/**
 * Isi komentar yang diposting pemakai sebagai pengajuan misi: kalimat klaim di
 * baris pertama, tautan profilnya di baris terakhir — persis bentuk yang
 * dilampirkan komposer sebagai kartu pratinjau.
 *
 * Kalimatnya datang dari kamus, jadi ia dikirimkan ke sini sudah jadi: berkas
 * ini tidak tahu bahasa apa pun, dan tidak perlu tahu.
 */
export function teksKlaim(kalimat: string, handle: string): string {
  return `${kalimat}\n${tautanProfilX(handle)}`;
}
