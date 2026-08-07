import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ALAMAT_SUPABASE, KUNCI_SUPABASE } from "./env";
import type { Database } from "./database.types";

/**
 * Klien untuk Server Component dan Route Handler. Penulisan kuki dibungkus
 * try/catch karena Server Component tidak boleh menulis kuki; penyegaran token
 * di sana sudah ditangani middleware.
 */
export async function klienServer() {
  const toples = await cookies();

  return createServerClient<Database>(ALAMAT_SUPABASE, KUNCI_SUPABASE, {
    cookies: {
      getAll() {
        return toples.getAll();
      },
      setAll(daftar) {
        try {
          for (const { name, value, options } of daftar) {
            toples.set(name, value, options);
          }
        } catch {
          /* dipanggil dari Server Component — middleware yang menyegarkan sesi */
        }
      },
    },
  });
}
