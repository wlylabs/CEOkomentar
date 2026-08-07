"use client";

import { IkonBeranda, IkonProfil } from "./Icons";
import type { View } from "@/lib/types";

type Props = {
  tampilan: View;
  onPindah: (tampilan: View) => void;
};

export default function BottomNav({ tampilan, onPindah }: Props) {
  return (
    <nav className="bawah" aria-label="Navigasi utama">
      {(["beranda", "profil"] as View[]).map((kunci) => {
        const aktif = tampilan === kunci;
        const Ikon = kunci === "beranda" ? IkonBeranda : IkonProfil;
        return (
          <button
            key={kunci}
            type="button"
            className={`bawah-butir${aktif ? " bawah-butir-aktif" : ""}`}
            onClick={() => onPindah(kunci)}
            aria-current={aktif ? "page" : undefined}
          >
            <Ikon size={24} aktif={aktif} />
            <span className="bawah-label">
              {kunci === "beranda" ? "Beranda" : "Profil"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
