"use client";

import { IkonBulan, IkonMatahari } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

type Props = {
  /** "bulat" untuk bilah atas ponsel, "menu" untuk kolom kiri layar lebar */
  varian: "bulat" | "menu";
  size?: number;
  onGanti: () => void;
};

/**
 * Tombol pengalih tema.
 *
 * Kedua wajahnya — matahari untuk tema gelap, bulan untuk tema terang — selalu
 * dirender, lalu CSS menyembunyikan yang tidak sesuai `data-tema` di `<html>`.
 *
 * Tema yang berlaku hanya diketahui di peramban, sedangkan halaman ini dirender
 * di server. Kalau tombolnya menunggu React mengetahuinya, ikon dan tulisannya
 * telanjur tampil salah sejak lukisan pertama sampai halaman selesai
 * terhidrasi — persis kedipan yang terlihat setiap kali halaman dimuat ulang
 * dengan tema terang.
 *
 * Karena itu pula namanya untuk pembaca layar ikut ditulis dua kali: `aria-label`
 * hanya bisa satu nilai, dan nilainya harus ditentukan saat merender.
 */
export default function TombolTema({ varian, size = 24, onGanti }: Props) {
  const { t } = useBahasa();
  const menu = varian === "menu";

  return (
    <button
      type="button"
      className={menu ? "menu-butir" : "bulat"}
      onClick={onGanti}
    >
      <span className="tema-jika-gelap">
        <IkonMatahari size={size} />
      </span>
      <span className="tema-jika-terang">
        <IkonBulan size={size} />
      </span>

      {menu && (
        /* Tulisan yang terbaca mata; namanya untuk pembaca layar diambil dari
           kalimat lengkap di bawah. */
        <span className="menu-label" aria-hidden="true">
          <span className="tema-jika-gelap">{t("nav.temaTerang")}</span>
          <span className="tema-jika-terang">{t("nav.temaGelap")}</span>
        </span>
      )}

      <span className="sr-only">
        <span className="tema-jika-gelap">{t("nav.keTemaTerang")}</span>
        <span className="tema-jika-terang">{t("nav.keTemaGelap")}</span>
      </span>
    </button>
  );
}
