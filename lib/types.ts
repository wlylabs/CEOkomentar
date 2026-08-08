import type { KodeLencana } from "./lencana";

export type User = {
  id: string;
  name: string;
  handle: string;
  /** URL publik foto profil di Supabase Storage; null berarti avatar inisial */
  avatar: string | null;
  /** URL publik sampul profil; null berarti gradien bawaan */
  banner: string | null;
  bio: string;
  location: string;
  /** waktu pendaftaran dalam ISO 8601 */
  joinedAt: string;
  following: number;
  followers: number;
  /** ringkasan "punya centang biru"; sama dengan lencana memuat "biru" */
  verified: boolean;
  /** admin boleh menghapus komentar siapa pun; ditetapkan di basis data */
  admin: boolean;
  /** lencana yang sudah dimiliki, urut sesuai katalog di lib/lencana.ts */
  lencana: KodeLencana[];
};

export type Comment = {
  id: string;
  authorId: string;
  text: string;
  /** waktu pembuatan dalam epoch ms */
  createdAt: number;
  likes: number;
  reposts: number;
  liked: boolean;
  reposted: boolean;
};

export type JenisNotifikasi = "suka" | "ulang" | "ikut";

export type Notifikasi = {
  id: string;
  jenis: JenisNotifikasi;
  /** id pelaku; profilnya ikut dibawa dalam `pengguna` */
  aktorId: string;
  /** komentar yang disukai atau diulang; null untuk 'ikut' */
  komentarId: string | null;
  /** kutipan isi komentar, secukupnya untuk satu baris daftar */
  kutipan: string | null;
  createdAt: number;
  dibaca: boolean;
};

/** Satu tagar yang sedang ramai beserta jangkauannya dalam 24 jam terakhir. */
export type Tren = {
  tagar: string;
  komentar: number;
  penulis: number;
};

export type Statistik = {
  komentar: number;
  disukai: number;
  sukaDiterima: number;
  ulangDiterima: number;
};

export type Tab = "komentar" | "disukai";
export type View = "beranda" | "misi" | "notifikasi" | "profil";
