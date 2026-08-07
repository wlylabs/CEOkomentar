"use client";

import { useEffect, useState } from "react";
import { IkonPasang } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

/**
 * Peristiwa milik Chromium yang menawarkan pemasangan aplikasi. Belum ada di
 * pustaka tipe DOM, jadi bentuk yang dipakai di sini ditulis sendiri.
 */
type PeristiwaPasang = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Ajakan memasang aplikasi ke layar utama.
 *
 * Hanya muncul bila peramban benar-benar menawarkannya: Chromium menahan
 * peristiwa `beforeinstallprompt` sampai aplikasi lolos syarat PWA, sedangkan
 * Safari tidak pernah mengirimnya sama sekali (di sana pemasangan lewat menu
 * Bagikan). Karena itu tidak ada tombol mati yang menunggu di panel.
 */
export default function TombolPasang() {
  const { t } = useBahasa();
  const [tawaran, setTawaran] = useState<PeristiwaPasang | null>(null);

  useEffect(() => {
    function tangkap(peristiwa: Event) {
      // Menahan tawaran bawaan supaya munculnya di tempat yang kita pilih.
      peristiwa.preventDefault();
      setTawaran(peristiwa as PeristiwaPasang);
    }

    function terpasang() {
      setTawaran(null);
    }

    window.addEventListener("beforeinstallprompt", tangkap);
    window.addEventListener("appinstalled", terpasang);
    return () => {
      window.removeEventListener("beforeinstallprompt", tangkap);
      window.removeEventListener("appinstalled", terpasang);
    };
  }, []);

  if (!tawaran) return null;

  async function pasang() {
    if (!tawaran) return;
    await tawaran.prompt();
    await tawaran.userChoice;
    /* Satu peristiwa hanya sah sekali dipakai; peramban mengirim yang baru
       kalau tawarannya masih berlaku. */
    setTawaran(null);
  }

  return (
    <section className="kartu">
      <h2 className="kartu-judul">{t("pasang.judul")}</h2>
      <p className="kartu-teks">{t("pasang.teks")}</p>
      <button
        type="button"
        className="tombol tombol-utama tombol-lebar"
        onClick={pasang}
      >
        <IkonPasang size={18} />
        <span>{t("pasang.tombol")}</span>
      </button>
    </section>
  );
}
