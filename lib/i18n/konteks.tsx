"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  KUNCI_BAHASA,
  UMUR_KUKI_BAHASA,
  type Bahasa,
} from "./bahasa";
import { teks, type Isian, type KunciTeks } from "./kamus";
import { keNode } from "./kaya";

type Nilai = {
  bahasa: Bahasa;
  gantiBahasa: (berikut: Bahasa) => void;
  /** satu kalimat sebagai teks biasa */
  t: (kunci: KunciTeks, isian?: Isian) => string;
  /** kalimat yang memuat <code>, <kbd>, atau <strong> */
  tk: (kunci: KunciTeks, isian?: Isian) => ReactNode;
};

const Konteks = createContext<Nilai | null>(null);

/**
 * Bahasa awal datang dari kuki yang dibaca di server, jadi HTML pertama sudah
 * berbahasa benar dan hidrasi tidak pernah bertabrakan. Perubahan setelahnya
 * cukup di sisi peramban: state React untuk layar, kuki untuk kunjungan
 * berikutnya, dan atribut `lang` supaya pembaca layar ikut berganti.
 */
export function PenyediaBahasa({
  awal,
  children,
}: {
  awal: Bahasa;
  children: ReactNode;
}) {
  const [bahasa, setBahasa] = useState<Bahasa>(awal);

  const gantiBahasa = useCallback((berikut: Bahasa) => {
    setBahasa(berikut);
    document.documentElement.lang = berikut;
    document.cookie = `${KUNCI_BAHASA}=${berikut}; path=/; max-age=${UMUR_KUKI_BAHASA}; samesite=lax`;
  }, []);

  const nilai = useMemo<Nilai>(
    () => ({
      bahasa,
      gantiBahasa,
      t: (kunci, isian) => teks(bahasa, kunci, isian),
      tk: (kunci, isian) => keNode(teks(bahasa, kunci, isian)),
    }),
    [bahasa, gantiBahasa],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useBahasa(): Nilai {
  const nilai = useContext(Konteks);
  if (!nilai) {
    throw new Error("useBahasa dipakai di luar <PenyediaBahasa>");
  }
  return nilai;
}
