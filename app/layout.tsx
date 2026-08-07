import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twitter Mini",
  description:
    "Antarmuka satu halaman bergaya Twitter dengan dua fitur: profil dan feed komentar.",
};

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-tema="gelap" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
