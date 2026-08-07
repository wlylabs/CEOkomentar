/**
 * Bentuk tabel dan fungsi di Supabase, ditulis mengikuti seluruh berkas di
 * `supabase/migrations/`. Perbarui berkas ini bila skema berubah agar
 * pemanggilan `.from()` dan `.rpc()` tetap bertipe.
 */

export type BarisProfil = {
  id: string;
  handle: string;
  name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  banner_url: string | null;
  verified: boolean;
  is_admin: boolean;
  following_count: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
};

export type BarisKomentar = {
  id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  like_count: number;
  repost_count: number;
  reply_count: number;
};

type BarisTanda = {
  comment_id: string;
  user_id: string;
  created_at: string;
};

export type JenisNotifikasi = "suka" | "ulang" | "balas" | "ikut";

export type BarisNotifikasi = {
  id: string;
  /** penerima kabar */
  user_id: string;
  /** yang melakukan */
  actor_id: string;
  jenis: JenisNotifikasi;
  /** null untuk kabar 'ikut' */
  comment_id: string | null;
  created_at: string;
  dibaca_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: BarisProfil;
        Insert: Partial<BarisProfil> & Pick<BarisProfil, "id" | "handle" | "name">;
        Update: Partial<BarisProfil>;
        Relationships: [];
      };
      comments: {
        Row: BarisKomentar;
        Insert: Partial<BarisKomentar> & Pick<BarisKomentar, "author_id" | "body">;
        Update: Partial<BarisKomentar>;
        Relationships: [];
      };
      likes: {
        Row: BarisTanda;
        Insert: Pick<BarisTanda, "comment_id" | "user_id">;
        Update: Partial<BarisTanda>;
        Relationships: [];
      };
      reposts: {
        Row: BarisTanda;
        Insert: Pick<BarisTanda, "comment_id" | "user_id">;
        Update: Partial<BarisTanda>;
        Relationships: [];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string };
        Update: Partial<{ follower_id: string; following_id: string }>;
        Relationships: [];
      };
      bookmarks: {
        Row: BarisTanda;
        Insert: Pick<BarisTanda, "comment_id" | "user_id">;
        Update: Partial<BarisTanda>;
        Relationships: [];
      };
      /* Baris notifikasi hanya ditulis pemicu basis data; aplikasi cuma membaca,
         menandai terbaca, dan menghapus. */
      notifications: {
        Row: BarisNotifikasi;
        Insert: never;
        Update: Partial<Pick<BarisNotifikasi, "dibaca_at">>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      handle_tersedia: {
        Args: { handle_baru: string };
        Returns: boolean;
      };
      pastikan_profil: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      apakah_admin: {
        Args: { pengguna?: string };
        Returns: boolean;
      };
      tren_tagar: {
        Args: { batas?: number };
        Returns: { tagar: string; komentar: number; penulis: number }[];
      };
      statistik_pengguna: {
        Args: { pengguna: string };
        Returns: {
          komentar: number;
          balasan: number;
          disukai: number;
          suka_diterima: number;
          ulang_diterima: number;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
