import { createAvatar } from "@dicebear/core";
import { adventurerNeutral } from "@dicebear/collection";

/**
 * Foto profil bawaan untuk akun yang belum mengunggah apa pun.
 *
 * Gambarnya dibangkitkan dari handle memakai gaya "adventurer-neutral" DiceBear,
 * jadi satu orang selalu mendapat wajah yang sama tanpa ada yang perlu disimpan
 * di basis data. Seluruh SVG dirakit di dalam aplikasi — tidak ada permintaan ke
 * server DiceBear — sehingga avatar tetap muncul saat aplikasi dipakai luring.
 *
 * Gaya ini karya Lisa Wischofsky dengan lisensi CC BY 4.0; keterangannya ada di
 * kaki panel kanan dan di README, bukan di dalam tiap berkas SVG.
 */

/* Blok <metadata> berisi keterangan lisensi yang sama untuk setiap avatar.
   Isinya dibuang di sini supaya satu data URI tidak membawa 2 KB teks yang
   berulang di setiap kartu komentar. */
const METADATA = /<metadata[\s\S]*?<\/metadata>/;

/* Satu wajah dipakai berkali-kali dalam satu sesi: penulis yang sama muncul di
   beranda, di utas, dan di daftar notifikasi. Hasilnya disimpan supaya SVG-nya
   cukup dirakit sekali. */
const SIMPANAN = new Map<string, string>();
const BATAS_SIMPANAN = 300;

export function avatarBawaan(handle: string): string {
  const kunci = handle.toLowerCase();
  const tersimpan = SIMPANAN.get(kunci);
  if (tersimpan) return tersimpan;

  /* Gaya ini menggambar kepala hampir sepenuh bidang; dikecilkan sedikit supaya
     dagunya tidak menyentuh tepi bingkai bulat. */
  const svg = createAvatar(adventurerNeutral, { seed: kunci, scale: 72 })
    .toString()
    .replace(METADATA, "");

  const alamat = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  /* Peta ini hidup selama tab terbuka; batas kasar sudah cukup untuk menjaga
     jejak memorinya tetap kecil pada sesi yang panjang. */
  if (SIMPANAN.size >= BATAS_SIMPANAN) SIMPANAN.clear();
  SIMPANAN.set(kunci, alamat);

  return alamat;
}
