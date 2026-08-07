import type { Comment } from "./types";

/** Satu baris daftar: komentarnya beserta letaknya dalam percakapan. */
export type BarisUtas = {
  komentar: Comment;
  /**
   * 0 untuk komentar utama, naik satu tiap tingkat balasan.
   *
   * Semua balasan tampil pada indentasi yang sama, jadi angka ini bukan
   * penentu jarak melainkan penentu apakah baris "Membalas @siapa" masih
   * dibutuhkan — pada balasan tingkat satu yang induknya tepat di atasnya,
   * baris itu hanya mengulang apa yang sudah terlihat.
   */
  kedalaman: number;
};

/** Sedalam apa pun percakapannya, kedalaman berhenti dihitung di sini. */
export const KEDALAMAN_MAKS = 3;

/**
 * Menyusun daftar datar menjadi urutan percakapan: tiap komentar utama diikuti
 * balasannya tepat di bawahnya, lalu balasan atas balasan itu, dan seterusnya.
 *
 * Komentar utama tetap dalam urutan yang diberikan — beranda menaruh yang
 * terbaru di puncak — sedangkan balasan justru urut naik supaya satu percakapan
 * terbaca dari atas ke bawah.
 *
 * Balasan yang induknya tidak ikut termuat (masih di halaman berikutnya, atau
 * sudah lewat 24 jam) berdiri sendiri di tempatnya semula, tetap terhitung
 * sebagai balasan tingkat satu.
 */
export function susunUtas(daftar: Comment[]): BarisUtas[] {
  const ada = new Set(daftar.map((k) => k.id));
  const anak = new Map<string, Comment[]>();
  const akar: Comment[] = [];

  for (const k of daftar) {
    if (k.parentId && ada.has(k.parentId)) {
      const serumpun = anak.get(k.parentId);
      if (serumpun) serumpun.push(k);
      else anak.set(k.parentId, [k]);
    } else {
      akar.push(k);
    }
  }

  for (const serumpun of anak.values()) {
    serumpun.sort((a, b) => a.createdAt - b.createdAt);
  }

  /* Rantai induk tidak mungkin berputar karena balasan selalu lahir setelah
     yang dibalasnya, tetapi daftar ini datang dari luar — satu penanda sudah
     cukup untuk memastikan penelusuran ini selalu berhenti. */
  const sudah = new Set<string>();
  const hasil: BarisUtas[] = [];

  function turun(komentar: Comment, kedalaman: number) {
    if (sudah.has(komentar.id)) return;
    sudah.add(komentar.id);
    hasil.push({ komentar, kedalaman });

    for (const balasan of anak.get(komentar.id) ?? []) {
      turun(balasan, Math.min(kedalaman + 1, KEDALAMAN_MAKS));
    }
  }

  for (const k of akar) turun(k, k.parentId ? 1 : 0);

  /* Yang tak terjangkau dari satu akar pun — hanya mungkin bila rantai
     induknya berputar — tetap ikut di ekor. Salah urut masih jauh lebih baik
     daripada komentar yang lenyap tanpa jejak dari daftar. */
  for (const k of daftar) {
    if (!sudah.has(k.id)) turun(k, k.parentId ? 1 : 0);
  }

  return hasil;
}
