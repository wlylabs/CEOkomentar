"use client";

import { useBahasa } from "@/lib/i18n/konteks";

/** Di atas ini angkanya berhenti tumbuh dan berganti "99+", seperti di ponsel. */
const BATAS = 99;

/**
 * Titik merah berisi jumlah kabar yang belum dibaca. Angkanya tetap dibacakan
 * pembaca layar lewat label tersembunyi, karena bentuk bulat kecil ini sendiri
 * tidak mengatakan apa-apa.
 */
export default function LencanaKabar({ jumlah }: { jumlah: number }) {
  const { t } = useBahasa();
  if (jumlah <= 0) return null;

  return (
    <span className="lencana-kabar">
      <span aria-hidden="true">{jumlah > BATAS ? `${BATAS}+` : jumlah}</span>
      <span className="sr-only">{t("notif.belumDibaca", { jumlah })}</span>
    </span>
  );
}
