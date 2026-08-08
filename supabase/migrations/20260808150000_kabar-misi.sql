-- ============================================================
-- Twitter Mini — kabar pengajuan misi
-- Jalankan setelah 20260808140000_profil-x.sql. Aman dijalankan ulang.
--
-- Pengajuan misi "ikuti-x" adalah sebuah komentar biasa bertagar #TwitterMini.
-- Sampai sekarang tidak ada yang memberitahu admin bahwa pengajuan itu datang:
-- satu-satunya cara menemukannya adalah menekan tagarnya dan menggulir. Kalau
-- tidak ada yang menggulir, pengajuannya lewat 24 jam lalu terhapus bersama
-- komentarnya, dan yang mengajukan menunggu centang yang tidak pernah datang.
--
-- Berkas ini menjadikannya kabar, sejajar dengan suka dan posting ulang:
-- begitu komentar bertagar itu masuk, setiap admin mendapat satu baris di
-- daftar notifikasinya yang menunjuk langsung ke komentarnya.
--
-- Jenis barunya `misi`. Ia hanya pernah ditujukan kepada admin, jadi pemakai
-- biasa tidak akan pernah melihatnya di daftarnya sendiri.
-- ============================================================

-- ============================================================
-- Tagar pengajuan
--
-- Kembarannya di antarmuka adalah `TAGAR_KLAIM` di lib/misi.ts — di sanalah
-- kalimat pengajuannya dirakit. Keduanya harus berbunyi sama; menggantinya
-- berarti mengganti dua tempat, dan hanya dua.
-- ============================================================

create or replace function public.tagar_klaim()
returns text
language sql
immutable
parallel safe
as $$
  select 'TwitterMini'::text;
$$;

grant execute on function public.tagar_klaim() to authenticated;

/*
 * Apakah sebuah komentar merupakan pengajuan misi.
 *
 * Aturan pencocokannya disamakan dengan public.tren_tagar(): tanda pagar harus
 * mengawali kata, dan tagarnya harus berakhir di batas kata — supaya
 * "#TwitterMinimal" tidak ikut terbaca sebagai pengajuan. Besar-kecil huruf
 * diabaikan, seperti tagar di mana pun di aplikasi ini.
 */
create or replace function public.komentar_klaim_misi(isi text)
returns boolean
language sql
immutable
parallel safe
as $$
  select coalesce(isi, '') ~* (
    '(?<![[:alnum:]_#])#' || public.tagar_klaim() || '(?![[:alnum:]_])'
  );
$$;

grant execute on function public.komentar_klaim_misi(text) to authenticated;

-- ============================================================
-- Jenis kabar baru
-- ============================================================

alter table public.notifications
  drop constraint if exists notifications_jenis_sah;

alter table public.notifications
  add constraint notifications_jenis_sah
  check (jenis in ('suka', 'ulang', 'ikut', 'misi'));

comment on column public.notifications.comment_id is
  'komentar yang disukai, diulang, atau diajukan sebagai klaim misi; null untuk ''ikut''';

/*
 * Satu perbuatan boleh mengabari lebih dari satu orang.
 *
 * Indeks lamanya berkunci (actor_id, jenis, comment_id): cukup selama kabar
 * berkomentar hanya pernah punya satu penerima — penulis komentarnya. Pengajuan
 * misi ditujukan kepada semua admin sekaligus, dan dengan kunci lama hanya
 * admin pertama yang mendapatkannya; sisanya jatuh ke ON CONFLICT DO NOTHING.
 *
 * Penerimanya ikut menjadi kunci sekarang. Untuk 'suka' dan 'ulang' artinya
 * tidak berubah sedikit pun — penerimanya memang selalu satu dan sama.
 */
drop index if exists public.notifications_sekali_per_komentar;

create unique index if not exists notifications_sekali_per_komentar
  on public.notifications (user_id, actor_id, jenis, comment_id)
  where comment_id is not null;

-- ============================================================
-- Pemicu
--
-- Hanya pada INSERT. Komentar di aplikasi ini tidak bisa disunting, jadi tagar
-- tidak pernah muncul belakangan pada komentar yang sudah terkirim.
--
-- Tidak ada pasangan penghapusnya seperti pada suka dan posting ulang: yang
-- menarik kabar ini adalah hilangnya komentarnya sendiri, dan itu sudah
-- ditangani ON DELETE CASCADE pada notifications.comment_id — baik saat
-- penulisnya menghapusnya, saat admin menghapusnya, maupun saat umur 24 jamnya
-- habis dan penyapu berkala mengambilnya.
-- ============================================================

create or replace function public.notifikasi_klaim_misi()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin uuid;
begin
  if not public.komentar_klaim_misi(new.body) then
    return null;
  end if;

  /* Admin bisa lebih dari satu, dan yang mengajukan bisa saja admin sendiri —
     catat_notifikasi() yang menyaring kabar untuk diri sendiri. */
  for admin in select id from public.profiles where is_admin loop
    perform public.catat_notifikasi(admin, new.author_id, 'misi', new.id);
  end loop;

  return null;
end;
$$;

revoke execute on function public.notifikasi_klaim_misi() from public;

drop trigger if exists comments_notifikasi_misi on public.comments;
create trigger comments_notifikasi_misi
  after insert on public.comments
  for each row execute function public.notifikasi_klaim_misi();

-- ============================================================
-- Pengajuan yang sudah telanjur ada
--
-- Komentar yang masih hidup saat berkas ini dijalankan tetap dikabarkan, supaya
-- pemasangan pemicunya tidak menelan pengajuan yang datang sejam sebelumnya.
-- ============================================================

do $$
declare
  baris record;
  admin uuid;
begin
  for baris in
    select c.id, c.author_id
      from public.comments c
     where public.komentar_klaim_misi(c.body)
       and c.created_at > now() - public.masa_komentar()
  loop
    for admin in select id from public.profiles where is_admin loop
      perform public.catat_notifikasi(admin, baris.author_id, 'misi', baris.id);
    end loop;
  end loop;
end
$$;
