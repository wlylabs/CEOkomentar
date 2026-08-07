/**
 * Pembuat berkas ikon aplikasi.
 *
 * Seluruh ikon digambar dari satu geometri yang ditulis di berkas ini, lalu
 * dirender ke PNG. Sebelumnya tiap PNG disimpan sebagai biner hasil ekspor
 * manual, dan keempatnya sempat terpotong di bagian bawah tanpa ketahuan
 * karena tidak ada sumber yang bisa dibandingkan. Dengan satu sumber di sini,
 * ikon yang rusak cukup dibuat ulang, bukan digambar ulang.
 *
 * Butuh sharp, yang sengaja tidak dijadikan dependensi proyek karena hanya
 * dipakai sesekali saat rupa ikon berubah:
 *
 *   npm i --no-save sharp && node design/ikon/buat-ikon.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const BIRU = "#1d9bf0";
const PUTIH = "#ffffff";

/* Semua koordinat memakai kanvas 32x32 supaya angkanya tetap pendek dan sama
   dengan gambar aslinya. */
const KANVAS = 32;

/* Sudut kotak ikon biasa: 7/32 kanvas, seperempat lingkaran yang sama dengan
   yang dipakai peramban saat menampilkan ikon tanpa topeng. */
const SUDUT = 7;

/* Gelembung komentar beserta dua garis teks di dalamnya. Kotak batasnya
   membentang x 7,1..25,4 dan y 6,6..24,3, jadi titik tengahnya bukan titik
   tengah kanvas; ATUR_TENGAH di bawah yang meluruskannya. */
const GELEMBUNG = [
  `<path fill="${PUTIH}" d="M16 6.6c5.2 0 9.4 3.3 9.4 7.5 0 4.1-4.2 7.5-9.4 7.5-.9 0-1.7-.1-2.5-.3l-4.8 3 1.4-4.1c-2-1.4-3-3.3-3-5.5 0-4.2 4.2-7.5 9.4-7.5Z" />`,
  `<path fill="${BIRU}" d="M11.9 12.2h8.2v1.6h-8.2zm0 3.2h5.6V17h-5.6z" />`,
];

const TENGAH_GAMBAR = { x: 16.25, y: 15.45 };

/** Membuang nol di belakang koma supaya penanda transform tetap pendek. */
const angka = (n) => String(Number(n.toFixed(4)));

/**
 * Menaruh gelembung tepat di tengah kanvas pada ukuran tertentu.
 *
 * Susunan translate–scale–translate diringkas jadi satu geseran dan satu
 * pengecilan, jadi berkas yang keluar tidak menyimpan langkah antara.
 *
 * @param {number} skala 1 berarti seukuran gambar aslinya.
 */
function logo(skala) {
  const t = KANVAS / 2;
  const geser = `translate(${angka(t - TENGAH_GAMBAR.x * skala)} ${angka(t - TENGAH_GAMBAR.y * skala)})`;
  const ubah = skala === 1 ? geser : `${geser} scale(${angka(skala)})`;
  return [`<g transform="${ubah}">`, ...GELEMBUNG.map((b) => `  ${b}`), `</g>`];
}

/**
 * Membungkus isi jadi satu berkas SVG.
 *
 * width dan height ikut ditulis karena app/icon.svg dibaca Next sebagai ikon
 * bawaan, dan ukuran itu yang dipakainya saat menyusun tag <link>.
 */
function svg(baris) {
  const isi = baris.map((b) => `  ${b}`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${KANVAS} ${KANVAS}" width="${KANVAS}" height="${KANVAS}">
${isi}
</svg>
`;
}

/* Ikon biasa: kotak bersudut tumpul yang dipakai apa adanya, jadi latarnya
   berhenti di tepi kotak dan sisanya tembus pandang. */
const IKON = svg([
  `<rect width="${KANVAS}" height="${KANVAS}" rx="${SUDUT}" fill="${BIRU}" />`,
  ...logo(1),
]);

/* Isi ikon bertopeng dikecilkan sampai sudut terjauhnya masuk lingkaran aman.
   Lihat catatan di IKON_MASKABLE. */
const SKALA_TOPENG = 0.82;

/* Ikon maskable: latar penuh sampai tepi karena Android memotongnya sendiri
   jadi lingkaran, kotak tumpul, atau bentuk lain sesuai peluncurnya. Isinya
   dikecilkan supaya tetap utuh di dalam lingkaran aman selebar 80% kanvas. */
const IKON_MASKABLE = svg([
  `<rect width="${KANVAS}" height="${KANVAS}" fill="${BIRU}" />`,
  ...logo(SKALA_TOPENG),
]);

/* Ikon iOS: sama-sama penuh sampai tepi karena iOS juga memasang sudut
   tumpulnya sendiri. Bedanya berkas ini diratakan tanpa lapisan tembus
   pandang, sebab iOS menaruh hitam di balik bagian yang transparan. */
const IKON_IOS = svg([
  `<rect width="${KANVAS}" height="${KANVAS}" fill="${BIRU}" />`,
  ...logo(SKALA_TOPENG),
]);

/** Merender SVG ke PNG persegi berukuran `sisi`. */
async function png(sumber, sisi, { ratakan = false } = {}) {
  let gambar = sharp(Buffer.from(sumber), { density: 512 }).resize(sisi, sisi);
  if (ratakan) gambar = gambar.flatten({ background: BIRU });
  return gambar.png({ compressionLevel: 9 }).toBuffer();
}

const berkas = [
  ["app/icon.svg", Buffer.from(IKON)],
  ["public/ikon-192.png", await png(IKON, 192)],
  ["public/ikon-512.png", await png(IKON, 512)],
  ["public/ikon-maskable-512.png", await png(IKON_MASKABLE, 512)],
  ["public/apple-touch-icon.png", await png(IKON_IOS, 180, { ratakan: true })],
];

for (const [tujuan, isi] of berkas) {
  const jalur = join(AKAR, tujuan);
  await mkdir(dirname(jalur), { recursive: true });
  await writeFile(jalur, isi);
  console.log(`${tujuan} — ${isi.length} bita`);
}
