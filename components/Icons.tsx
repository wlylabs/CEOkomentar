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

export function IkonBalas(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M20.5 12.4c0 4-3.8 7.2-8.5 7.2a9.8 9.8 0 0 1-2.6-.35L4.2 21l1.3-3.6A6.8 6.8 0 0 1 3.5 12.4c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2Z" />
    </Dasar>
  );
}

export function IkonUlang(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M4.6 9.3V8a2.6 2.6 0 0 1 2.6-2.6h9.1" />
      <path d="m14.1 2.9 2.6 2.5-2.6 2.6" />
      <path d="M19.4 14.7V16a2.6 2.6 0 0 1-2.6 2.6H7.7" />
      <path d="m9.9 21.1-2.6-2.5 2.6-2.6" />
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

export function IkonCari(p: IkonProps) {
  return (
    <Dasar {...p}>
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m15.6 15.6 4.2 4.2" />
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

export function IkonTutup(p: IkonProps) {
  return (
    <Dasar {...p}>
      <path d="M18.2 5.8 5.8 18.2M5.8 5.8l12.4 12.4" />
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
