import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { KUNCI_BAHASA, bacaBahasa } from "@/lib/i18n/bahasa";
import { teks } from "@/lib/i18n/kamus";
import { PenyediaBahasa } from "@/lib/i18n/konteks";
import { SKRIP_TEMA, TEMA_BAWAAN } from "@/lib/tema";
import DaftarSW from "@/components/DaftarSW";

export async function generateMetadata(): Promise<Metadata> {
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);
  const merek = teks(bahasa, "umum.merek");

  return {
    /* Halaman anak menulis judulnya sendiri lengkap dengan merek. */
    title: merek,
    description: teks(bahasa, "meta.deskripsi"),
    applicationName: merek,
    appleWebApp: {
      capable: true,
      title: merek,
      /* Bilah status ikut warna halaman, jadi tidak ada garis putih di atas
         layar saat aplikasi dibuka dari layar utama iOS. */
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: "/icon.svg",
      apple: "/apple-touch-icon.png",
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* themeColor sengaja tidak diisi di sini: meta itu dipasang SKRIP_TEMA agar
     mengikuti tema pilihan pemakai, bukan setelan sistemnya. Lihat lib/tema.ts. */
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* Bahasa dibaca dari kuki, bukan localStorage seperti tema, karena seluruh
     teks halaman ini dirender di server. */
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);

  /* Nonce dari proxy.ts. Content Security Policy melarang skrip sebaris yang
     tidak membawanya, termasuk skrip tema di bawah — dan itulah gunanya:
     skrip yang tidak berasal dari berkas ini tidak akan pernah berjalan. */
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={bahasa} data-tema={TEMA_BAWAAN} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body>
        <PenyediaBahasa awal={bahasa}>{children}</PenyediaBahasa>
        <DaftarSW />
      </body>
    </html>
  );
}
