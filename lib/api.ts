import type { KlienSupabase } from "./supabase/client";
import type {
  BarisKomentar,
  BarisNotifikasi,
  BarisProfil,
} from "./supabase/database.types";
import type { Gambar, JenisMedia } from "./image";
import { PENDUDUK_INDONESIA, ambangKedaluwarsa } from "./kebijakan";
import type {
  Comment,
  Notifikasi,
  Statistik,
  Tab,
  Tren,
  User,
  View,
} from "./types";

export const BATAS_HALAMAN = 25;

const EMBER: Record<JenisMedia, "avatars" | "banners"> = {
  avatar: "avatars",
  sampul: "banners",
};

export const KOLOM_PROFIL =
  "id, handle, name, bio, location, avatar_url, banner_url, verified, is_admin, following_count, followers_count, created_at, updated_at";

const KOLOM_KOMENTAR =
  "id, author_id, parent_id, body, created_at, like_count, repost_count, reply_count";

type BarisFeed = BarisKomentar & { author: BarisProfil | null };

/* ============================================================
   Pemetaan baris basis data ke tipe aplikasi
   ============================================================ */

export function keUser(baris: BarisProfil): User {
  return {
    id: baris.id,
    name: baris.name,
    handle: baris.handle,
    avatar: baris.avatar_url,
    banner: baris.banner_url,
    bio: baris.bio,
    location: baris.location,
    joinedAt: baris.created_at,
    following: baris.following_count,
    /* Pengikut akun resmi sebanyak penduduk Indonesia. Nilai basis data yang
       dipakai kalau sudah lebih besar, jadi migrasi tetap yang menentukan. */
    followers: baris.is_admin
      ? Math.max(baris.followers_count, PENDUDUK_INDONESIA)
      : baris.followers_count,
    verified: baris.verified,
    admin: baris.is_admin,
  };
}

function keComment(baris: BarisKomentar): Comment {
  return {
    id: baris.id,
    authorId: baris.author_id,
    parentId: baris.parent_id,
    parentHandle: null,
    text: baris.body,
    createdAt: new Date(baris.created_at).getTime(),
    likes: baris.like_count,
    reposts: baris.repost_count,
    replies: baris.reply_count,
    liked: false,
    reposted: false,
    saved: false,
  };
}

/**
 * Membuang karakter yang punya arti khusus di penyaring PostgREST — pemisah
 * daftar, tanda kutip, dan jokernya sendiri — supaya pencarian bebas ketik tidak
 * pernah merusak kueri. Titik dibiarkan karena PostgREST hanya memakai dua titik
 * pertama sebagai pemisah kolom dan operator.
 */
