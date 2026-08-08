import { NextResponse, type NextRequest } from "next/server";
import { alamatPemanggil, ambilJatah } from "@/lib/keamanan/batas";
import { klienLayanan, layananSiap } from "@/lib/supabase/admin";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";

/**
 * Penyegaran daftar pengikut @CEOkomentar.
 *
 * Di sinilah misi "ikuti-x" mendapat jawabannya. X tidak lagi memberi aplikasi
 * self-serve akses ke daftar "mengikuti" siapa pun, jadi yang tahu siapa saja
 * pengikut akun resmi hanyalah pengelola akun itu sendiri — dan rute ini adalah
 * jalan ia menuliskannya.
 *
 * `POST` mengganti seluruh isinya sekaligus: nama yang tidak ikut terkirim
 * berarti sudah tidak mengikuti. Setiap penyegaran juga mengosongkan antrean
 * tinjauan, sehingga orang yang sudah menghubungkan akun X-nya mendapat
 * lencananya tanpa perlu menekan apa pun lagi.
 *
 * Hanya admin yang boleh memanggilnya, dan keadminannya ditanyakan kepada basis
 * data — bukan kepada kolom yang dikirim peramban.
 */

export const dynamic = "force-dynamic";

/** Sekitar sejuta karakter; jauh di atas daftar pengikut yang masuk akal. */
const BATAS_BADAN = 1_000_000;

/** Batas nama per penyegaran, supaya satu permintaan tidak menahan basis data. */
const BATAS_NAMA = 200_000;

const BENTUK_USERNAME = /^[A-Za-z0-9_]{1,15}$/;

type Jawaban = { jumlah: number; disegarkan_at: string | null };

function galat(pesan: string, status: number) {
  return NextResponse.json({ galat: pesan }, { status });
}

/**
 * Sesi yang sedang memanggil, bila ia admin.
 *
 * Mengembalikan `null` bila belum masuk atau bukan admin; keduanya dijawab 404
 * oleh pemanggilnya, karena rute ini tidak perlu memberi tahu siapa pun bahwa
 * ia ada.
 */
async function admin(): Promise<string | null> {
  const supabase = await klienServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.rpc("apakah_admin", {});
  return data === true ? user.id : null;
}

/**
 * Permintaan lintas asal ditolak sebelum apa pun dikerjakan.
 *
 * Rute ini bekerja dengan kuki sesi, jadi tanpa penjagaan ini sebuah halaman
 * lain bisa membuat peramban admin mengosongkan daftarnya. Header `Origin`
 * dikirim setiap peramban untuk permintaan tulis dan tidak bisa dikarang dari
 * skrip halaman.
 */
function seasal(permintaan: NextRequest): boolean {
  const asal = permintaan.headers.get("origin");
  if (!asal) return true;
  try {
    return new URL(asal).origin === permintaan.nextUrl.origin;
  } catch {
    return false;
  }
}

/** Berapa nama yang tercatat sekarang dan kapan terakhir disegarkan. */
export async function GET() {
  if (!supabaseSiap || !layananSiap) return galat("belum siap", 503);
  if (!(await admin())) return galat("tidak ditemukan", 404);

  const { data, error } = await klienLayanan()
    .from("pengikut_resmi_kabar")
    .select("jumlah, disegarkan_at")
    .eq("tunggal", true)
    .maybeSingle();

  if (error) return galat("gagal membaca", 500);

  const jawaban: Jawaban = {
    jumlah: data?.jumlah ?? 0,
    disegarkan_at: data?.disegarkan_at ?? null,
  };
  return NextResponse.json(jawaban);
}

/**
 * Mengganti daftarnya.
 *
 * Badannya JSON dengan salah satu dari dua bentuk — `daftar` berupa larik nama,
 * atau `teks` berupa tempelan mentah yang dipisah spasi, koma, dan baris baru.
 * Awalan `@` dilepas. Nama yang bentuknya bukan username X dibuang tanpa
 * membatalkan sisanya: satu baris kosong di ujung tempelan bukan alasan menolak
 * sepuluh ribu nama lainnya.
 *
 * `paksa` hanya diperlukan untuk mengosongkan daftar dengan sengaja.
 */
export async function POST(permintaan: NextRequest) {
  if (!supabaseSiap || !layananSiap) return galat("belum siap", 503);
  if (!seasal(permintaan)) return galat("asal tidak dikenal", 403);

  const pengelola = await admin();
  if (!pengelola) return galat("tidak ditemukan", 404);

  if (
    !ambilJatah(`pengikut:${pengelola}`, 12, 60 * 60_000) ||
    !ambilJatah(`pengikut-ip:${alamatPemanggil(permintaan)}`, 30, 60 * 60_000)
  ) {
    return galat("terlalu sering", 429);
  }

  const panjang = Number(permintaan.headers.get("content-length") ?? 0);
  if (panjang > BATAS_BADAN) return galat("badan terlalu besar", 413);

  let badan: unknown;
  try {
    badan = await permintaan.json();
  } catch {
    return galat("badan bukan JSON", 400);
  }

  if (typeof badan !== "object" || badan === null) {
    return galat("badan bukan objek", 400);
  }

  const isi = badan as { daftar?: unknown; teks?: unknown; paksa?: unknown };

  let mentah: string[];
  if (Array.isArray(isi.daftar)) {
    mentah = isi.daftar.filter(
      (nama): nama is string => typeof nama === "string",
    );
  } else if (typeof isi.teks === "string") {
    mentah = isi.teks.split(/[\s,;]+/);
  } else {
    return galat("kirim daftar[] atau teks", 400);
  }

  const nama = new Set<string>();
  for (const satu of mentah) {
    const bersih = satu.trim().replace(/^@+/, "");
    if (BENTUK_USERNAME.test(bersih)) nama.add(bersih);
    if (nama.size > BATAS_NAMA) return galat("terlalu banyak nama", 413);
  }

  const { data, error } = await klienLayanan().rpc("ganti_pengikut_resmi", {
    daftar: [...nama],
    paksa: isi.paksa === true,
  });

  if (error) {
    console.warn(`[misi/x] penyegaran daftar ditolak: ${error.message}`);
    /* Satu-satunya penolakan yang disengaja fungsi itu adalah daftar kosong
       tanpa `paksa`; kalimatnya diteruskan apa adanya karena yang membacanya
       adalah admin yang baru saja mengirimnya. */
    return galat(error.message, 400);
  }

  const jawaban: Jawaban = {
    jumlah: data ?? 0,
    disegarkan_at: new Date().toISOString(),
  };
  return NextResponse.json(jawaban);
}
