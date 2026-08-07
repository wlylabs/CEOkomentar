/**
 * Umur komentar sebelum terhapus otomatis.
 *
 * Angka ini harus sama dengan `public.masa_komentar()` di
 * `supabase/migrations/20260807120000_kedaluwarsa-dan-tamu.sql`. Basis data yang
 * memegang keputusan sebenarnya lewat kebijakan RLS; nilai di sini hanya dipakai
 * antarmuka untuk menyaring lebih awal dan menghitung sisa waktu.
 */
export const MASA_KOMENTAR_JAM = 24;

export const MASA_KOMENTAR_MS = MASA_KOMENTAR_JAM * 60 * 60 * 1000;

/** Ambang ISO untuk `created_at >`; komentar yang lebih tua sudah kedaluwarsa. */
export function ambangKedaluwarsa(sekarang: number = Date.now()) {
  return new Date(sekarang - MASA_KOMENTAR_MS).toISOString();
}
