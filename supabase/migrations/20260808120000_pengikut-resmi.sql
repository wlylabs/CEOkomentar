-- ============================================================
-- Twitter Mini — daftar pengikut resmi
-- Jalankan setelah 20260808110000_penguat-keamanan.sql. Aman dijalankan ulang.
--
-- Sampai sekarang misi "ikuti-x" diperiksa dengan bertanya langsung ke X:
-- `GET /2/users/:id/following`. Titik akhir itu sudah tidak tersedia untuk
-- aplikasi self-serve — X menyisakannya di kontrak enterprise — sehingga
-- pemeriksaannya selalu berakhir "tidak yakin" dan lencananya tidak pernah
-- diberikan kepada siapa pun.
--
-- Sumber kebenarannya dipindahkan ke sini: satu daftar pengikut @CEOkomentar
-- yang disegarkan sekaligus oleh pengelola, dan verifikasi menjadi pencocokan
-- nama terhadap daftar itu. Yang tidak berubah adalah aturan pokoknya — akun X
-- tetap harus dibuktikan miliknya lewat OAuth, dan peramban tetap tidak punya
-- jalan menulis ke tabel lencana.
--
-- Nama yang belum tercatat tidak lagi berarti "gagal". Ia masuk antrean
-- `menunggu`, dan penyegaran daftar berikutnya yang menyelesaikannya — tanpa
-- pemakainya perlu menekan apa pun lagi.
-- ============================================================

-- ============================================================
-- Daftar pengikut
-- ============================================================

create table if not exists public.pengikut_resmi (
  /* huruf kecil dipakai sebagai kunci karena X tidak membedakan besar-kecil
     huruf pada username, sementara tampilannya bisa berbeda-beda */
  username_kecil text primary key,
  username text not null,
  dicatat_at timestamptz not null default now(),
  constraint pengikut_resmi_format check (username ~ '^[A-Za-z0-9_]{1,15}$'),
  constraint pengikut_resmi_kecil check (username_kecil = lower(username))
);

comment on table public.pengikut_resmi is
  'pengikut @CEOkomentar hasil penyegaran terakhir; hanya ditulis public.ganti_pengikut_resmi()';

/*
 * Kapan daftarnya terakhir disegarkan, dalam satu baris tunggal.
 *
 * Tanpa waktu ini "namanya tidak ada di daftar" adalah kalimat yang tidak bisa
 * dibaca: entah ia memang berhenti mengikuti, entah daftarnya yang belum
 * menyusul. Yang membedakan keduanya hanya perbandingan waktu — dan beda itu
 * menentukan apakah sebuah lencana pantas dicabut.
 */
create table if not exists public.pengikut_resmi_kabar (
  tunggal boolean primary key default true,
  disegarkan_at timestamptz,
  jumlah integer not null default 0,
  constraint pengikut_resmi_kabar_tunggal check (tunggal)
);

insert into public.pengikut_resmi_kabar (tunggal) values (true)
on conflict (tunggal) do nothing;

-- ============================================================
-- Penyegaran daftar
--
-- Satu panggilan mengganti seluruh isinya: yang tidak ikut terkirim berarti
-- sudah tidak mengikuti. Karena itu daftar kosong ditolak kecuali diminta
-- dengan sengaja — satu unggahan yang gagal di tengah jalan tidak boleh bisa
-- mengosongkan tabel ini tanpa ada yang menyadarinya.
-- ============================================================

