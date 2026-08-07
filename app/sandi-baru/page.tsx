import SandiBaru from "@/components/SandiBaru";
import Setup from "@/components/Setup";
import { supabaseSiap } from "@/lib/supabase/env";

export const metadata = { title: "Kata sandi baru — Twitter Mini" };

/* Halaman ini hanya berguna dengan sesi pemulihan dari tautan email. */
export const dynamic = "force-dynamic";

export default function Halaman() {
  if (!supabaseSiap) return <Setup />;
  return <SandiBaru />;
}
