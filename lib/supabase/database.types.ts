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
