"use client";

import { useEffect } from "react";

/**
 * Mendaftarkan service worker setelah halaman selesai dimuat.
 *
 * Pendaftaran sengaja menunggu `load` supaya unduhan skripnya tidak berebut
 * jalur dengan isi halaman pertama. Ketika versi baru mengambil alih kendali,
 * halaman dimuat ulang sekali — tanpa itu, kerangka lama bisa terus hidup
 * berdampingan dengan berkas build yang sudah berganti.
 */
export default function DaftarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    /* Di server pengembangan berkas build berganti isi tanpa berganti nama,
       jadi menyimpannya justru menyajikan potongan lama. Service worker hanya
       dipasang pada hasil build sungguhan. */
    if (process.env.NODE_ENV !== "production") return;

    /* Pemasangan pertama juga memicu 'controllerchange'. Yang perlu dimuat
       ulang hanya halaman yang tadinya sudah dikendalikan versi lama. */
    const adaPendahulu = Boolean(navigator.serviceWorker.controller);
    let sudahMuatUlang = false;

    function gantiVersi() {
      if (!adaPendahulu || sudahMuatUlang) return;
      sudahMuatUlang = true;
      window.location.reload();
    }

    function daftarkan() {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* Peramban yang menolak service worker tetap menjalankan aplikasi
           seperti biasa; yang hilang hanya halaman luring. */
      });
    }

    navigator.serviceWorker.addEventListener("controllerchange", gantiVersi);

    if (document.readyState === "complete") daftarkan();
    else window.addEventListener("load", daftarkan);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", gantiVersi);
      window.removeEventListener("load", daftarkan);
    };
  }, []);

  return null;
}
