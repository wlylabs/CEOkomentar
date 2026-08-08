"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { siapkanAgregat, type Agregat, type BinAgregat } from "./jamEmas";

const Konteks = createContext<Agregat | null>(null);

/**
 * Agregat jam emas untuk seluruh halaman.
 *
 * Sama seperti bahasa: satu nilai yang dibaca di server, tidak pernah berubah
 * selama halaman hidup, dan dibutuhkan di beberapa kedalaman sekaligus — kartu
 * jam emas di panel kanan, baris ringkasnya di kolom utama, dan halaman
 * panduan. Mengalirkannya sebagai prop berarti menambah satu parameter di tiap
 * komponen yang kebetulan berada di jalannya, padahal tidak satu pun dari
 * mereka memakainya sendiri.
 *
 * Baris mentahnya diolah sekali di sini, bukan di tiap pembaca: `siapkanAgregat`
 * menyapu seluruh isi tabel dan menghitung skala bersamanya, dan hasilnya sama
 * untuk semua yang membaca.
 */
export function PenyediaJamEmas({
  baris,
  children,
}: {
  baris: BinAgregat[];
  children: ReactNode;
}) {
  const agregat = useMemo(() => siapkanAgregat(baris), [baris]);

  return <Konteks.Provider value={agregat}>{children}</Konteks.Provider>;
}

/**
 * Agregat yang sedang berlaku, atau null bila belum ada yang bisa diukur.
 *
 * Sengaja tidak melempar bila penyedianya tidak ada, tidak seperti
 * `useBahasa()`: null di sini bukan kesalahan pemasangan melainkan keadaan yang
 * sah — dan artinya sama persis dengan "belum ada datanya", yaitu kartu jam
 * emas berjalan dengan pola bawaannya.
 */
export function useAgregatJamEmas(): Agregat | null {
  return useContext(Konteks);
}
