import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { csp, cspStatis, kepalaKeamanan } from "@/lib/keamanan/kepala";
import { ALAMAT_SUPABASE, KUNCI_SUPABASE, supabaseSiap } from "@/lib/supabase/env";

/**
 * Menyegarkan token Supabase pada setiap permintaan halaman lalu meneruskan
 * kuki barunya ke peramban. Tanpa ini sesi akan kedaluwarsa diam-diam dan
 * Server Component melihat pengguna sebagai belum masuk.
 *
 * Di sini pula seluruh header keamanan dipasang — satu tempat untuk semua
 * jawaban, termasuk rute API dan berkas statis, supaya tidak ada yang lolos
 * karena lupa ditulis di tempatnya masing-masing.
 *
 * Next.js 16 mengganti nama berkas `middleware` menjadi `proxy`; isi dan
 * pemakaiannya sama.
 */
export async function proxy(permintaan: NextRequest) {
  const https = permintaan.nextUrl.protocol === "https:";
  const keamanan = kepalaKeamanan(https);

  /* Halaman luring disajikan apa adanya dari public/, jadi nonce tidak pernah
     sampai ke dalamnya; aturannya dibuat tanpa nonce dan tanpa strict-dynamic. */
  const statis = permintaan.nextUrl.pathname.endsWith(".html");

  /* Nonce baru untuk setiap permintaan. Diteruskan ke Next lewat header
     permintaan supaya skrip bikinannya ikut bernonce, dan ke layout lewat
     `x-nonce` supaya skrip tema bisa memakainya juga. */
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const aturan = statis ? cspStatis() : csp(nonce);

  const kepalaPermintaan = new Headers(permintaan.headers);
  kepalaPermintaan.set("x-nonce", nonce);
  kepalaPermintaan.set("Content-Security-Policy", aturan);

  function jawab() {
    const tanggapan = NextResponse.next({
      request: { headers: kepalaPermintaan },
    });
    tanggapan.headers.set("Content-Security-Policy", aturan);
    for (const [nama, nilai] of Object.entries(keamanan)) {
      tanggapan.headers.set(nama, nilai);
    }
    return tanggapan;
  }

  if (!supabaseSiap) return jawab();

  let tanggapan = jawab();

  const supabase = createServerClient(ALAMAT_SUPABASE, KUNCI_SUPABASE, {
    cookies: {
      getAll() {
        return permintaan.cookies.getAll();
      },
      setAll(daftar) {
        for (const { name, value } of daftar) {
          permintaan.cookies.set(name, value);
        }
        tanggapan = jawab();
        for (const { name, value, options } of daftar) {
          tanggapan.cookies.set(name, value, options);
        }
      },
    },
  });

  // Panggilan ini yang memicu penyegaran token; hasilnya sengaja tidak dipakai.
  await supabase.auth.getUser();

  return tanggapan;
}

export const config = {
  matcher: [
    /* Lewati aset statis dan berkas gambar; sisanya butuh sesi yang segar. */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
