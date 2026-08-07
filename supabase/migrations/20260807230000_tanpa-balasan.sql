-- ============================================================
-- Twitter Mini — komentar tanpa balasan
-- Jalankan setelah 20260807210000_jejaring.sql. Aman dijalankan ulang.
--
-- Komentar berdiri sendiri sekarang: tidak ada lagi balasan, tidak ada utas,
-- dan tidak ada kabar "membalas komentarmu". Yang dibongkar berkas ini:
--   * comments.parent_id dan comments.reply_count beserta pemicu penghitungnya
--   * pemicu notifikasi balasan dan baris notifikasi berjenis 'balas'
--   * kolom "balasan" pada statistik_pengguna()
--
-- Balasan yang sudah telanjur ada ikut dihapus. Komentar di aplikasi ini
-- memang hanya hidup 24 jam, jadi yang hilang paling lama sehari umurnya.
-- ============================================================

-- ============================================================
-- Pemicu dulu, baru datanya
--
-- hitung_balasan() menyentuh reply_count di tiap insert dan delete, dan
-- notifikasi_balas() membaca parent_id. Keduanya harus pergi sebelum baris
-- balasan disapu, kalau tidak penghapusan massal di bawah malah memicu
-- ribuan pembaruan yang sia-sia.
-- ============================================================

drop trigger if exists comments_hitung_balasan on public.comments;
drop function if exists public.hitung_balasan();

drop trigger if exists comments_notifikasi on public.comments;
drop function if exists public.notifikasi_balas();

-- Balasan atas balasan ikut tersapu lewat ON DELETE CASCADE pada parent_id.
delete from public.comments where parent_id is not null;

-- ============================================================
-- Notifikasi
-- ============================================================

delete from public.notifications where jenis = 'balas';

alter table public.notifications
  drop constraint if exists notifications_jenis_sah;

alter table public.notifications
  add constraint notifications_jenis_sah
  check (jenis in ('suka', 'ulang', 'ikut'));

comment on column public.notifications.comment_id is
  'komentar yang disukai atau diulang; null untuk ''ikut''';

-- ============================================================
-- Kolom komentar
--
-- Indeks comments_parent_idx dan foreign key comments_parent_id_fkey ikut
-- terbawa bersama kolomnya.
-- ============================================================

alter table public.comments
  drop column if exists parent_id,
  drop column if exists reply_count;

-- ============================================================
-- Ringkasan aktivitas
--
-- Bentuk baris yang dikembalikan berubah, jadi fungsinya dibuang dulu:
-- CREATE OR REPLACE tidak boleh mengubah kolom keluaran.
-- ============================================================

drop function if exists public.statistik_pengguna(uuid);

create function public.statistik_pengguna(pengguna uuid)
returns table (
  komentar bigint,
  disukai bigint,
  suka_diterima bigint,
  ulang_diterima bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    (select count(*) from public.comments where author_id = pengguna),
    (select count(*) from public.likes where user_id = pengguna),
    (select coalesce(sum(like_count), 0) from public.comments where author_id = pengguna),
    (select coalesce(sum(repost_count), 0) from public.comments where author_id = pengguna);
$$;

grant execute on function public.statistik_pengguna(uuid) to authenticated;
