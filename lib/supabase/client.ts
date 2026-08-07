"use client";

import { createBrowserClient } from "@supabase/ssr";
import { ALAMAT_SUPABASE, KUNCI_SUPABASE } from "./env";
import type { Database } from "./database.types";

export type KlienSupabase = ReturnType<typeof createBrowserClient<Database>>;

let klien: KlienSupabase | null = null;

/**
 * Satu klien peramban dipakai bersama seluruh komponen: sesi, langganan
 * realtime, dan cache token cukup hidup sekali per tab.
 */
export function klienPeramban(): KlienSupabase {
  if (!klien) {
    klien = createBrowserClient<Database>(ALAMAT_SUPABASE, KUNCI_SUPABASE);
  }
  return klien;
}
