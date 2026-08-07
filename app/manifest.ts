import type { MetadataRoute } from "next";
import { BAHASA_BAWAAN } from "@/lib/i18n/bahasa";
import { teks } from "@/lib/i18n/kamus";

/**
 * Keterangan aplikasi untuk peramban: dipakai saat dipasang ke layar utama.
 *
 * Berkas ini dibangun sekali saat build, sementara bahasa antarmuka dipilih
 * per pengunjung lewat kuki. Karena permintaan manifest tidak selalu membawa
 * kuki, isinya memakai bahasa bawaan aplikasi.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: teks(BAHASA_BAWAAN, "umum.merek"),
    short_name: teks(BAHASA_BAWAAN, "umum.merek"),
    description: teks(BAHASA_BAWAAN, "meta.deskripsi"),
    lang: BAHASA_BAWAAN,
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    /* Latar hitam menyamai tema gelap yang jadi bawaan, jadi layar pembuka
       tidak berkedip putih sebelum aplikasinya siap. */
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["social"],
    icons: [
      {
        src: "/ikon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      /* Versi maskable digambar penuh sampai tepi supaya Android boleh
         memotongnya jadi bentuk apa pun tanpa memakan gelembungnya. */
      {
        src: "/ikon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
