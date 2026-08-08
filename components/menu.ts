import { IkonBeranda, IkonLonceng, IkonMisi, IkonProfil } from "./Icons";
import type { KunciTeks } from "@/lib/i18n/kamus";
import type { View } from "@/lib/types";

/**
 * Empat tujuan utama aplikasi, ditulis sekali di sini karena dipakai dua
 * navigasi yang berbeda bentuk: bilah samping di layar lebar dan bilah bawah
 * di ponsel. Urutannya sama di keduanya supaya kebiasaan jari tidak berpindah.
 */
export const MENU: { kunci: View; label: KunciTeks }[] = [
  { kunci: "beranda", label: "nav.beranda" },
  { kunci: "misi", label: "nav.misi" },
  { kunci: "notifikasi", label: "nav.notifikasi" },
  { kunci: "profil", label: "nav.profil" },
];

export const IKON_MENU = {
  beranda: IkonBeranda,
  misi: IkonMisi,
  notifikasi: IkonLonceng,
  profil: IkonProfil,
} as const;
