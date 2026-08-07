import App from "@/components/App";
import AuthScreen from "@/components/AuthScreen";
import Setup from "@/components/Setup";
import { akunSekarang } from "@/lib/akun";
import { supabaseSiap } from "@/lib/supabase/env";

/* Sesi ada di kuki, jadi halaman ini tidak boleh di-cache. */
export const dynamic = "force-dynamic";

export default async function Halaman() {
  if (!supabaseSiap) return <Setup />;

  const sesi = await akunSekarang();
  if (!sesi) return <AuthScreen />;

  return <App akunAwal={sesi.akun} tamu={sesi.tamu} />;
}
