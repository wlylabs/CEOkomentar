"use client";

import LencanaKabar from "./LencanaKabar";
import { IKON_MENU, MENU } from "./menu";
import { useBahasa } from "@/lib/i18n/konteks";
import type { View } from "@/lib/types";

type Props = {
  tampilan: View;
  onPindah: (tampilan: View) => void;
  belumDibaca: number;
};

export default function BottomNav({ tampilan, onPindah, belumDibaca }: Props) {
  const { t } = useBahasa();

  return (
    <nav className="bawah" aria-label={t("nav.utama")}>
      {MENU.map(({ kunci, label }) => {
        const aktif = tampilan === kunci;
        const Ikon = IKON_MENU[kunci];
        const kabar = kunci === "notifikasi" ? belumDibaca : 0;
        return (
          <button
            key={kunci}
            type="button"
            className={`bawah-butir${aktif ? " bawah-butir-aktif" : ""}`}
            onClick={() => onPindah(kunci)}
            aria-current={aktif ? "page" : undefined}
          >
            <span className="menu-ikon">
              <Ikon size={24} aktif={aktif} />
              <LencanaKabar jumlah={kabar} />
            </span>
            <span className="bawah-label">{t(label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
