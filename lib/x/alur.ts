import { NextResponse, type NextRequest } from "next/server";
import type { HasilMisi } from "@/lib/misi";
import { layananSiap } from "@/lib/supabase/admin";
import { supabaseSiap } from "@/lib/supabase/env";
import { xSiap } from "@/lib/x/oauth";

/**
 * Bagian bersama dari dua sisi alur verifikasi X: nama kuki, alamat pulang, dan
 * bentuk jawaban. Ditulis sekali supaya `mulai` dan `kembali` tidak pernah
 * berbeda pendapat tentang kuki mana yang mereka bicarakan.
 */

const DASAR_STATE = "misi-x-state";
const DASAR_VERIFIER = "misi-x-verifier";

/** Sepuluh menit: cukup untuk masuk ke X dan menekan "Authorize app". */
export const UMUR_KUKI = 600;

/**
 * Kuki alur ini hanya dibaca oleh dua rute di bawah /api/misi/x, jadi jalurnya
 * dipersempit ke sana: halaman lain tidak pernah ikut membawanya.
 */
const JALUR_KUKI = "/api/misi/x";

export function https(permintaan: NextRequest): boolean {
  return (
    permintaan.nextUrl.protocol === "https:" ||
    permintaan.headers.get("x-forwarded-proto") === "https"
  );
}

/**
 * Awalan `__Secure-` membuat peramban menolak kuki yang datang tanpa atribut
 * Secure — termasuk kuki palsu yang disuntikkan lewat http. Di pengembangan
 * lokal yang berjalan di http, awalannya dilepas supaya kukinya tetap terpasang.
 */
function nama(dasar: string, aman: boolean): string {
  return aman ? `__Secure-${dasar}` : dasar;
}

export function namaState(aman: boolean) {
  return nama(DASAR_STATE, aman);
}

export function namaVerifier(aman: boolean) {
  return nama(DASAR_VERIFIER, aman);
}

export function opsiKuki(aman: boolean) {
  return {
    httpOnly: true,
    secure: aman,
    /* Lax, bukan Strict: kuki ini harus ikut terbawa ketika X memulangkan
       pemakai ke sini lewat pengalihan dari situsnya. */
    sameSite: "lax" as const,
    path: JALUR_KUKI,
    maxAge: UMUR_KUKI,
  };
}

/**
 * Alamat pendaratan yang didaftarkan di aplikasi X.
 *
 * `APP_URL` yang menentukan bila diisi, karena nilainya harus sama persis
 * dengan yang terdaftar di X. Tanpa itu alamatnya disusun dari permintaan yang
 * masuk — cukup untuk pengembangan lokal.
 */
export function alamatKembali(permintaan: NextRequest): string {
  const dari = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (dari) return `${dari}/api/misi/x/kembali`;
  return new URL("/api/misi/x/kembali", permintaan.nextUrl.origin).toString();
}

/**
 * Pulang ke aplikasi sambil membawa satu kata hasil. Kalimatnya dipilih di sisi
 * peramban dari kamus, jadi kabarnya mengikuti bahasa yang sedang dipakai.
 */
export function pulang(
  permintaan: NextRequest,
  hasil: HasilMisi,
): NextResponse {
  const alamat = new URL("/", permintaan.nextUrl.origin);
  alamat.searchParams.set("misi", "ikuti-x");
  alamat.searchParams.set("hasil", hasil);
  return NextResponse.redirect(alamat);
}

/**
 * Nama variabel lingkungan yang masih kosong, dalam urutan pengisiannya.
 *
 * Misi ini berdiri di atas tiga kredensial yang berbeda asalnya, dan bila salah
 * satunya belum diisi hasilnya sama saja: `belumSiap`. Yang tidak sama adalah
 * cara memperbaikinya.
 */
function yangBelumDiisi(): string[] {
  const kurang: string[] = [];
  if (!supabaseSiap) kurang.push("NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY");
  if (!xSiap) kurang.push("X_CLIENT_ID");
  if (!layananSiap) kurang.push("SUPABASE_SERVICE_ROLE_KEY");
  return kurang;
}

/**
 * Menolak alurnya karena servernya belum dikonfigurasi, sambil menyebut apa
 * yang kurang — ke log server, bukan ke peramban.
 *
 * Kalimat yang dilihat pemakai sengaja tetap satu dan tanpa nama variabel:
 * bagian mana dari konfigurasi yang bolong bukan kabar yang pantas diumumkan
 * kepada siapa pun yang kebetulan menekan tombolnya. Log server tempatnya —
 * yang membaca di sana adalah orang yang memang bisa mengisinya, dan tanpa
 * baris ini ia hanya punya "belum diaktifkan" untuk ditebak satu per satu.
 */
export function laporBelumSiap(): HasilMisi {
  console.warn(
    `[misi/x] verifikasi ditolak: belum diisi — ${yangBelumDiisi().join(", ")}`,
  );
  return "belumSiap";
}

/** Membuang kuki alur begitu ia tidak diperlukan lagi. */
export function bersihkanKuki(tanggapan: NextResponse, aman: boolean) {
  for (const kunci of [namaState(aman), namaVerifier(aman)]) {
    tanggapan.cookies.set(kunci, "", {
      ...opsiKuki(aman),
      maxAge: 0,
    });
  }
}
