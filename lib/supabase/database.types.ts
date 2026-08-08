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
  lencana: string[];
  following_count: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
};

export type BarisMisi = {
  kode: string;
  lencana: string;
  urutan: number;
  aktif: boolean;
};

export type BarisMisiPengguna = {
  user_id: string;
  misi: string;
  status: string;
  bukti: { x_username?: string } | null;
  dibuat_at: string;
  selesai_at: string | null;
};

export type BarisKomentar = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  like_count: number;
  repost_count: number;
};

type BarisTanda = {
  comment_id: string;
  user_id: string;
  created_at: string;
};

export type JenisNotifikasi = "suka" | "ulang" | "ikut";

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
      /* Katalog misi dan kemajuannya hanya dibaca aplikasi. Yang menuliskannya
         fungsi SECURITY DEFINER yang cuma bisa dipanggil `service_role`. */
      misi: {
        Row: BarisMisi;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      misi_pengguna: {
        Row: BarisMisiPengguna;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lencana_pengguna: {
        Row: {
          user_id: string;
          lencana: string;
          misi: string | null;
          diberikan_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      /* Ikatan akun X. Tidak punya satu pun kebijakan RLS, jadi hanya klien
         `service_role` di server yang benar-benar bisa membacanya. */
      akun_x: {
        Row: {
          x_user_id: string;
          user_id: string;
          username: string;
          terhubung_at: string;
          diperiksa_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      /* Daftar pengikut akun resmi beserta waktu penyegarannya. Sama seperti
         akun_x: tanpa kebijakan RLS, jadi hanya server yang membacanya. */
      pengikut_resmi: {
        Row: { username_kecil: string; username: string; dicatat_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      pengikut_resmi_kabar: {
        Row: {
          tunggal: boolean;
          disegarkan_at: string | null;
          jumlah: number;
        };
        Insert: never;
        Update: never;
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
      /* Tiga fungsi berikut hanya bisa dipanggil `service_role`; klien peramban
         yang mencobanya akan ditolak PostgREST. */
      periksa_misi_x: {
        Args: { pengguna: string; x_id: string; x_username: string };
        Returns: string;
      };
      ganti_pengikut_resmi: {
        Args: { daftar: string[]; paksa?: boolean };
        Returns: number;
      };
      batalkan_misi: {
        Args: { pengguna: string; kode_misi: string };
        Returns: undefined;
      };
      statistik_pengguna: {
        Args: { pengguna: string };
        Returns: {
          komentar: number;
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
