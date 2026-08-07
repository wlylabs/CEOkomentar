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
  verified: boolean;
  /** admin boleh menghapus komentar siapa pun; ditetapkan di basis data */
  admin: boolean;
};

export type Comment = {
  id: string;
  authorId: string;
  /** id komentar yang dibalas, null untuk komentar utama */
  parentId: string | null;
  /** handle penulis komentar induk, dipakai untuk label "Membalas @…" */
  parentHandle: string | null;
  text: string;
  /** waktu pembuatan dalam epoch ms */
  createdAt: number;
  likes: number;
  reposts: number;
  replies: number;
  liked: boolean;
  reposted: boolean;
};

export type Statistik = {
  komentar: number;
  balasan: number;
  disukai: number;
  sukaDiterima: number;
  ulangDiterima: number;
};

export type Tab = "komentar" | "balasan" | "disukai";
export type View = "beranda" | "profil";
