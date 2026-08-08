import type { NextConfig } from "next";

/**
 * Header keamanan yang sesungguhnya dipasang `proxy.ts` untuk setiap
 * permintaan yang melewatinya. Yang tersisa di sini hanyalah jalur yang
 * sengaja dilewati proksi karena tidak butuh sesi — berkas hasil build dan
 * gambar. Keduanya tetap tidak boleh ditebak jenisnya oleh peramban.
 */
const KEPALA_ASET = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* Versi Next.js bukan keterangan yang perlu diketahui siapa pun dari luar. */
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/_next/static/:jalur*", headers: KEPALA_ASET },
      {
        source: "/:berkas*.(svg|png|jpg|jpeg|gif|webp|ico)",
        headers: KEPALA_ASET,
      },
    ];
  },
};

export default nextConfig;
