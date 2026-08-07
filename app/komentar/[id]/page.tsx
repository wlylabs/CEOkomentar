import type { Metadata } from "next";
import { cookies } from "next/headers";
import AuthScreen from "@/components/AuthScreen";
import Setup from "@/components/Setup";
import Utas from "@/components/Utas";
import { akunSekarang } from "@/lib/akun";
import { KUNCI_BAHASA, bacaBahasa } from "@/lib/i18n/bahasa";
import { teks } from "@/lib/i18n/kamus";
import { supabaseSiap } from "@/lib/supabase/env";
import { klienServer } from "@/lib/supabase/server";

/* Sesi ada di kuki, dan komentarnya bisa hilang kapan saja. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

type Pratinjau = {
  body: string;
  author: { handle: string } | null;
};

/**
 * Judul dan deskripsi halaman mengikuti isi komentarnya, jadi tautan yang
 * dibagikan sudah bercerita sebelum dibuka. Kueri di bawah tunduk pada
 * kebijakan RLS yang sama dengan aplikasinya: tanpa sesi, atau ketika umur
 * komentarnya sudah lewat, yang tersisa hanya judul umum.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bahasa = bacaBahasa((await cookies()).get(KUNCI_BAHASA)?.value);
  if (!supabaseSiap) return { title: teks(bahasa, "umum.merek") };

  const { id } = await params;
  const supabase = await klienServer();
  const { data } = await supabase
    .from("comments")
    .select("body, author:profiles!comments_author_id_fkey ( handle )")
    .eq("id", id)
    .maybeSingle<Pratinjau>();

  const handle = data?.author?.handle;
  if (!data || !handle) {
    return { title: teks(bahasa, "utas.takAdaJudul") };
  }

  const kutipan = data.body.replace(/\s+/g, " ").trim().slice(0, 140);

  return {
    title: teks(bahasa, "meta.judulUtas", { handle }),
    description: teks(bahasa, "meta.deskripsiUtas", { kutipan, handle }),
  };
}

export default async function HalamanKomentar({ params }: Props) {
  if (!supabaseSiap) return <Setup />;

  const sesi = await akunSekarang();
  if (!sesi) return <AuthScreen />;

  const { id } = await params;
  return <Utas id={id} akun={sesi.akun} />;
}
