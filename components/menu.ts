import {
  IkonBeranda,
  IkonLonceng,
  IkonMisi,
  IkonPanduan,
  IkonProfil,
} from "./Icons";
import type { KunciTeks } from "@/lib/i18n/kamus";
import type { View } from "@/lib/types";

/**
 * Lima tujuan utama aplikasi, ditulis sekali di sini karena dipakai dua
 * navigasi yang berbeda bentuk: bilah samping di layar lebar dan bilah bawah
 * di ponsel. Urutannya sama di keduanya supaya kebiasaan jari tidak berpindah.
 *
 * Panduan duduk tepat setelah beranda, bukan di ujung daftar: isinya menjawab
 * "kapan dan apa yang sebaiknya kutulis", dan pertanyaan itu datang sebelum
 * misi maupun notifikasi, bukan sesudahnya.
 */
export const MENU: { kunci: View; label: KunciTeks }[] = [
  { kunci: "beranda", label: "nav.beranda" },
  { kunci: "panduan", label: "nav.panduan" },
  { kunci: "misi", label: "nav.misi" },
  { kunci: "notifikasi", label: "nav.notifikasi" },
  { kunci: "profil", label: "nav.profil" },
];

export const IKON_MENU = {
  beranda: IkonBeranda,
  panduan: IkonPanduan,
  misi: IkonMisi,
  notifikasi: IkonLonceng,
  profil: IkonProfil,
} as const;
