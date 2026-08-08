-- ============================================================
-- Twitter Mini — penguat keamanan basis data
-- Jalankan setelah 20260808100000_misi-lencana.sql. Aman dijalankan ulang.
--
-- Kebijakan RLS menjawab pertanyaan "baris mana yang boleh disentuh", bukan
-- "kolom mana". Selama ini itu berarti sebuah UPDATE dari peramban — bukan
-- lewat antarmuka, cukup satu panggilan PostgREST — masih bisa menulis kolom
-- yang seharusnya hanya diisi pemicu:
--
--   * profiles.followers_count dan following_count — jumlah pengikut palsu
--   * comments.like_count dan repost_count — angka suka palsu
--   * comments.author_id — komentar berpindah penulis
--   * profiles.handle — mengambil alih handle akun resmi
--
-- Berkas ini menutup keempatnya, dan menambahkan rem laju penulisan komentar.
-- Semua penjaga di bawah membiarkan lewat perintah yang datang tanpa sesi
-- (SQL Editor, migrasi, service_role) dan perintah dari pemicu tepercaya yang
-- menyalakan mode sistem.
-- ============================================================

-- ============================================================
-- Penghitung: pemicu tepercaya menyalakan mode sistem
-- ============================================================

create or replace function public.hitung_ikut()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.sistem', 'ya', true);

  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
  else
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  end if;

  perform set_config('app.sistem', '', true);
  return null;
end;
$$;

drop trigger if exists follows_hitung on public.follows;
create trigger follows_hitung
  after insert or delete on public.follows
  for each row execute function public.hitung_ikut();

create or replace function public.hitung_suka()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.sistem', 'ya', true);

  if tg_op = 'INSERT' then
    update public.comments
      set like_count = like_count + 1
      where id = new.comment_id;
  else
    update public.comments
      set like_count = greatest(like_count - 1, 0)
      where id = old.comment_id;
  end if;

  perform set_config('app.sistem', '', true);
  return null;
end;
$$;

drop trigger if exists likes_hitung on public.likes;
create trigger likes_hitung
  after insert or delete on public.likes
  for each row execute function public.hitung_suka();

create or replace function public.hitung_ulang()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.sistem', 'ya', true);

  if tg_op = 'INSERT' then
    update public.comments
      set repost_count = repost_count + 1
      where id = new.comment_id;
  else
    update public.comments
      set repost_count = greatest(repost_count - 1, 0)
      where id = old.comment_id;
  end if;

  perform set_config('app.sistem', '', true);
  return null;
end;
$$;

drop trigger if exists reposts_hitung on public.reposts;
create trigger reposts_hitung
  after insert or delete on public.reposts
  for each row execute function public.hitung_ulang();

-- ============================================================
-- Profil: kolom yang tidak boleh disentuh sesi pengguna
--
-- Yang tersisa untuk diubah dari aplikasi tinggal name, bio, location,
-- avatar_url, banner_url, dan handle — persis yang ada di form edit profil.
-- ============================================================

create or replace function public.jaga_kolom_istimewa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.mode_sistem() then
    return new;
  end if;

  new.id := old.id;
  new.is_admin := old.is_admin;
  new.verified := old.verified;
  new.lencana := old.lencana;
  new.following_count := old.following_count;
  new.followers_count := old.followers_count;
  new.created_at := old.created_at;

  /*
   * Pemicu pengangkatan admin sengaja hanya berjalan saat INSERT, jadi handle
   * akun resmi yang berpindah tangan tidak ikut membawa haknya. Yang tetap
   * berpindah adalah namanya — dan nama itu yang dilihat orang. Karena itu
   * handle yang dicadangkan tidak boleh diambil siapa pun dari aplikasi.
   */
  if lower(new.handle) is distinct from lower(old.handle)
     and public.apakah_handle_admin(new.handle)
  then
    raise exception 'handle @% dicadangkan untuk akun resmi', new.handle
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_jaga_kolom_istimewa on public.profiles;
create trigger profiles_jaga_kolom_istimewa
  before update on public.profiles
  for each row execute function public.jaga_kolom_istimewa();

/* Pendaftaran tidak perlu penjaga serupa: satu akun hanya punya satu baris
   profil (kunci utamanya id akun), dan barisnya sudah dibuat pemicu pendaftaran
   sebelum sesi mana pun sempat menyisipkan yang lain. Handle resmi pun tetap
   tunggal karena indeks unik pada lower(handle). */

-- ============================================================
-- Komentar: hanya isinya yang boleh berubah
-- ============================================================

create or replace function public.jaga_komentar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.mode_sistem() then
    return new;
  end if;

  new.id := old.id;
  new.author_id := old.author_id;
  new.created_at := old.created_at;
  new.like_count := old.like_count;
  new.repost_count := old.repost_count;

  return new;
end;
$$;

drop trigger if exists comments_jaga on public.comments;
create trigger comments_jaga
  before update on public.comments
  for each row execute function public.jaga_komentar();

-- ============================================================
-- Rem laju penulisan komentar
--
-- Kebijakan RLS tidak mengenal waktu, jadi tanpa ini satu skrip bisa mengisi
-- beranda dengan ratusan komentar dalam sekejap. Angkanya longgar untuk orang
-- yang benar-benar mengetik — dua belas komentar dalam satu menit sudah jauh
-- di atas kecepatan wajar — dan ketat untuk yang tidak.
-- ============================================================

create or replace function public.batas_komentar()
returns integer
language sql
immutable
parallel safe
as $$
  select 12;
$$;

grant execute on function public.batas_komentar() to authenticated;

create or replace function public.rem_komentar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  belakangan integer;
begin
  if auth.uid() is null then
    return new;
  end if;

  select count(*) into belakangan
    from public.comments
   where author_id = new.author_id
     and created_at > now() - interval '1 minute';

  if belakangan >= public.batas_komentar() then
    raise exception 'terlalu banyak komentar dalam satu menit'
      using errcode = '54000';
  end if;

  return new;
end;
$$;

drop trigger if exists comments_rem on public.comments;
create trigger comments_rem
  before insert on public.comments
  for each row execute function public.rem_komentar();

-- ============================================================
-- Hak yang tidak pernah dipakai aplikasi
--
-- Aplikasi hanya menyisipkan dan menghapus baris tanda; tidak ada satu pun
-- pembaruan. Haknya ikut dicabut supaya luas serangannya sesempit kelakuannya.
-- ============================================================

revoke update on public.likes, public.reposts, public.follows from authenticated;
