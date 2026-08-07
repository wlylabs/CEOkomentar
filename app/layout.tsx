import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { KUNCI_BAHASA, bacaBahasa } from "@/lib/i18n/bahasa";
import { teks } from "@/lib/i18n/kamus";
import { PenyediaBahasa } from "@/lib/i18n/konteks";

export async function generateMetadata(): Promise<Metadata> {
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);
  return {
    title: teks(bahasa, "umum.merek"),
    description: teks(bahasa, "meta.deskripsi"),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/** Menetapkan tema sebelum lukisan pertama agar tidak ada kedipan warna. */
const SKRIP_TEMA = `(function(){try{var t=localStorage.getItem("tm-tema");if(t!=="terang"&&t!=="gelap"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"terang":"gelap";}document.documentElement.dataset.tema=t;}catch(e){document.documentElement.dataset.tema="gelap";}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* Bahasa dibaca dari kuki, bukan localStorage seperti tema, karena seluruh
     teks halaman ini dirender di server. */
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);

  return (
    <html lang={bahasa} data-tema="gelap" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body>
        <PenyediaBahasa awal={bahasa}>{children}</PenyediaBahasa>
      </body>
    </html>
  );
}
