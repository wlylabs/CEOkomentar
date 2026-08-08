import { ALAMAT_SUPABASE } from "@/lib/supabase/env";

/**
 * Header keamanan dan Content Security Policy.
 *
 * Semuanya dipasang di satu tempat — `proxy.ts` — supaya tidak ada halaman,
 * rute API, atau berkas statis yang tanpa sengaja terlewat. CSP-nya memakai
 * nonce: skrip yang bukan bikinan aplikasi ini tidak akan pernah berjalan,
 * termasuk skrip yang berhasil disisipkan lewat celah XSS yang belum kita
 * ketahui. Next.js ikut menempelkan nonce yang sama ke skrip-skripnya sendiri
 * begitu ia menemukan header ini di permintaan yang masuk.
 */

const PENGEMBANGAN = process.env.NODE_ENV !== "production";

/** Asal Supabase untuk connect-src, img-src, dan saluran realtime-nya. */
function asalSupabase(): { https: string; wss: string } | null {
  if (!ALAMAT_SUPABASE) return null;
  try {
    const alamat = new URL(ALAMAT_SUPABASE);
    return { https: alamat.origin, wss: `wss://${alamat.host}` };
  } catch {
    return null;
  }
}

function susun(aturan: Record<string, string[]>): string {
  return Object.entries(aturan)
    .map(([nama, nilai]) => (nilai.length > 0 ? `${nama} ${nilai.join(" ")}` : nama))
    .join("; ");
}

function dasar() {
  const supabase = asalSupabase();

  return {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    /* Gaya sebaris dipakai untuk ukuran dan gradien avatar, dan Next.js
       menyisipkan CSS kritis halaman dengan cara yang sama. */
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...(supabase ? [supabase.https] : []),
    ],
    "font-src": ["'self'"],
    "connect-src": [
      "'self'",
      ...(supabase ? [supabase.https, supabase.wss] : []),
      /* Hot reload pengembangan berbicara lewat websocket ke server sendiri. */
      ...(PENGEMBANGAN ? ["ws:"] : []),
    ],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'"],
    "media-src": ["'none'"],
  } satisfies Record<string, string[]>;
}

/**
 * CSP untuk halaman yang dirender Next.js.
 *
 * `strict-dynamic` membuat skrip bernonce boleh memuat potongan JavaScript-nya
 * sendiri — itulah cara Next memuat bundel per halaman — tanpa perlu membuka
 * pintu untuk asal mana pun.
 */
export function csp(nonce: string): string {
  return susun({
    ...dasar(),
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      /* Server pengembangan Next menyusun modulnya dengan eval. */
      ...(PENGEMBANGAN ? ["'unsafe-eval'"] : []),
    ],
    ...(PENGEMBANGAN ? {} : { "upgrade-insecure-requests": [] }),
  });
}

/**
 * CSP untuk berkas HTML statis di `public/`, yang tidak bisa disisipi nonce
 * karena tidak melewati perenderan. Satu-satunya berkas seperti itu adalah
 * halaman luring, dan skripnya berkas terpisah dari asal yang sama.
 */
export function cspStatis(): string {
  return susun({
    ...dasar(),
    "script-src": ["'self'"],
    ...(PENGEMBANGAN ? {} : { "upgrade-insecure-requests": [] }),
  });
}

/**
 * Header yang berlaku untuk seluruh jawaban.
 *
 * HSTS hanya dipasang pada permintaan https: memasangnya di http tidak ada
 * gunanya, dan pada pengembangan lokal justru mengunci localhost ke https
 * selama dua tahun di peramban yang sudah melihatnya sekali.
 */
export function kepalaKeamanan(https: boolean): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "X-DNS-Prefetch-Control": "off",
    ...(https
      ? {
          "Strict-Transport-Security":
            "max-age=63072000; includeSubDomains; preload",
        }
      : {}),
  };
}
