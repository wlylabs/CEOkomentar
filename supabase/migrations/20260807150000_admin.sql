-- ============================================================
-- Twitter Mini — peran admin
-- Jalankan setelah 20260807120000_kedaluwarsa-dan-tamu.sql. Aman dijalankan ulang.
--
-- Admin adalah akun biasa dengan satu tambahan: ia boleh menghapus komentar
-- siapa pun. Tidak ada hak lain — admin tidak bisa membaca komentar
-- kedaluwarsa, menyunting profil orang, atau mengangkat admin baru dari
-- aplikasi. Pengangkatan hanya lewat berkas ini atau SQL Editor.
-- ============================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ============================================================
-- Daftar handle admin
--
-- Satu tempat untuk keputusan siapa yang admin, dipakai pemicu di bawah dan
-- oleh perintah seed. Menambah admin berarti menambah handle di sini lalu
-- menjalankan ulang berkas ini.
-- ============================================================

create or replace function public.handle_admin()
returns text[]
language sql
immutable
parallel safe
as $$
  select array['gaptekcat']::text[];
$$;

grant execute on function public.handle_admin() to authenticated;

create or replace function public.apakah_handle_admin(handle_uji text)
returns boolean
language sql
immutable
parallel safe
as $$
  select exists (
    select 1
    from unnest(public.handle_admin()) as h
    where lower(h) = lower(btrim(coalesce(handle_uji, '')))
  );
$$;

-- ============================================================
-- Pengangkatan
-- ============================================================

/*
 * Profil yang baru dibuat dengan handle admin langsung diberi tanda. Dengan
 * begitu @gaptekcat tetap menjadi admin walau akunnya baru didaftarkan
 * setelah migrasi ini jalan — tidak ada langkah manual yang perlu diingat.
 *
 * Sengaja hanya pada INSERT. Kalau pemicunya ikut jalan saat handle diubah,
 * siapa pun yang kelak mengambil alih handle yang ditinggalkan akan ikut
 * mewarisi haknya.
 */
create or replace function public.tandai_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.apakah_handle_admin(new.handle) then
    new.is_admin := true;
    new.verified := true;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_tandai_admin on public.profiles;
create trigger profiles_tandai_admin
  before insert on public.profiles
  for each row execute function public.tandai_admin();

/*
 * Kebijakan RLS mengizinkan tiap orang menyunting barisnya sendiri, dan itu
 * termasuk kolom `is_admin` serta `verified` kalau tidak dijaga: satu panggilan
 * update dari peramban sudah cukup untuk mengangkat diri sendiri. Pemicu ini
 * mengembalikan kedua kolom itu ke nilai lamanya untuk setiap perubahan yang
 * datang dari sesi pengguna. Perintah dari SQL Editor, migrasi, dan
 * service_role tidak punya auth.uid(), jadi tetap bisa mengubahnya.
 */
create or replace function public.jaga_kolom_istimewa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  new.is_admin := old.is_admin;
  new.verified := old.verified;
  return new;
end;
$$;

drop trigger if exists profiles_jaga_kolom_istimewa on public.profiles;
create trigger profiles_jaga_kolom_istimewa
  before update on public.profiles
  for each row execute function public.jaga_kolom_istimewa();

/* Akun yang sudah ada sebelum berkas ini dijalankan. */
update public.profiles
  set is_admin = true,
      verified = true
  where public.apakah_handle_admin(handle)
    and not (is_admin and verified);

-- ============================================================
-- Hak admin: menghapus komentar siapa pun
-- ============================================================

/*
 * SECURITY DEFINER supaya kebijakan di bawah tidak bergantung pada kebijakan
 * SELECT tabel profiles, dan STABLE supaya perencana kueri cukup memanggilnya
 * sekali per pernyataan.
 */
create or replace function public.apakah_admin(pengguna uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = pengguna),
    false
  );
$$;

revoke execute on function public.apakah_admin(uuid) from public;
grant execute on function public.apakah_admin(uuid) to authenticated;

drop policy if exists "komentar sendiri dapat dihapus" on public.comments;
drop policy if exists "komentar dapat dihapus penulis atau admin" on public.comments;
create policy "komentar dapat dihapus penulis atau admin"
  on public.comments for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or (select public.apakah_admin())
  );