create or replace function public.ganti_pengikut_resmi(
  daftar text[],
  paksa boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  sah text[];
  /* namanya sengaja tidak `jumlah`: kolom di `pengikut_resmi_kabar` bernama
     begitu, dan yang bertabrakan dengan nama kolom tidak bisa dipakai di sisi
     kanan sebuah UPDATE tanpa jadi ambigu */
  terhitung integer;
  baris record;
begin
  select coalesce(array_agg(distinct lower(nama)), '{}'::text[])
    into sah
    from unnest(coalesce(daftar, '{}'::text[])) as nama
   where nama ~ '^[A-Za-z0-9_]{1,15}$';

  terhitung := coalesce(array_length(sah, 1), 0);

  if terhitung = 0
     and not paksa
     and exists (select 1 from public.pengikut_resmi) then
    raise exception 'daftar pengikut kosong; kirim paksa := true bila memang disengaja';
  end if;

  delete from public.pengikut_resmi
   where not (username_kecil = any (sah));

  insert into public.pengikut_resmi (username_kecil, username)
  select lower(nama), min(nama)
    from unnest(coalesce(daftar, '{}'::text[])) as nama
   where nama ~ '^[A-Za-z0-9_]{1,15}$'
   group by lower(nama)
  on conflict (username_kecil) do update
    set username = excluded.username,
        dicatat_at = now();

  update public.pengikut_resmi_kabar
     set disegarkan_at = now(),
         jumlah = terhitung
   where tunggal;

  /*
   * Antrean tinjauan dikosongkan di sini, bukan menunggu pemakainya kembali:
   * yang ditunggu memang cuma daftar ini, dan daftarnya baru saja datang.
   */
  for baris in
    select m.user_id, a.username
      from public.misi_pengguna m
      join public.akun_x a on a.user_id = m.user_id
     where m.misi = 'ikuti-x'
       and m.status = 'menunggu'
       and exists (
         select 1 from public.pengikut_resmi p
          where p.username_kecil = lower(a.username)
       )
  loop
    perform public.selesaikan_misi(
      baris.user_id,
      'ikuti-x',
      jsonb_build_object('x_username', baris.username)
    );
  end loop;

  /*
   * Yang sebaliknya — lencana milik nama yang hilang dari daftar — sengaja
   * tidak dicabut di sini. Pencabutan massal dari satu unggahan yang keliru
   * terlalu mahal untuk dibatalkan; yang mencabut tetap pemeriksaan ulang oleh
   * pemilik akun X-nya sendiri, di `periksa_misi_x()` di bawah.
   */

  return terhitung;
end;
$$;

-- ============================================================
-- Pemeriksaan
--
-- Pengganti `selesaikan_misi_x()`. Bedanya satu: yang menjawab "mengikuti atau
-- tidak" bukan lagi aplikasi yang bertanya ke X, melainkan daftar di atas.
--
-- Nilai yang dikembalikan:
--   'berhasil'   — tercatat sebagai pengikut; lencana baru saja diberikan
--   'sudah'      — tercatat, dan lencananya memang sudah dimiliki
--   'menunggu'   — belum tercatat, masuk antrean penyegaran berikutnya
--   'belumIkut'  — belum tercatat padahal daftarnya sudah disegarkan sesudahnya
--   'belumSegar' — sudah punya lencana, dan daftarnya belum cukup baru untuk
--                  bisa membantahnya; lencananya dibiarkan
--   'dicabut'    — sudah punya lencana, daftar yang lebih baru tidak memuatnya
--   'terpakai'   — akun X itu sudah menjadi bukti milik akun aplikasi lain
--   'lain'       — akun aplikasi ini sudah terikat ke akun X yang berbeda
-- ============================================================

create or replace function public.periksa_misi_x(
  pengguna uuid,
  x_id text,
  x_username text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  pemilik uuid;
  terikat text;
  tercatat boolean;
  jejak record;
  segar timestamptz;
begin
  /* Ikatan akun X tetap permanen: satu pengikutan tidak boleh dipakai berkali
     kali oleh akun-akun baru. */
  select user_id into pemilik from public.akun_x where x_user_id = x_id;
  if pemilik is not null and pemilik <> pengguna then
    return 'terpakai';
  end if;

  select x_user_id into terikat from public.akun_x where user_id = pengguna;
  if terikat is not null and terikat <> x_id then
    return 'lain';
  end if;

  insert into public.akun_x (x_user_id, user_id, username)
  values (x_id, pengguna, x_username)
  on conflict (x_user_id) do update
    set username = excluded.username,
        diperiksa_at = now();

  select exists (
    select 1 from public.pengikut_resmi
     where username_kecil = lower(x_username)
  ) into tercatat;

  select status, dibuat_at, selesai_at
    into jejak
    from public.misi_pengguna
   where user_id = pengguna and misi = 'ikuti-x';

  if tercatat then
    perform public.selesaikan_misi(
      pengguna,
      'ikuti-x',
      jsonb_build_object('x_username', x_username)
    );
    return case when jejak.status = 'selesai' then 'sudah' else 'berhasil' end;
  end if;

  select disegarkan_at into segar from public.pengikut_resmi_kabar where tunggal;

  /* Lencana yang sudah menempel hanya boleh dilepas oleh daftar yang lebih baru
     daripada pemberiannya. Daftar yang lebih tua tidak tahu apa-apa tentang apa
     yang terjadi sesudahnya, dan diam bukan bantahan. */
  if jejak.status = 'selesai' then
    if segar is not null
       and jejak.selesai_at is not null
       and segar > jejak.selesai_at then
      perform public.batalkan_misi(pengguna, 'ikuti-x');
      return 'dicabut';
    end if;
    return 'belumSegar';
  end if;

  insert into public.misi_pengguna (user_id, misi, status, bukti)
  values (
    pengguna,
    'ikuti-x',
    'menunggu',
    jsonb_build_object('x_username', x_username)
  )
  on conflict (user_id, misi) do update
    set status = 'menunggu',
        bukti = excluded.bukti;

  /* Antrean yang sudah pernah melewati satu penyegaran dan tetap tidak tercatat
     memang jawabannya "belum mengikuti" — bukan "belum diperiksa". */
  if jejak.status = 'menunggu'
     and segar is not null
     and jejak.dibuat_at is not null
     and segar > jejak.dibuat_at then
    return 'belumIkut';
  end if;

  return 'menunggu';
end;
$$;

/*
 * `selesaikan_misi_x()` memberi lencana tanpa menyentuh daftar pengikut sama
 * sekali. Selama ia masih ada, ada dua pintu menuju tabel lencana dan hanya
 * satu yang memeriksa syaratnya. Pintu yang tidak dipakai lagi ditutup.
 */
drop function if exists public.selesaikan_misi_x(uuid, text, text);

-- ============================================================
-- Hak akses
--
-- Daftar pengikut memuat nama-nama orang di layanan lain; peramban tidak
-- berkepentingan membacanya, dan tidak ada satu pun kebijakan RLS yang
-- memberinya jalan.
-- ============================================================

revoke all on public.pengikut_resmi, public.pengikut_resmi_kabar
  from anon, authenticated;

alter table public.pengikut_resmi       enable row level security;
alter table public.pengikut_resmi_kabar enable row level security;

do $$
declare
  tanda_tangan text;
begin
  foreach tanda_tangan in array array[
    'public.ganti_pengikut_resmi(text[], boolean)',
    'public.periksa_misi_x(uuid, text, text)'
  ] loop
    execute format('revoke execute on function %s from public', tanda_tangan);
    execute format('grant execute on function %s to service_role', tanda_tangan);
  end loop;
end
$$;
