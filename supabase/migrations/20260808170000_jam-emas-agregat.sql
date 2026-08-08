-- ============================================================
-- Twitter Mini — agregat jam emas
-- Jalankan setelah 20260808160000_handle-admin-baru.sql. Aman dijalankan ulang.
--
-- Kartu jam emas selama ini membaca tabel tetap yang ditulis tangan di
-- lib/jamEmas.ts: Selasa pukul 20.00 bernilai sama hari ini, bulan depan, dan
-- tahun depan. Berkas ini memberinya sumber kedua — kebiasaan audiens aplikasi
-- ini sendiri.
--
-- Persoalannya, komentar di sini hanya hidup 24 jam lalu benar-benar dihapus,
-- dan suka serta posting ulangnya ikut lenyap lewat ON DELETE CASCADE. Tidak
-- ada riwayat yang bisa dikueri belakangan; angkanya harus ditangkap sebelum
-- disapu. Karena itu penyapu berkala yang sama yang menghapus komentar juga
-- yang menggulung hasilnya lebih dulu ke tabel di bawah.
--
-- Waktunya kebetulan tepat: komentar yang jatuh tempo berumur genap 24 jam,
-- yang berarti kurva jangkauannya di lib/jangkauan.ts sudah selesai penuh.
-- Yang tercatat adalah hasil akhir sebuah komentar, bukan potretan setengah
-- jalan.
-- ============================================================

-- ============================================================
-- Tabel agregat
--
-- Ukurannya tidak pernah tumbuh: paling banyak 168 baris, satu untuk tiap
-- perpaduan hari dan jam WIB. Yang bertambah hanya angka di dalamnya.
--
-- `hari` mengikuti extract(dow ...) — 0 Minggu sampai 6 Sabtu — supaya sama
-- persis dengan getUTCDay() yang dipakai lib/jamEmas.ts, dan `jam` memakai jam
-- WIB, bukan UTC, karena yang diukur kebiasaan orang Indonesia membuka
-- linimasa.
--
-- Yang disimpan hanya suka dan posting ulang: keduanya perbuatan orang
-- sungguhan yang tercatat di basis data. Tayangan sengaja ditinggalkan — angka
-- itu dibangkitkan dari benih id di lib/jangkauan.ts, jadi merekamnya sama saja
-- dengan mengukur pengacaknya sendiri.
-- ============================================================

create table if not exists public.jam_emas_agregat (
  hari smallint not null check (hari between 0 and 6),
  jam smallint not null check (jam between 0 and 23),
  /** banyaknya komentar yang pernah ditulis pada potongan jam ini */
  komentar bigint not null default 0 check (komentar >= 0),
  suka bigint not null default 0 check (suka >= 0),
  ulang bigint not null default 0 check (ulang >= 0),
  diperbarui timestamptz not null default now(),
  primary key (hari, jam)
);

comment on table public.jam_emas_agregat is
  'Hasil akhir komentar yang sudah kedaluwarsa, dijumlahkan per hari dan jam WIB. Ditulis hanya oleh sapu_komentar_kedaluwarsa() tepat sebelum barisnya dihapus.';

alter table public.jam_emas_agregat enable row level security;

/*
 * Agregatnya sengaja terbuka bagi siapa pun yang sudah masuk: isinya bukan
 * milik seorang pengguna, melainkan bentuk hari yang sama yang dilihat semua
 * orang di kartu jam emas. Tidak ada kebijakan tulis sama sekali — satu-satunya
 * yang boleh mengubahnya adalah penyapu di bawah, yang berjalan SECURITY
 * DEFINER dan karena itu lewat di atas RLS.
 */
drop policy if exists "agregat jam emas dapat dibaca pengguna masuk"
  on public.jam_emas_agregat;
create policy "agregat jam emas dapat dibaca pengguna masuk"
  on public.jam_emas_agregat for select
  to authenticated
  using (true);

grant select on public.jam_emas_agregat to authenticated;
revoke insert, update, delete on public.jam_emas_agregat from authenticated, anon;

-- ============================================================
-- Penyapu yang mencatat sebelum menghapus
--
-- Menggantikan versi di 20260807120000_kedaluwarsa-dan-tamu.sql. Yang
-- ditambahkan hanya dua hal di depan penghapusannya: kunci penasihat supaya dua
-- penyapu yang kebetulan berjalan bersamaan tidak menghitung ganda, dan
-- penggulungan hasil ke jam_emas_agregat.
--
-- INSERT dan DELETE-nya memakai batas yang sama persis, dan now() di dalam satu
-- transaksi selalu mengembalikan waktu yang sama — jadi tidak mungkin ada
-- komentar yang tercatat tanpa dihapus, atau terhapus tanpa tercatat.
-- ============================================================

create or replace function public.sapu_komentar_kedaluwarsa()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  terhapus integer;
begin
  /* Penyapu berjalan tiap sepuluh menit dan biasanya selesai dalam sekejap,
     tapi sekali saja dua jalannya bertumpang tindih — pg_cron yang tertahan,
     atau panggilan manual dari psql — angka di agregat akan bertambah dua kali
     untuk komentar yang sama. Yang kedua lebih baik langsung pulang. */
  if not pg_try_advisory_xact_lock(8723001) then
    return 0;
  end if;

  /* Gulung dulu hasil akhirnya. like_count dan repost_count dipelihara pemicu
     di 20260808110000_penguat-keamanan.sql dan tidak bisa disentuh klien, jadi
     keduanya bisa dibaca langsung tanpa menghitung ulang tabel likes/reposts. */
  insert into public.jam_emas_agregat as a (hari, jam, komentar, suka, ulang)
  select
    extract(dow from w.wib)::smallint,
    extract(hour from w.wib)::smallint,
    count(*),
    sum(c.like_count),
    sum(c.repost_count)
  from public.comments c
  cross join lateral (
    select c.created_at at time zone 'Asia/Jakarta' as wib
  ) w
  where c.created_at <= now() - public.masa_komentar()
  group by 1, 2
  on conflict (hari, jam) do update
    set komentar = a.komentar + excluded.komentar,
        suka = a.suka + excluded.suka,
        ulang = a.ulang + excluded.ulang,
        diperbarui = now();

  -- Sejak 20260807230000_tanpa-balasan.sql komentar berdiri sendiri, jadi tidak
  -- ada lagi balasan yang ikut terbawa ON DELETE CASCADE sebelum umurnya genap.
  -- Yang terhapus persis yang barusan tercatat.
  delete from public.comments
    where created_at <= now() - public.masa_komentar();
  get diagnostics terhapus = row_count;
  return terhapus;
end;
$$;

revoke execute on function public.sapu_komentar_kedaluwarsa() from public;
