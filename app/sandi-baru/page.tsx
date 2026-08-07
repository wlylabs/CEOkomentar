import type { Metadata } from "next";
import { cookies } from "next/headers";
import SandiBaru from "@/components/SandiBaru";
import Setup from "@/components/Setup";
import { KUNCI_BAHASA, bacaBahasa } from "@/lib/i18n/bahasa";
import { teks } from "@/lib/i18n/kamus";
import { supabaseSiap } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);
  return { title: teks(bahasa, "meta.judulSandi") };
}

/* Halaman ini hanya berguna dengan sesi pemulihan dari tautan email. */
export const dynamic = "force-dynamic";

export default function Halaman() {
  if (!supabaseSiap) return <Setup />;
  return <SandiBaru />;
}
