import type { SVGProps } from "react";

type IkonProps = SVGProps<SVGSVGElement> & { size?: number };

function Dasar({ size = 22, children, ...sisa }: IkonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...sisa}
    >
      {children}
    </svg>
  );
}

export function IkonBeranda({ aktif, ...p }: IkonProps & { aktif?: boolean }) {
  return (
    <Dasar {...p}>
      <path
        d="M3.4 10.2 12 3.6l8.6 6.6V20a.9.9 0 0 1-.9.9h-4.5v-6.2H8.8v6.2H4.3a.9.9 0 0 1-.9-.9z"
        fill={aktif ? "currentColor" : "none"}
      />
    </Dasar>
  );
}

export function IkonProfil({ aktif, ...p }: IkonProps & { aktif?: boolean }) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="8" r="3.9" fill={aktif ? "currentColor" : "none"} />
      <path
        d="M4.5 20.4a7.5 7.5 0 0 1 15 0"
        fill={aktif ? "currentColor" : "none"}
      />
    </Dasar>
  );
}

/**
 * Ikon posting ulang.
 *
 * Tiga bentuk untuk satu arti, tinggal ganti `varian` di satu tempat:
 *
 * - `kait` — dua panah berkait membentuk gelang persegi, panah kiri menunjuk ke
 *   atas dan panah kanan ke bawah. Bentuk yang dipakai X sendiri, jadi paling
 *   cepat dikenali sebagai posting ulang. Ini bawaannya.
 * - `gulung` — dua panah mendatar bertumpuk, seperti tanda ulang di pemutar
 *   musik. Lebih lebar dan lebih tenang, tetapi lebih dekat ke arti "ulangi"
 *   ketimbang "sebarkan lagi".
 * - `putar` — dua busur melingkar. Paling lembut, hanya saja gampang terbaca
 *   sebagai "muat ulang".
 */
export type VarianUlang = "kait" | "gulung" | "putar";

export function IkonUlang({
  varian = "kait",
  ...p
}: IkonProps & { varian?: VarianUlang }) {
  if (varian === "gulung") {
    return (
      <Dasar {...p}>
        <path d="M4.8 10.2V9a3 3 0 0 1 3-3h9.3" />
        <path d="m14.8 3.3 3.3 2.7-3.3 2.7" />
        <path d="M19.2 13.8V15a3 3 0 0 1-3 3H6.9" />
        <path d="m9.2 20.7-3.3-2.7 3.3-2.7" />
      </Dasar>
    );
  }

  if (varian === "putar") {
    return (
      <Dasar {...p}>
        <path d="M20.2 12.6a8.2 8.2 0 0 1-13.9 5.2" />
        <path d="M3.8 11.4a8.2 8.2 0 0 1 13.9-5.2" />
        <path d="M17.7 2.6v3.8h-3.8" />
        <path d="M6.3 21.4v-3.8h3.8" />
      </Dasar>
    );
  }

  return (
    <Dasar {...p}>
      <path d="M5.6 5.2v9.9a2.9 2.9 0 0 0 2.9 2.9h6.3" />
      <path d="m2.6 8.2 3-3 3 3" />
      <path d="M18.4 18.8V8.9A2.9 2.9 0 0 0 15.5 6H9.2" />
      <path d="m21.4 15.8-3 3-3-3" />
    </Dasar>
  );
}

/** Lambang X, digambar padat seperti aslinya, bukan garis. */
export function IkonX({ size = 22, ...sisa }: IkonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...sisa}
    >
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function IkonTautan(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M10.3 13.7a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 1 0-5.1-5.1L11.6 7.3" />
      <path d="M13.7 10.3a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 1 0 5.1 5.1l1.7-1.7" />
    </Dasar>
  );
}

export function IkonBuka(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M10.4 5.4H5.9a1.9 1.9 0 0 0-1.9 1.9v10.8a1.9 1.9 0 0 0 1.9 1.9h10.8a1.9 1.9 0 0 0 1.9-1.9v-4.5" />
      <path d="M14.2 4.2h5.6v5.6" />
      <path d="M19.8 4.2 11 13" />
    </Dasar>
  );
}

