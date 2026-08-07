"use client";

import { IkonTerverifikasi } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { User } from "@/lib/types";

/**
 * Satu lencana centang untuk tiap akun, tidak pernah dua.
 *
 * Admin memakai centang emas seperti akun resmi di Twitter; akun terverifikasi
 * biasa memakai centang biru. Bentuknya sama persis, yang membedakan hanya
 * warna — jadi arti "ini akun yang benar" terbaca sekali lihat, dan peran admin
 * cukup dijelaskan lewat tooltip alih-alih pil bertuliskan "ADMIN".
 */
export default function Lencana({
  pengguna,
  size = 17,
}: {
  pengguna: User;
  size?: number;
}) {
  const { t } = useBahasa();

  if (!pengguna.admin && !pengguna.verified) return null;

  const emas = pengguna.admin;
  const judul = t(emas ? "lencana.adminJudul" : "lencana.terverifikasiJudul");

  return (
    <span
      className={`lencana${emas ? " lencana-emas" : ""}`}
      title={judul}
      role="img"
      aria-label={judul}
    >
      <IkonTerverifikasi size={size} />
    </span>
  );
}
