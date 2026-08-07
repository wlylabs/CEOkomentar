export type User = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  /** Bulan bergabung, mis. "Maret 2021" */
  joinedAt: string;
  following: number;
  followers: number;
  verified: boolean;
};

export type Comment = {
  id: string;
  authorId: string;
  /** id komentar yang dibalas, null untuk komentar utama */
  parentId: string | null;
  text: string;
  /** waktu pembuatan dalam epoch ms */
  createdAt: number;
  likes: number;
  reposts: number;
  liked: boolean;
  reposted: boolean;
};

export type Tab = "komentar" | "balasan" | "disukai";
export type View = "beranda" | "profil";
