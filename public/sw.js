/*
 * Service worker Twitter Mini.
 *
 * Tugasnya sengaja dibatasi dua hal:
 *
 *   1. Berkas statis hasil build (/_next/static/*, ikon) disimpan dan disajikan
 *      dari simpanan. Isinya tidak pernah berubah tanpa ganti nama berkas, jadi
 *      aman dipakai selamanya dan membuat pembukaan kedua terasa seketika.
 *
 *   2. Saat jaringan mati, permintaan halaman dijawab satu halaman luring.
 *
 * Yang SENGAJA tidak dilakukan: menyimpan HTML halaman dan jawaban Supabase.
 * Keduanya milik satu akun yang sedang masuk — menyimpannya berarti komentar
 * dan profil orang bisa tertinggal di perangkat setelah ia keluar. Karena itu
 * feed tetap memerlukan jaringan; yang bekerja luring adalah kerangkanya.
 */

const VERSI = "tm-v1";
const SIMPANAN_STATIS = `${VERSI}-statis`;
const LURING = "/luring.html";

/* Ikon dan halaman luring diambil di depan supaya sudah siap sebelum jaringan
   pertama kali hilang. */
const BEKAL = [LURING, "/ikon-192.png", "/ikon-512.png"];

self.addEventListener("install", (peristiwa) => {
  peristiwa.waitUntil(
    caches
      .open(SIMPANAN_STATIS)
      .then((simpanan) => simpanan.addAll(BEKAL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (peristiwa) => {
  peristiwa.waitUntil(
    (async () => {
      const nama = await caches.keys();
      await Promise.all(
        nama.filter((n) => !n.startsWith(VERSI)).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Berkas build: dari simpanan dulu, ambil sekali lalu simpan selamanya. */
async function simpananDulu(permintaan) {
  const simpanan = await caches.open(SIMPANAN_STATIS);
  const tersimpan = await simpanan.match(permintaan);
  if (tersimpan) return tersimpan;

  const jawaban = await fetch(permintaan);
  if (jawaban.ok) simpanan.put(permintaan, jawaban.clone());
  return jawaban;
}

/** Halaman: selalu dari jaringan; kalau gagal, halaman luring yang menjawab. */
async function jaringanDulu(permintaan) {
  try {
    return await fetch(permintaan);
  } catch (galat) {
    const simpanan = await caches.open(SIMPANAN_STATIS);
    const luring = await simpanan.match(LURING);
    if (luring) return luring;
    throw galat;
  }
}

self.addEventListener("fetch", (peristiwa) => {
  const permintaan = peristiwa.request;
  if (permintaan.method !== "GET") return;

  const alamat = new URL(permintaan.url);
  /* Supabase dan alamat luar lainnya dibiarkan lewat apa adanya. */
  if (alamat.origin !== self.location.origin) return;

  if (permintaan.mode === "navigate") {
    peristiwa.respondWith(jaringanDulu(permintaan));
    return;
  }

  if (
    alamat.pathname.startsWith("/_next/static/") ||
    alamat.pathname.endsWith(".png") ||
    alamat.pathname.endsWith(".svg")
  ) {
    peristiwa.respondWith(simpananDulu(permintaan));
  }
});
