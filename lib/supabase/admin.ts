import { createClient } from "@supabase/supabase-js";
import { ALAMAT_SUPABASE } from "./env";
import type { Database } from "./database.types";

/**
 * Klien `service_role` — satu-satunya jalan memberi lencana.
 *
 * Peran ini melewati seluruh kebijakan RLS, jadi kuncinya tidak boleh pernah
 * sampai ke peramban: namanya sengaja tanpa awalan NEXT_PUBLIC_ supaya Next.js
 * menolak menyisipkannya ke berkas klien, dan berkas ini hanya diimpor Route
 * Handler. Penjaga di bawah menjadikan kelalaian itu galat yang berisik alih-alih
 * kebocoran yang diam.
 */

const KUNCI_LAYANAN = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const layananSiap = Boolean(ALAMAT_SUPABASE && KUNCI_LAYANAN);

export function klienLayanan() {
  if (typeof window !== "undefined") {
    throw new Error("klienLayanan() tidak boleh dipanggil dari peramban");
  }
  if (!layananSiap) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi");
  }

  /* Tanpa sesi dan tanpa penyegaran token: klien ini hidup satu permintaan saja
     dan tidak pernah mewakili seorang pengguna. */
  return createClient<Database>(ALAMAT_SUPABASE, KUNCI_LAYANAN, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
