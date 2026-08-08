"use client";

import Brand from "./Brand";
import { useBahasa } from "@/lib/i18n/konteks";

type Varian = "gerbang" | "samping";

type Props = { varian?: Varian };

/* Ukuran siluet di dalam kotak tanda. Angkanya dikumpulkan di sini supaya SVG
   dan kotaknya tidak pernah berselisih saat salah satu diubah. */
const UKURAN_IKON: Record<Varian, number> = {
  gerbang: 26,
  samping: 23,
};

/**
 * Kunci merek: tanda dan kata dirangkai jadi satu benda, bukan ikon yang
 * kebetulan bersebelahan dengan teks biasa. Siluet duduk di kotak beraksen
 * seperti ikon aplikasi, kata utama ditulis rapat dan tebal, lalu kata
 * terakhir jadi label kecil beraksen — tiga hal yang membuatnya terbaca
 * sebagai lambang, bukan kalimat.
 */
export default function Merek({ varian = "gerbang" }: Props) {
  const { t } = useBahasa();
  const merek = t("umum.merek").trim();

  /* Kata terakhir dipisah agar bisa diperlakukan sebagai label. Bila suatu
     saat ada bahasa yang mereknya satu kata, bagian ini tinggal kosong dan
     kunci merek tetap utuh. */
  const potong = merek.lastIndexOf(" ");
  const utama = potong === -1 ? merek : merek.slice(0, potong).trimEnd();
  const ekor = potong === -1 ? "" : merek.slice(potong + 1);

  return (
    <span className={`merek merek-${varian}`} role="img" aria-label={merek}>
      <span className="merek-tanda" aria-hidden="true">
        <Brand size={UKURAN_IKON[varian]} />
      </span>
      <span className="merek-teks" aria-hidden="true">
        <span className="merek-utama">{utama}</span>
        {ekor && <span className="merek-ekor">{ekor}</span>}
      </span>
    </span>
  );
}