function bersihkanKueri(kueri: string) {
  return kueri.replace(/[,()*"'\\%]/g, " ").trim().slice(0, 60);
}

/* ============================================================
   Baca
   ============================================================ */

export async function ambilProfil(
  sb: KlienSupabase,
  id: string,
): Promise<User | null> {
  const { data, error } = await sb
    .from("profiles")
    .select(KOLOM_PROFIL)
    .eq("id", id)
    .maybeSingle<BarisProfil>();

  if (error) throw error;
  return data ? keUser(data) : null;
}

export type OpsiFeed = {
  /** akun yang sedang masuk; penentu tanda suka, posting ulang, dan simpanan */
  akunId: string;
  tampilan: View;
  /** pemilik profil yang sedang dibuka; kosong berarti profil sendiri */
  profilId?: string;
  tab: Tab;
  kueri: string;
  /** penanda halaman dari pemanggilan sebelumnya, null untuk halaman pertama */
  kursor: string | null;
  batas?: number;
};

export type HalamanFeed = {
  komentar: Comment[];
  pengguna: Record<string, User>;
  kursor: string | null;
  habis: boolean;
};

export async function ambilFeed(
  sb: KlienSupabase,
  opsi: OpsiFeed,
): Promise<HalamanFeed> {
  const batas = opsi.batas ?? BATAS_HALAMAN;
  const cari = bersihkanKueri(opsi.kueri);
  const diProfil = opsi.tampilan === "profil";
  const pemilik = opsi.profilId ?? opsi.akunId;
  /* Kebijakan RLS sudah menyembunyikan komentar kedaluwarsa. Penyaring yang
     sama diulang di sini supaya satu halaman tidak pulang setengah kosong dan
     penanda halamannya tetap masuk akal. */
  const ambang = ambangKedaluwarsa();

  /* Pencarian juga menjangkau nama dan handle penulis, jadi id yang cocok
     dikumpulkan lebih dulu lalu dipakai sebagai penyaring tambahan. */
  let idPenulis: string[] = [];
  if (cari) {
    const { data } = await sb
      .from("profiles")
      .select("id")
      .or(`name.ilike.%${cari}%,handle.ilike.%${cari}%`)
      .limit(20);
    idPenulis = (data ?? []).map((b) => b.id);
  }

  const saringPencarian = cari
    ? idPenulis.length > 0
      ? `body.ilike.%${cari}%,author_id.in.(${idPenulis.join(",")})`
      : `body.ilike.%${cari}%`
    : null;

  let baris: BarisFeed[];
  let kursorBerikut: string | null;

  /* Dua tab tidak berisi tulisan pemilik profil melainkan komentar yang ia
     tandai, jadi keduanya dibaca dari tabel tandanya. Simpanan hanya terbaca
     oleh pemiliknya sendiri — itu urusan kebijakan RLS, bukan kueri ini. */
  const tabelTanda: "likes" | "bookmarks" | null = !diProfil
    ? null
    : opsi.tab === "disukai"
      ? "likes"
      : opsi.tab === "disimpan"
        ? "bookmarks"
        : null;

  if (tabelTanda) {
    /* Urutannya menurut kapan komentar itu ditandai, bukan kapan komentar
       ditulis, sehingga penanda halamannya berasal dari tabel tanda. */
    let kueri = sb
      .from(tabelTanda)
      .select(`created_at, comment:comments!inner ( ${KOLOM_KOMENTAR}, author:profiles!comments_author_id_fkey ( ${KOLOM_PROFIL} ) )`)
      .eq("user_id", pemilik)
      .gt("comment.created_at", ambang)
      .order("created_at", { ascending: false })
      .limit(batas);

    if (opsi.kursor) kueri = kueri.lt("created_at", opsi.kursor);
    if (saringPencarian) {
      kueri = kueri.or(saringPencarian, { referencedTable: "comment" });
    }

    const { data, error } = await kueri.returns<
      { created_at: string; comment: BarisFeed | null }[]
    >();
    if (error) throw error;

    const isi = data ?? [];
    baris = isi.map((b) => b.comment).filter((b): b is BarisFeed => b !== null);
    kursorBerikut =
      isi.length === batas ? isi[isi.length - 1].created_at : null;
  } else {
    let kueri = sb
      .from("comments")
      .select(`${KOLOM_KOMENTAR}, author:profiles!comments_author_id_fkey ( ${KOLOM_PROFIL} )`)
      .gt("created_at", ambang)
      .order("created_at", { ascending: false })
      .limit(batas);

    if (diProfil) {
      kueri = kueri.eq("author_id", pemilik);
      kueri =
        opsi.tab === "balasan"
          ? kueri.not("parent_id", "is", null)
          : kueri.is("parent_id", null);
    }

    if (opsi.kursor) kueri = kueri.lt("created_at", opsi.kursor);
    if (saringPencarian) kueri = kueri.or(saringPencarian);

    const { data, error } = await kueri.returns<BarisFeed[]>();
    if (error) throw error;

    baris = data ?? [];
    kursorBerikut =
      baris.length === batas ? baris[baris.length - 1].created_at : null;
  }

  const komentar = baris.map(keComment);
  const pengguna: Record<string, User> = {};
  for (const b of baris) {
    if (b.author) pengguna[b.author.id] = keUser(b.author);
  }

  await lengkapiKonteks(sb, komentar, pengguna);
  await tandaiInteraksi(sb, komentar, opsi.akunId);

  return {
    komentar,
    pengguna,
    kursor: kursorBerikut,
    habis: kursorBerikut === null,
  };
}

/** Mengisi handle penulis komentar induk untuk label "Membalas @…". */
async function lengkapiKonteks(
  sb: KlienSupabase,
  komentar: Comment[],
  pengguna: Record<string, User>,
) {
  const idInduk = [
    ...new Set(komentar.map((k) => k.parentId).filter((id): id is string => !!id)),
  ];
  if (idInduk.length === 0) return;

  const { data: induk } = await sb
    .from("comments")
    .select("id, author_id")
    .in("id", idInduk);
  if (!induk?.length) return;

  const penulisInduk = new Map(induk.map((b) => [b.id, b.author_id]));
  const belumDikenal = [
    ...new Set(induk.map((b) => b.author_id).filter((id) => !pengguna[id])),
  ];

  if (belumDikenal.length > 0) {
    const { data: profil } = await sb
      .from("profiles")
      .select(KOLOM_PROFIL)
      .in("id", belumDikenal)
      .returns<BarisProfil[]>();
    for (const b of profil ?? []) pengguna[b.id] = keUser(b);
  }

  for (const k of komentar) {
    if (!k.parentId) continue;
    const idPenulis = penulisInduk.get(k.parentId);
    k.parentHandle = idPenulis ? (pengguna[idPenulis]?.handle ?? null) : null;
  }
}

/** Menandai komentar mana yang sudah disukai, diulang, atau disimpan akun ini. */
async function tandaiInteraksi(
  sb: KlienSupabase,
  komentar: Comment[],
  akunId: string,
) {
  if (komentar.length === 0) return;
  const id = komentar.map((k) => k.id);

  const [suka, ulang, simpan] = await Promise.all([
    sb.from("likes").select("comment_id").eq("user_id", akunId).in("comment_id", id),
    sb.from("reposts").select("comment_id").eq("user_id", akunId).in("comment_id", id),
    sb.from("bookmarks").select("comment_id").eq("user_id", akunId).in("comment_id", id),
  ]);

  const disukai = new Set((suka.data ?? []).map((b) => b.comment_id));
  const diulang = new Set((ulang.data ?? []).map((b) => b.comment_id));
  const disimpan = new Set((simpan.data ?? []).map((b) => b.comment_id));

  for (const k of komentar) {
    k.liked = disukai.has(k.id);
    k.reposted = diulang.has(k.id);
    k.saved = disimpan.has(k.id);
  }
}

/** Mengambil satu komentar lengkap; dipakai saat komentar baru tiba lewat realtime. */
export async function ambilKomentar(
  sb: KlienSupabase,
  id: string,
  akunId: string,
): Promise<{ komentar: Comment; pengguna: Record<string, User> } | null> {
  const { data, error } = await sb
    .from("comments")
    .select(`${KOLOM_KOMENTAR}, author:profiles!comments_author_id_fkey ( ${KOLOM_PROFIL} )`)
    .eq("id", id)
    .maybeSingle<BarisFeed>();

  if (error || !data) return null;

  const komentar = keComment(data);
  const pengguna: Record<string, User> = {};
  if (data.author) pengguna[data.author.id] = keUser(data.author);

  await lengkapiKonteks(sb, [komentar], pengguna);
  await tandaiInteraksi(sb, [komentar], akunId);

  return { komentar, pengguna };
}

export async function ambilStatistik(
  sb: KlienSupabase,
  akunId: string,
): Promise<Statistik> {
  const { data, error } = await sb
    .rpc("statistik_pengguna", { pengguna: akunId })
    .returns<
      {
        komentar: number;
        balasan: number;
        disukai: number;
        suka_diterima: number;
        ulang_diterima: number;
      }[]
    >();

  if (error) throw error;
  const baris = data?.[0];

  return {
    komentar: Number(baris?.komentar ?? 0),
    balasan: Number(baris?.balasan ?? 0),
    disukai: Number(baris?.disukai ?? 0),
    sukaDiterima: Number(baris?.suka_diterima ?? 0),
    ulangDiterima: Number(baris?.ulang_diterima ?? 0),
  };
}

export type Utas = {
  /** rantai komentar di atasnya, urut dari yang paling awal */
  induk: Comment[];
  komentar: Comment;
  balasan: Comment[];
  pengguna: Record<string, User>;
};

/** Sedalam apa rantai "Membalas @…" ditelusuri ke atas di halaman utas. */
const DALAM_UTAS = 4;
const BATAS_BALASAN = 50;

/**
 * Satu komentar beserta konteksnya untuk halaman tautan tetap: rantai komentar
 * yang dibalasnya dan balasan yang sudah masuk. Mengembalikan null bila
 * komentarnya tidak ada — termasuk ketika umurnya sudah lewat 24 jam, karena
 * kebijakan RLS menyembunyikannya sama seperti dari feed.
 */
export async function ambilUtas(
  sb: KlienSupabase,
  id: string,
  akunId: string,
): Promise<Utas | null> {
  const pilih = `${KOLOM_KOMENTAR}, author:profiles!comments_author_id_fkey ( ${KOLOM_PROFIL} )`;

  const { data: pusat, error } = await sb
    .from("comments")
    .select(pilih)
    .eq("id", id)
    .maybeSingle<BarisFeed>();

  if (error) throw error;
  if (!pusat) return null;

  const induk: BarisFeed[] = [];
  let indukBerikut = pusat.parent_id;
  while (indukBerikut && induk.length < DALAM_UTAS) {
    const { data } = await sb
      .from("comments")
      .select(pilih)
      .eq("id", indukBerikut)
      .maybeSingle<BarisFeed>();
    if (!data) break;
    induk.unshift(data);
    indukBerikut = data.parent_id;
  }

  /* Balasan urut naik: percakapan dibaca dari atas ke bawah, tidak seperti
     beranda yang selalu menaruh yang terbaru di puncak. */
  const { data: balasan } = await sb
    .from("comments")
    .select(pilih)
    .eq("parent_id", id)
    .order("created_at", { ascending: true })
    .limit(BATAS_BALASAN)
    .returns<BarisFeed[]>();

  const baris = [...induk, pusat, ...(balasan ?? [])];
  const komentar = baris.map(keComment);
  const pengguna: Record<string, User> = {};
  for (const b of baris) {
    if (b.author) pengguna[b.author.id] = keUser(b.author);
  }

  await lengkapiKonteks(sb, komentar, pengguna);
  await tandaiInteraksi(sb, komentar, akunId);

  return {
    induk: komentar.slice(0, induk.length),
    komentar: komentar[induk.length],
    balasan: komentar.slice(induk.length + 1),
    pengguna,
  };
}

export async function ambilProfilHandle(
  sb: KlienSupabase,
  handle: string,
): Promise<User | null> {
  const { data, error } = await sb
    .from("profiles")
    .select(KOLOM_PROFIL)
    .ilike("handle", handle)
    .maybeSingle<BarisProfil>();

  if (error) throw error;
  return data ? keUser(data) : null;
}

/* ============================================================
   Notifikasi
   ============================================================ */

export const BATAS_NOTIFIKASI = 40;

type BarisNotifikasiFeed = BarisNotifikasi & {
  actor: BarisProfil | null;
  comment: { id: string; body: string } | null;
};

/** Sepotong isi komentar, cukup untuk satu baris daftar notifikasi. */
function kutip(isi: string, batas = 90) {
  const rapat = isi.replace(/\s+/g, " ").trim();
  return rapat.length > batas ? `${rapat.slice(0, batas - 1)}…` : rapat;
}

export async function ambilNotifikasi(
  sb: KlienSupabase,
  akunId: string,
): Promise<{ daftar: Notifikasi[]; pengguna: Record<string, User> }> {
  /* `comment` bisa pulang kosong walau `comment_id` terisi: komentarnya sudah
     lewat 24 jam dan tersembunyi oleh RLS, sementara barisnya baru dibuang
     penyapu berikutnya. Kabarnya tetap ditampilkan, hanya tanpa kutipan. */
  const { data, error } = await sb
    .from("notifications")
    .select(
      `id, user_id, actor_id, jenis, comment_id, created_at, dibaca_at,
       actor:profiles!notifications_actor_id_fkey ( ${KOLOM_PROFIL} ),
       comment:comments ( id, body )`,
    )
    .eq("user_id", akunId)
    .order("created_at", { ascending: false })
    .limit(BATAS_NOTIFIKASI)
    .returns<BarisNotifikasiFeed[]>();

  if (error) throw error;

  const pengguna: Record<string, User> = {};
  const daftar: Notifikasi[] = [];

  for (const baris of data ?? []) {
    if (baris.actor) pengguna[baris.actor.id] = keUser(baris.actor);
    daftar.push({
      id: baris.id,
      jenis: baris.jenis,
      aktorId: baris.actor_id,
      komentarId: baris.comment_id,
      kutipan: baris.comment ? kutip(baris.comment.body) : null,
      createdAt: new Date(baris.created_at).getTime(),
      dibaca: baris.dibaca_at !== null,
    });
  }

  return { daftar, pengguna };
}

export async function hitungBelumDibaca(
  sb: KlienSupabase,
  akunId: string,
): Promise<number> {
  const { count, error } = await sb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", akunId)
    .is("dibaca_at", null);

  if (error) throw error;
  return count ?? 0;
}

export async function tandaiNotifikasiDibaca(
  sb: KlienSupabase,
  akunId: string,
) {
  const { error } = await sb
    .from("notifications")
    .update({ dibaca_at: new Date().toISOString() })
    .eq("user_id", akunId)
    .is("dibaca_at", null);

  if (error) throw error;
}

/* ============================================================
   Tren
   ============================================================ */

export async function ambilTren(
  sb: KlienSupabase,
  batas = 6,
): Promise<Tren[]> {
  const { data, error } = await sb
    .rpc("tren_tagar", { batas })
    .returns<{ tagar: string; komentar: number; penulis: number }[]>();

  if (error) throw error;

  return (data ?? []).map((baris) => ({
    tagar: baris.tagar,
    komentar: Number(baris.komentar),
    penulis: Number(baris.penulis),
  }));
}

/* ============================================================
   Tulis
   ============================================================ */

export async function kirimKomentar(
  sb: KlienSupabase,
  akunId: string,
  teks: string,
  parentId: string | null,
): Promise<Comment> {
  const { data, error } = await sb
    .from("comments")
    .insert({ author_id: akunId, body: teks, parent_id: parentId })
    .select(KOLOM_KOMENTAR)
    .single<BarisKomentar>();

  if (error) throw error;
  return keComment(data);
}

export async function hapusKomentar(sb: KlienSupabase, id: string) {
  const { error } = await sb.from("comments").delete().eq("id", id);
  if (error) throw error;
}

export async function setSuka(
  sb: KlienSupabase,
  komentarId: string,
  akunId: string,
  suka: boolean,
) {
  const { error } = suka
    ? await sb.from("likes").insert({ comment_id: komentarId, user_id: akunId })
    : await sb
        .from("likes")
        .delete()
        .eq("comment_id", komentarId)
        .eq("user_id", akunId);

  // Menyukai dua kali dari dua tab tidak perlu dianggap kegagalan.
  if (error && error.code !== "23505") throw error;
}

export async function setUlang(
  sb: KlienSupabase,
  komentarId: string,
  akunId: string,
  ulang: boolean,
) {
  const { error } = ulang
    ? await sb.from("reposts").insert({ comment_id: komentarId, user_id: akunId })
    : await sb
        .from("reposts")
        .delete()
        .eq("comment_id", komentarId)
        .eq("user_id", akunId);

  if (error && error.code !== "23505") throw error;
}

export async function setSimpan(
  sb: KlienSupabase,
  komentarId: string,
  akunId: string,
  simpan: boolean,
) {
  const { error } = simpan
    ? await sb.from("bookmarks").insert({ comment_id: komentarId, user_id: akunId })
    : await sb
        .from("bookmarks")
        .delete()
        .eq("comment_id", komentarId)
        .eq("user_id", akunId);

  if (error && error.code !== "23505") throw error;
}

export async function setIkut(
  sb: KlienSupabase,
  akunId: string,
  targetId: string,
  ikut: boolean,
) {
  const { error } = ikut
    ? await sb
        .from("follows")
        .insert({ follower_id: akunId, following_id: targetId })
    : await sb
        .from("follows")
        .delete()
        .eq("follower_id", akunId)
        .eq("following_id", targetId);

  // Menekan "Ikuti" dua kali dari dua layar tidak perlu dianggap kegagalan.
  if (error && error.code !== "23505") throw error;
}

export async function apakahMengikuti(
  sb: KlienSupabase,
  akunId: string,
  targetId: string,
): Promise<boolean> {
  if (akunId === targetId) return false;

  const { data } = await sb
    .from("follows")
    .select("following_id")
    .eq("follower_id", akunId)
    .eq("following_id", targetId)
    .maybeSingle();

  return Boolean(data);
}

export type PerubahanProfil = {
  name: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  banner_url: string | null;
};

export async function simpanProfil(
  sb: KlienSupabase,
  akunId: string,
  perubahan: PerubahanProfil,
): Promise<User> {
  const { data, error } = await sb
    .from("profiles")
    .update(perubahan)
    .eq("id", akunId)
    .select(KOLOM_PROFIL)
    .single<BarisProfil>();

  if (error) throw error;
  return keUser(data);
}

/* ============================================================
   Penyimpanan berkas
   ============================================================ */

/** Mengubah URL publik kembali menjadi jalur objek di dalam bucket. */
function jalurDariAlamat(alamat: string, ember: string): string | null {
  const penanda = `/storage/v1/object/public/${ember}/`;
  const posisi = alamat.indexOf(penanda);
  if (posisi === -1) return null;
  return decodeURIComponent(alamat.slice(posisi + penanda.length).split("?")[0]);
}

export async function unggahMedia(
  sb: KlienSupabase,
  akunId: string,
  jenis: JenisMedia,
  gambar: Gambar,
): Promise<string> {
  const ember = EMBER[jenis];
  const jalur = `${akunId}/${Date.now()}.${gambar.ekstensi}`;

  const { error } = await sb.storage
    .from(ember)
    .upload(jalur, gambar.berkas, {
      contentType: gambar.berkas.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) throw error;
  return sb.storage.from(ember).getPublicUrl(jalur).data.publicUrl;
}

/** Membuang berkas lama setelah penggantian berhasil; kegagalan diabaikan. */
export async function hapusMedia(
  sb: KlienSupabase,
  jenis: JenisMedia,
  alamat: string | null,
) {
  if (!alamat) return;
  const ember = EMBER[jenis];
  const jalur = jalurDariAlamat(alamat, ember);
  if (!jalur) return;
  await sb.storage.from(ember).remove([jalur]);
}
