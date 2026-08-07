import { KOLOM_PROFIL, keUser } from "./api";
import type { BarisProfil } from "./supabase/database.types";
import { klienServer } from "./supabase/server";
import type { User } from "./types";

/**
 * Akun yang sedang masuk, dilihat dari kuki sesi. Dipakai setiap halaman yang
 * dirender di server sebelum memutuskan menampilkan aplikasi atau layar masuk.
 *
 * Mengembalikan null bila tidak ada sesi — atau bila profilnya benar-benar
 * tidak bisa dibuat, yang praktis berarti sesinya tidak sah lagi.
 */
export async function akunSekarang(): Promise<{
  akun: User;
  tamu: boolean;
} | null> {
  const supabase = await klienServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: profil } = await supabase
    .from("profiles")
    .select(KOLOM_PROFIL)
    .eq("id", user.id)
    .maybeSingle<BarisProfil>();

  /* Akun yang dibuat sebelum pemicu terpasang belum punya profil. */
  if (!profil) {
    await supabase.rpc("pastikan_profil");
    ({ data: profil } = await supabase
      .from("profiles")
      .select(KOLOM_PROFIL)
      .eq("id", user.id)
      .maybeSingle<BarisProfil>());
  }

  if (!profil) return null;

  return { akun: keUser(profil), tamu: user.is_anonymous ?? false };
}
