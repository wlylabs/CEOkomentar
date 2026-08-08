/**
 * Rem laju sederhana untuk Route Handler.
 *
 * Jendela geser di memori proses: cukup untuk menahan percobaan beruntun dari
 * satu akun atau satu alamat, dan tidak menambah ketergantungan apa pun. Yang
 * perlu diingat ketika aplikasinya berjalan di banyak instans: hitungannya
 * per-instans, jadi ini lapis pertama, bukan satu-satunya — lapis yang tidak
 * bisa dilewati ada di basis data (ikatan akun X yang permanen dan pemeriksaan
 * ulang yang selalu menanyakan keadaan sebenarnya ke X).
 */

type Jejak = { sisa: number; sampai: number };

const JEJAK = new Map<string, Jejak>();

/* Peta ini dibersihkan sambil lalu, bukan lewat pewaktu, supaya tidak ada
   pekerjaan yang tertinggal hidup di proses yang seharusnya menganggur. */
const BATAS_JEJAK = 5_000;

function bersihkan(sekarang: number) {
  for (const [kunci, jejak] of JEJAK) {
    if (jejak.sampai <= sekarang) JEJAK.delete(kunci);
  }
}

/**
 * Mengambil satu jatah. Mengembalikan false bila jatahnya sudah habis untuk
 * jendela waktu yang sedang berjalan.
 */
export function ambilJatah(
  kunci: string,
  batas: number,
  jendelaMs: number,
): boolean {
  const sekarang = Date.now();
  if (JEJAK.size > BATAS_JEJAK) bersihkan(sekarang);

  const jejak = JEJAK.get(kunci);

  if (!jejak || jejak.sampai <= sekarang) {
    JEJAK.set(kunci, { sisa: batas - 1, sampai: sekarang + jendelaMs });
    return true;
  }

  if (jejak.sisa <= 0) return false;

  jejak.sisa -= 1;
  return true;
}

/**
 * Alamat pemanggil sejauh yang bisa dipercaya.
 *
 * Di belakang proksi (Vercel, Cloudflare, Nginx) alamat aslinya ada di header
 * yang ditulis proksi itu sendiri; tanpa proksi header itu bisa dikarang
 * siapa saja. Karena itu nilainya hanya dipakai sebagai kunci rem laju —
 * tidak pernah untuk keputusan izin.
 */
export function alamatPemanggil(permintaan: Request): string {
  const kepala = permintaan.headers;
  const teruskan = kepala.get("x-forwarded-for");
  const pertama = teruskan?.split(",")[0]?.trim();
  return pertama || kepala.get("x-real-ip") || "tanpa-alamat";
}
