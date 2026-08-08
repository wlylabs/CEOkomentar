/**
 * Tautan X (dulu Twitter): pengenalan, perapian, dan penyaringan.
 *
 * Hanya tautan X yang boleh masuk ke komentar. Aturannya ditulis sekali di
 * sini supaya komposer (yang menolak tempelan asing) dan kartu komentar (yang
 * menggambar pratinjaunya) memakai pemahaman yang sama persis tentang bentuk
 * tautan yang sah.
 */

/** Inang yang diakui sebagai X; keduanya menunjuk situs yang sama. */
const INANG_X = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "m.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
  "m.twitter.com",
]);

/** Handle X: huruf, angka, dan garis bawah, paling panjang 15. */
const POLA_HANDLE = /^[A-Za-z0-9_]{1,15}$/;

/** Nomor status selalu angka; panjangnya bertambah seiring waktu. */
const POLA_STATUS = /^[0-9]{1,25}$/;

/**
 * Bentuk alamat di dalam teks bebas.
 *
 * Sengaja hanya mengenali yang jelas-jelas alamat — berawalan protokol atau
 * `www.` — supaya kalimat biasa yang kebetulan memuat titik tidak ikut
 * tertangkap dan membuat komentar yang tak bersalah ditolak.
 */
const POLA_ALAMAT = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;

export type TautanX = {
  /** alamat yang sudah dirapikan; selalu berpangkal di x.com dan tanpa jejak */
  url: string;
  /** pemilik status; null bila tautannya berbentuk /i/status/… */
  handle: string | null;
  /** nomor status; null bila yang ditempel tautan profil */
  status: string | null;
};

/** Semua yang berbentuk alamat di dalam sebuah teks, apa pun tujuannya. */
export function cariAlamat(teks: string): string[] {
  return teks.match(POLA_ALAMAT) ?? [];
}

/**
 * Membaca satu alamat sebagai tautan X. Mengembalikan null untuk apa pun yang
 * bukan — inang lain, jalur yang tidak dikenali, atau teks yang bahkan bukan
 * alamat.
 */
export function uraiTautanX(mentah: string): TautanX | null {
  const dipangkas = mentah.trim().replace(/[.,;:!?)\]]+$/, "");
  if (!dipangkas) return null;

  let alamat: URL;
  try {
    alamat = new URL(
      /^https?:\/\//i.test(dipangkas) ? dipangkas : `https://${dipangkas}`,
    );
  } catch {
    return null;
  }

  if (!INANG_X.has(alamat.hostname.toLowerCase())) return null;

  /* Parameter kueri di tautan X hampir selalu jejak asal bagikan (`?s=20`,
     `?t=…`), jadi tidak ada yang perlu dibawa; jalurnya sendiri yang menentukan
     apa yang ditunjuk. */
  const ruas = alamat.pathname.split("/").filter(Boolean);
  if (ruas.length === 0) return null;

  /* /i/status/123 dan /i/web/status/123 — bentuk tanpa nama pemilik. */
  if (ruas[0] === "i") {
    const status = ruas[1] === "status" ? ruas[2] : ruas[1] === "web" && ruas[2] === "status" ? ruas[3] : null;
    if (!status || !POLA_STATUS.test(status)) return null;
    return { url: `https://x.com/i/status/${status}`, handle: null, status };
  }

  if (!POLA_HANDLE.test(ruas[0])) return null;
  const handle = ruas[0];

  /* /jack/status/123, termasuk ekor /photo/1 atau /video/1 yang ikut tersalin. */
  if (ruas[1] === "status" || ruas[1] === "statuses") {
    const status = ruas[2];
    if (!status || !POLA_STATUS.test(status)) return null;
    return { url: `https://x.com/${handle}/status/${status}`, handle, status };
  }

  /* Tautan profil polos; selain itu jalurnya tidak dikenali. */
  if (ruas.length === 1) {
    return { url: `https://x.com/${handle}`, handle, status: null };
  }

  return null;
}

/** Alamat di dalam teks yang bukan tautan X — yang inilah yang ditolak. */
export function alamatAsing(teks: string): string[] {
  return cariAlamat(teks).filter((alamat) => !uraiTautanX(alamat));
}

/**
 * Memisahkan tautan X terakhir dari isi komentar.
 *
 * Yang terakhir, seperti di X sendiri: tautan yang ditempel paling belakang
 * itulah yang jadi kartu, sedangkan alamat yang tertulis di tengah kalimat
 * tetap tinggal sebagai bagian kalimatnya.
 */
export function petikTautanX(teks: string): { teks: string; tautan: TautanX | null } {
  const alamat = cariAlamat(teks);

  for (let i = alamat.length - 1; i >= 0; i -= 1) {
    const tautan = uraiTautanX(alamat[i]);
    if (!tautan) continue;

    const posisi = teks.lastIndexOf(alamat[i]);
    const sisa = (teks.slice(0, posisi) + teks.slice(posisi + alamat[i].length)).trim();
    return { teks: sisa, tautan };
  }

  return { teks, tautan: null };
}

/** Bentuk pendek untuk ditulis di kartu: tanpa protokol dan tanpa `www.`. */
export function alamatRingkas(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

/**
 * Membaca isian "tautan profil X" dengan lapang dada.
 *
 * Yang diterima: tautan penuh (`https://x.com/budi`), tautan tanpa protokol
 * (`x.com/budi`), nama berawalan @, dan nama polos. Yang ditolak: tautan ke
 * sebuah postingan, alamat di luar X, dan nama yang bentuknya tidak mungkin
 * menjadi handle X. Mengembalikan handle-nya saja, tanpa @.
 *
 * Dipakai dua kotak yang menanyakan hal yang sama: pengajuan misi centang biru
 * dan bidang "Akun X" di sunting profil. Keduanya harus berlapang dada dengan
 * cara yang persis sama, jadi aturannya tinggal di sini, bersama pembacaan
 * tautan X yang lain.
 */
export function bacaProfilX(masukan: string): string | null {
  const bersih = masukan.trim();
  if (!bersih) return null;

  if (POLA_HANDLE.test(bersih.replace(/^@/, ""))) {
    return bersih.replace(/^@/, "");
  }

  /* Tautan yang menunjuk sebuah postingan punya `status`; yang dibutuhkan di
     sini profilnya, karena itu yang bisa dicocokkan ke daftar pengikut. */
  const tautan = uraiTautanX(bersih);
  if (!tautan || tautan.status || !tautan.handle) return null;
  return tautan.handle;
}

export function tautanProfilX(handle: string): string {
  return `https://x.com/${handle}`;
}