export function IkonSuka({ terisi, ...p }: IkonProps & { terisi?: boolean }) {
  return (
    <Dasar {...p}>
      <path
        d="M12 20.3s-7.6-4.5-7.6-9.6a4.3 4.3 0 0 1 7.6-2.75A4.3 4.3 0 0 1 19.6 10.7c0 5.1-7.6 9.6-7.6 9.6Z"
        fill={terisi ? "currentColor" : "none"}
      />
    </Dasar>
  );
}

export function IkonBagikan(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M12 15.4V3.8" />
      <path d="m7.9 7.6 4.1-3.8 4.1 3.8" />
      <path d="M5.2 13.2v5.8a1.9 1.9 0 0 0 1.9 1.9h9.8a1.9 1.9 0 0 0 1.9-1.9v-5.8" />
    </Dasar>
  );
}

export function IkonTulis(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M16.4 3.9a2.3 2.3 0 0 1 3.3 3.3L8.5 18.4l-4.3 1.2 1.2-4.3z" />
      <path d="m14.6 5.7 3.3 3.3" />
    </Dasar>
  );
}

export function IkonMatahari(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 2.6v2.1M12 19.3v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5" />
    </Dasar>
  );
}

export function IkonBulan(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z" />
    </Dasar>
  );
}

export function IkonLokasi(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M19 10.3c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10.1" r="2.5" />
    </Dasar>
  );
}

export function IkonKalender(p: IkonProps) {
  return (
    <Dasar {...p}>
      <rect x="3.6" y="5.2" width="16.8" height="15.2" rx="2.4" />
      <path d="M3.6 10h16.8M8.4 3.6v3.2M15.6 3.6v3.2" />
    </Dasar>
  );
}

export function IkonKembali(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M19.4 12H4.6" />
      <path d="m10.6 5.8-6.2 6.2 6.2 6.2" />
    </Dasar>
  );
}

export function IkonKamera(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M3.6 8.9a2 2 0 0 1 2-2h1.9l1.3-2.3h6.4l1.3 2.3h1.9a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13.1" r="3.7" />
    </Dasar>
  );
}

export function IkonTutup(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M18.2 5.8 5.8 18.2M5.8 5.8l12.4 12.4" />
    </Dasar>
  );
}

export function IkonKeluar(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M14.6 3.6H6.2a1.9 1.9 0 0 0-1.9 1.9v13a1.9 1.9 0 0 0 1.9 1.9h8.4" />
      <path d="M16.4 8.4 20 12l-3.6 3.6M20 12H9.2" />
    </Dasar>
  );
}

export function IkonSampah(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M4.6 6.6h14.8M9.4 6.6V4.8a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.8" />
      <path d="M6.6 6.6 7.5 19a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l.9-12.4" />
      <path d="M10.4 10.2v6.4M13.6 10.2v6.4" />
    </Dasar>
  );
}

export function IkonMata({ tertutup, ...p }: IkonProps & { tertutup?: boolean }) {
  return (
    <Dasar {...p}>
      <path d="M2.6 12s3.5-6.2 9.4-6.2S21.4 12 21.4 12s-3.5 6.2-9.4 6.2S2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.9" />
      {tertutup && <path d="M4 20 20 4" />}
    </Dasar>
  );
}

export function IkonGambar(p: IkonProps) {
  return (
    <Dasar {...p}>
      <rect x="3.4" y="5" width="17.2" height="14" rx="2.3" />
      <circle cx="8.6" cy="10" r="1.7" />
      <path d="m4.2 17.4 4.6-4.3 3.5 3.2 3-2.7 4.5 4" />
    </Dasar>
  );
}

export function IkonJam(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.2 1.9" />
    </Dasar>
  );
}

export function IkonTamu(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="8" r="3.9" strokeDasharray="3 2.4" />
      <path d="M4.5 20.4a7.5 7.5 0 0 1 15 0" strokeDasharray="3 2.4" />
    </Dasar>
  );
}

