/**
 * Kredensial Supabase dibaca sekali di sini agar Next.js dapat menyisipkan
 * nilainya saat build dan agar aplikasi bisa memberi pesan yang jelas ketika
 * berkas .env.local belum diisi.
 */
export const ALAMAT_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const KUNCI_SUPABASE =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

export const supabaseSiap = Boolean(ALAMAT_SUPABASE && KUNCI_SUPABASE);
