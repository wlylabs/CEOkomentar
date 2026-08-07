import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ALAMAT_SUPABASE, KUNCI_SUPABASE, supabaseSiap } from "@/lib/supabase/env";

/**
 * Menyegarkan token Supabase pada setiap permintaan halaman lalu meneruskan
 * kuki barunya ke peramban. Tanpa ini sesi akan kedaluwarsa diam-diam dan
 * Server Component melihat pengguna sebagai belum masuk.
 *
 * Next.js 16 mengganti nama berkas `middleware` menjadi `proxy`; isi dan
 * pemakaiannya sama.
 */
export async function proxy(permintaan: NextRequest) {
  if (!supabaseSiap) return NextResponse.next({ request: permintaan });

  let tanggapan = NextResponse.next({ request: permintaan });

  const supabase = createServerClient(ALAMAT_SUPABASE, KUNCI_SUPABASE, {
    cookies: {
      getAll() {
        return permintaan.cookies.getAll();
      },
      setAll(daftar) {
        for (const { name, value } of daftar) {
          permintaan.cookies.set(name, value);
        }
        tanggapan = NextResponse.next({ request: permintaan });
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
