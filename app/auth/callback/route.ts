import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";

/** Hanya jalur relatif yang boleh dituju, supaya tautan email tidak bisa dibelokkan. */
function tujuanAman(nilai: string | null) {
  if (!nilai || !nilai.startsWith("/") || nilai.startsWith("//")) return "/";
  return nilai;
}

/**
 * Titik pendaratan tautan dari email: konfirmasi pendaftaran, undangan, dan
 * penggantian kata sandi. Supabase bisa mengirim `code` (alur PKCE) atau
 * `token_hash` + `type`, jadi keduanya ditangani.
 */
export async function GET(permintaan: NextRequest) {
  const alamat = new URL(permintaan.url);
  const kode = alamat.searchParams.get("code");
  const tokenHash = alamat.searchParams.get("token_hash");
  const jenis = alamat.searchParams.get("type") as EmailOtpType | null;
  const tujuan = tujuanAman(alamat.searchParams.get("berikutnya"));

  const gagal = (sebab: string) =>
    NextResponse.redirect(new URL(`/?galat=${encodeURIComponent(sebab)}`, alamat.origin));

  if (!supabaseSiap) return gagal("Supabase belum dikonfigurasi.");

  const supabase = await klienServer();

  if (kode) {
    const { error } = await supabase.auth.exchangeCodeForSession(kode);
    if (error) return gagal(error.message);
    return NextResponse.redirect(new URL(tujuan, alamat.origin));
  }

  if (tokenHash && jenis) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: jenis });
    if (error) return gagal(error.message);
    return NextResponse.redirect(
      new URL(jenis === "recovery" ? "/sandi-baru" : tujuan, alamat.origin),
    );
  }

  return gagal("Tautan tidak lengkap atau sudah kedaluwarsa.");
}
