import { MASA_KOMENTAR_MS } from "./kebijakan";
import type { User } from "./types";

/**
 * Sekeping komentar, secukupnya untuk menghitung jangkauannya.
 *
 * Yang menentukan hanya dua hal: id sebagai benih pengacak, dan waktu tulis
 * sebagai penentu sudah sejauh mana kurvanya berjalan. `Comment` utuh memenuhi
 * bentuk ini, begitu juga daftar ringkas yang dibaca untuk menjumlahkan
 * jangkauan satu penulis.
 */
export type JejakKomentar = {
  id: string;
  /** waktu pembuatan dalam epoch ms */
  createdAt: number;
};

/**
 * Seberapa jauh sebuah komentar sampai ke orang: berapa kali terlihat, dan —
 * untuk akun resmi — berapa suka dan posting ulang yang menumpuk di atas angka
 * sebenarnya dari basis data.
 */
export type Jangkauan = {
  tayang: number;
  suka: number;
  ulang: number;
};

const KOSONG: Jangkauan = { tayang: 0, suka: 0, ulang: 0 };

/* Akun biasa hampir tak punya pengikut, tapi komentarnya tetap lewat di beranda
   semua orang. Angka ini lantai tayangannya supaya barisnya tidak selalu nol. */
const TAYANG_DASAR = 320;

/* Bagian pengikut yang benar-benar melihat sebuah komentar. Batas atasnya satu:
   tayangan boleh menyamai jumlah pengikut, tidak pernah melampauinya. */
const BAGIAN_MIN = 0.24;
const BAGIAN_MAKS = 1;

const RASIO_SUKA_MIN = 0.012;
const RASIO_SUKA_MAKS = 0.038;
const RASIO_ULANG_MIN = 0.08;
const RASIO_ULANG_MAKS = 0.24;

/* Bentuk kurva jangkauan. `AWALAN` di atas 1 menahan menit-menit pertama —
   tanpa itu komentar yang baru sedetik lahir sudah dilihat sejuta orang, dan
   justru itu yang terbaca palsu. `KETAJAMAN` mengatur seberapa cepat sisanya
   menyusul setelah tertahan. */
const AWALAN = 1.6;
const KETAJAMAN = 3.4;

/** FNV-1a: id komentar menjadi satu bilangan sebagai benih pengacak. */
function benih(id: string) {
  let nilai = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    nilai ^= id.charCodeAt(i);
    nilai = Math.imul(nilai, 0x01000193);
  }
  return nilai >>> 0;
}

/** mulberry32 — pengacak kecil yang selalu mengulang deret yang sama. */
function pengacak(awal: number) {
  let keadaan = awal;
  return () => {
    keadaan = (keadaan + 0x6d2b79f5) | 0;
    let t = Math.imul(keadaan ^ (keadaan >>> 15), 1 | keadaan);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bagian jangkauan yang sudah terkumpul pada umur tertentu, 0 sampai 1.
 *
 * Bentuknya seperti komentar sungguhan: menit-menit pertama masih sepi, lalu
 * ramai sepanjang paruh pertama harinya, lalu melandai — dan pas menyentuh
 * puncaknya tepat ketika komentarnya kedaluwarsa.
 */
function pertumbuhan(bagianUmur: number) {
  const u = Math.min(1, Math.max(0, bagianUmur));
  return (1 - Math.exp(-KETAJAMAN * u ** AWALAN)) / (1 - Math.exp(-KETAJAMAN));
}

/**
 * Menghitung jangkauan sebuah komentar pada saat `sekarang`.
 *
 * Hasilnya murni dari id komentar dan umurnya, jadi angka yang sama selalu
 * keluar di perangkat mana pun tanpa perlu disimpan. Karena jam aplikasi
 * berdetak tiap menit, angkanya ikut merangkak naik selama komentar itu hidup.
 *
 * Suka dan posting ulang bawaan hanya diberikan kepada akun resmi; komentar
 * orang lain memakai angka apa adanya dan hanya mendapat tayangan.
 */
export function jangkauan(
  komentar: JejakKomentar,
  penulis: User,
  sekarang: number,
): Jangkauan {
  const bagianUmur = (sekarang - komentar.createdAt) / MASA_KOMENTAR_MS;
  if (bagianUmur <= 0) return KOSONG;

  const undi = pengacak(benih(komentar.id));
  /* Tiga undian ditarik sekaligus supaya deretnya tidak bergeser ketika salah
     satunya tidak terpakai. */
  const undiBagian = undi();
  const undiSuka = undi();
  const undiUlang = undi();

  const puncak = Math.max(penulis.followers, TAYANG_DASAR);
  const sasaran = puncak * (BAGIAN_MIN + undiBagian * (BAGIAN_MAKS - BAGIAN_MIN));
  const tayang = Math.round(sasaran * pertumbuhan(bagianUmur));

  if (!penulis.admin) return { tayang, suka: 0, ulang: 0 };

  const suka = Math.round(
    tayang * (RASIO_SUKA_MIN + undiSuka * (RASIO_SUKA_MAKS - RASIO_SUKA_MIN)),
  );
  const ulang = Math.round(
    suka * (RASIO_ULANG_MIN + undiUlang * (RASIO_ULANG_MAKS - RASIO_ULANG_MIN)),
  );

  return { tayang, suka, ulang };
}

/**
 * Menjumlahkan jangkauan seluruh komentar seorang penulis.
 *
 * Ringkasan di profil dan panel kanan memakai ini supaya "suka diterima" di
 * sana adalah jumlah dari angka-angka yang benar-benar terbaca di tiap kartu —
 * bukan hitungan basis data yang diam sementara kartunya terus naik.
 */
export function jangkauanTerkumpul(
  daftar: JejakKomentar[],
  penulis: User,
  sekarang: number,
): Jangkauan {
  let tayang = 0;
  let suka = 0;
  let ulang = 0;

  for (const komentar of daftar) {
    const bagian = jangkauan(komentar, penulis, sekarang);
    tayang += bagian.tayang;
    suka += bagian.suka;
    ulang += bagian.ulang;
  }

  return { tayang, suka, ulang };
}