export function IkonPeringatan(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M12 4.2 21 19.4H3z" />
      <path d="M12 9.6v4.2M12 16.6h.01" />
    </Dasar>
  );
}

export function IkonCentang(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="m4.8 12.4 4.6 4.6 9.8-10" />
    </Dasar>
  );
}

export function IkonInfo(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 11.2v5.2M12 7.9h.01" />
    </Dasar>
  );
}

export function IkonBahasa(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.4c2.2 2.4 3.4 5.4 3.4 8.6S14.2 18.2 12 20.6C9.8 18.2 8.6 15.2 8.6 12S9.8 5.8 12 3.4Z" />
    </Dasar>
  );
}

export function IkonLonceng({ aktif, ...p }: IkonProps & { aktif?: boolean }) {
  return (
    <Dasar {...p}>
      <path
        d="M18.3 16.2V11a6.3 6.3 0 1 0-12.6 0v5.2L4.2 18.4h15.6z"
        fill={aktif ? "currentColor" : "none"}
      />
      <path d="M10 21.2a2.3 2.3 0 0 0 4 0" />
    </Dasar>
  );
}

/* Pita penghargaan: medali bundar dengan dua ujung pita di bawahnya. Dipakai
   navigasi misi — bentuknya berbeda dari centang lencana supaya tujuan ("ke
   daftar misi") tidak tertukar dengan hasilnya ("akun ini terverifikasi"). */
export function IkonMisi({ aktif, ...p }: IkonProps & { aktif?: boolean }) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="9" r="5.6" fill={aktif ? "currentColor" : "none"} />
      <path d="m8.6 13.7-1.4 6.6 4.8-2.6 4.8 2.6-1.4-6.6" />
    </Dasar>
  );
}

/* Kompas: lingkaran dengan jarum condong di tengahnya. Dipakai navigasi
   panduan — arah, bukan bacaan, karena isinya memang daftar kerja dan bukan
   artikel. Bentuknya juga tidak bertabrakan dengan medali misi di sebelahnya. */
export function IkonPanduan({ aktif, ...p }: IkonProps & { aktif?: boolean }) {
  return (
    <Dasar {...p}>
      <circle cx="12" cy="12" r="8.8" fill={aktif ? "currentColor" : "none"} />
      <path
        d="m15.4 8.6-2 4.8-4.8 2 2-4.8z"
        fill="none"
        stroke={aktif ? "var(--latar)" : "currentColor"}
      />
    </Dasar>
  );
}

export function IkonLainnya(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="5.2" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18.8" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Dasar>
  );
}

export function IkonTayang(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M4.6 20.1V13M9.5 20.1V8.4M14.5 20.1v-8.3M19.4 20.1V4.4" />
    </Dasar>
  );
}

export function IkonTren(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M3.6 16.4 9 10.9l3.4 3.4 7-7.2" />
      <path d="M15.2 7.1h4.2v4.3" />
    </Dasar>
  );
}

export function IkonPasang(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M12 3.6v11.2" />
      <path d="m7.8 10.7 4.2 4.1 4.2-4.1" />
      <path d="M4.4 17.1v2.2c0 .6.5 1.1 1.1 1.1h13c.6 0 1.1-.5 1.1-1.1v-2.2" />
    </Dasar>
  );
}

export function IkonTerverifikasi({ size = 18, ...sisa }: IkonProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...sisa}
    >
      <path
        fill="currentColor"
        d="M12 1.8l2.6 2.05 3.3-.2.9 3.18 2.75 1.84-1.2 3.08 1.2 3.08-2.75 1.84-.9 3.18-3.3-.2L12 22.2l-2.6-2.05-3.3.2-.9-3.18-2.75-1.84 1.2-3.08-1.2-3.08 2.75-1.84.9-3.18 3.3.2z"
      />
      <path
        fill="none"
        stroke="var(--lencana-tanda)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.2 12.1 2.6 2.6 5-5.4"
      />
    </svg>
  );
}
