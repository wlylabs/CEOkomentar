"use client";

/**
 * Jam dinding yang benar-benar berdetak.
 *
 * Seluruh aplikasi memakai satu angka waktu — epoch ms — dan menurunkan
 * segalanya dari sana: umur komentar, jangkauan yang merangkak, jam emas, dan
 * kunci harian rencana di panduan. Berkas ini yang membuat angka itu tetap
 * benar, lalu memecahnya menjadi dua zona yang ditampilkan berdampingan:
 *
 *   WIB (UTC+7) — zona audiens yang dilayani seluruh perhitungan jangkauan
 *   UTC         — zona rujukan, sama di mana pun perangkatnya berada
 *
 * Keduanya dihitung dari epoch, bukan dari zona waktu perangkat, jadi ponsel
 * yang jamnya diset ke Los Angeles tetap melihat WIB yang sama persis dengan
 * ponsel di Jakarta.
 */

import { useEffect, useState } from "react";
import { OFFSET_WIB_MS } from "./jamEmas";

export const DETIK = 1000;
export const MENIT = 60 * DETIK;

export type KunciZona = "wib" | "utc";

export type Zona = {
  kunci: KunciZona;
  /** ditulis apa adanya di layar; nama zona tidak diterjemahkan */
  label: string;
  /** pergeseran dari UTC dalam milidetik */
  offset: number;
};

export const ZONA: readonly Zona[] = [
  { kunci: "wib", label: "WIB", offset: OFFSET_WIB_MS },
  { kunci: "utc", label: "UTC", offset: 0 },
];

export type BagianWaktu = {
  /** 0 Minggu sampai 6 Sabtu */
  hari: number;
  tanggal: number;
  /** 0 Januari sampai 11 Desember */
  bulan: number;
  tahun: number;
  jam: number;
  menit: number;
  detik: number;
};

/**
 * Memecah satu titik epoch menjadi angka-angka jam dinding sebuah zona.
 *
 * Caranya menggeser dulu epoch-nya lalu membaca seluruhnya lewat `getUTC…`:
 * dengan begitu tidak satu pun angka di sini berasal dari zona waktu perangkat.
 */
export function bagianZona(sekarang: number, offset: number): BagianWaktu {
  const t = new Date(sekarang + offset);
  return {
    hari: t.getUTCDay(),
    tanggal: t.getUTCDate(),
    bulan: t.getUTCMonth(),
    tahun: t.getUTCFullYear(),
    jam: t.getUTCHours(),
    menit: t.getUTCMinutes(),
    detik: t.getUTCSeconds(),
  };
}

/**
 * Jam aplikasi: epoch ms yang disegarkan tiap `selang`.
 *
 * Tiga hal yang membedakannya dari `setInterval` biasa, dan ketiganya yang
 * membuat angkanya benar-benar mengikuti jam sungguhan:
 *
 *   1. Detaknya dipatok ke batas satuannya — detik penuh, menit penuh — bukan
 *      ke saat komponen kebetulan terpasang, jadi "14.32" berganti menjadi
 *      "14.33" tepat ketika menitnya berganti, bukan beberapa detik sesudahnya.
 *   2. Setiap detak menghitung ulang jaraknya sendiri, sehingga keterlambatan
 *      satu detak tidak menumpuk menjadi selisih yang makin lebar.
 *   3. Peramban membekukan pewaktu di tab yang tersembunyi. Karena itu waktunya
 *      disamakan ulang begitu halaman kembali terlihat — tanpa itu, tab yang
 *      ditinggal semalam akan bangun sambil masih menunjukkan jam tadi malam.
 */
export function useDetak(selang: number) {
  const [sekarang, setSekarang] = useState(() => Date.now());

  useEffect(() => {
    let pewaktu = 0;

    function jadwalkan() {
      const kini = Date.now();
      pewaktu = window.setTimeout(jadwalkan, selang - (kini % selang));
      setSekarang(kini);
    }

    function samakan() {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(pewaktu);
      jadwalkan();
    }

    pewaktu = window.setTimeout(jadwalkan, selang - (Date.now() % selang));
    document.addEventListener("visibilitychange", samakan);
    window.addEventListener("focus", samakan);

    return () => {
      window.clearTimeout(pewaktu);
      document.removeEventListener("visibilitychange", samakan);
      window.removeEventListener("focus", samakan);
    };
  }, [selang]);

  return sekarang;
}
