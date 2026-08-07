"use client";

import { IkonBahasa } from "./Icons";
import {
  DAFTAR_BAHASA,
  KODE_BAHASA,
  NAMA_BAHASA,
  bahasaLain,
} from "@/lib/i18n/bahasa";
import { useBahasa } from "@/lib/i18n/konteks";

type Varian = "menu" | "bulat" | "gerbang";

/**
 * Pengalih bahasa dalam tiga bentuk yang mengikuti tempatnya:
 *
 * - `menu`   satu baris di navigasi kiri, sebentuk dengan pengalih tema
 * - `bulat`  tombol ikon di bilah atas ponsel
 * - `gerbang` dua pilihan berdampingan di halaman masuk, penyiapan, dan kata
 *   sandi baru — di sana belum ada navigasi, jadi pilihannya ditampilkan penuh
 */
export default function PemilihBahasa({
  varian = "menu",
  size = 24,
}: {
  varian?: Varian;
  size?: number;
}) {
  const { bahasa, gantiBahasa, t } = useBahasa();

  if (varian === "gerbang") {
    return (
      <div className="pilih-bahasa" role="group" aria-label={t("bahasa.ganti")}>
        <IkonBahasa size={17} className="pilih-bahasa-ikon" />
        {DAFTAR_BAHASA.map((pilihan) => (
          <button
            key={pilihan}
            type="button"
            className={`pilih-bahasa-butir${
              pilihan === bahasa ? " pilih-bahasa-butir-aktif" : ""
            }`}
            onClick={() => gantiBahasa(pilihan)}
            aria-pressed={pilihan === bahasa}
            title={NAMA_BAHASA[pilihan]}
          >
            {KODE_BAHASA[pilihan]}
          </button>
        ))}
      </div>
    );
  }

  /* Dua bahasa, jadi satu tombol sudah cukup: menekannya berpindah ke bahasa
     satunya, dan labelnya menyebut tujuan itu — sama seperti tombol tema. */
  const tujuan = bahasaLain(bahasa);
  const label = t("bahasa.pilih", { bahasa: NAMA_BAHASA[tujuan] });

  if (varian === "bulat") {
    return (
      <button
        type="button"
        className="bulat bulat-bahasa"
        onClick={() => gantiBahasa(tujuan)}
        aria-label={label}
        title={label}
      >
        <IkonBahasa size={size} />
        <span className="bulat-kode" aria-hidden="true">
          {KODE_BAHASA[tujuan]}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="menu-butir"
      onClick={() => gantiBahasa(tujuan)}
      aria-label={label}
    >
      <IkonBahasa size={size} />
      <span className="menu-label">{NAMA_BAHASA[tujuan]}</span>
    </button>
  );
}
