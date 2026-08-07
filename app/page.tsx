import App from "@/components/App";
import AuthScreen from "@/components/AuthScreen";
import Setup from "@/components/Setup";
import { keUser } from "@/lib/api";
import type { BarisProfil } from "@/lib/supabase/database.types";
import { supabaseSiap } from "@/lib/supabase/env";
import { klienServer } from "@/lib/supabase/server";

const KOLOM_PROFIL =
  "id, handle, name, bio, location, avatar_url, banner_url, verified, following_count, followers_count, created_at, updated_at";

/* Sesi ada di kuki, jadi halaman ini tidak boleh di-cache. */
export const dynamic = "force-dynamic";

export default async function Halaman() {
  if (!supabaseSiap) return <Setup />;

  const supabase = await klienServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <AuthScreen />;

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

  if (!profil) return <AuthScreen />;

  return <App akunAwal={keUser(profil)} />;
}
