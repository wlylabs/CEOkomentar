import { NextResponse, type NextRequest } from "next/server";
import { alamatPemanggil, ambilJatah } from "@/lib/keamanan/batas";
import { layananSiap } from "@/lib/supabase/admin";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";
import {
  acak,
  alamatIzin,
  tantangan,
  xSiap,
} from "@/lib/x/oauth";
import {
  alamatKembali,
  bersihkanKuki,
  https,
  laporBelumSiap,
  namaState,
  namaVerifier,
  opsiKuki,
  pulang,
} from "@/lib/x/alur";

/* Kuki sesi menentukan siapa yang memulai; tidak ada yang boleh di-cache. */
export const dynamic = "force-dynamic";

/**
 * Langkah pertama misi "ikuti @CEOkomentar di X".
 *
 * Menyusun state dan code verifier, menitipkan keduanya di kuki HttpOnly, lalu
 * mengantar pemakai ke halaman izin X. Tidak ada yang dicatat di basis data di
 * sini: sampai X menjawab, belum ada apa pun yang layak dipercaya.
 */
export async function GET(permintaan: NextRequest) {
  if (!supabaseSiap) return pulang(permintaan, laporBelumSiap());

  const supabase = await klienServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* Tanpa sesi tidak ada akun yang bisa diberi lencana; layar masuk yang
     menjawabnya, bukan kabar galat. */
  if (!user) {
    return NextResponse.redirect(new URL("/", permintaan.nextUrl.origin));
  }

  /* Tanpa kredensial X atau tanpa kunci layanan, misinya memang belum bisa
     diperiksa siapa pun — dan tidak ada jalan lain untuk mendapat lencananya. */
  if (!xSiap || !layananSiap) return pulang(permintaan, laporBelumSiap());

  if (
    !ambilJatah(`x-mulai:${user.id}`, 8, 10 * 60_000) ||
    !ambilJatah(`x-mulai-ip:${alamatPemanggil(permintaan)}`, 30, 10 * 60_000)
  ) {
    return pulang(permintaan, "terlaluSering");
  }

  /* Misi yang sudah selesai tetap diantar ke X: tombolnya berubah menjadi
     "Periksa ulang", dan pemeriksaan itulah yang melepas lencana bila akun
     resminya sudah tidak diikuti lagi. */
  const aman = https(permintaan);
  const state = acak();
  const verifier = acak(48);

  const tanggapan = NextResponse.redirect(
    alamatIzin({
      kembali: alamatKembali(permintaan),
      state,
      tantangan: await tantangan(verifier),
    }),
  );

  /* Kuki lama dari percobaan yang tidak selesai dibuang lebih dulu supaya tidak
     ada dua state yang hidup bersamaan. */
  bersihkanKuki(tanggapan, aman);
  tanggapan.cookies.set(namaState(aman), state, opsiKuki(aman));
  tanggapan.cookies.set(namaVerifier(aman), verifier, opsiKuki(aman));

  return tanggapan;
}
