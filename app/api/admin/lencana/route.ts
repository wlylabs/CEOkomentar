import { NextResponse, type NextRequest } from "next/server";
import { alamatPemanggil, ambilJatah } from "@/lib/keamanan/batas";
import { bacaLencana, dapatDiatur, lencanaDikenal } from "@/lib/lencana";
import { klienLayanan, layananSiap } from "@/lib/supabase/admin";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";

/**
 * Lencana yang diberikan dan dicabut admin.
 *
 * Sejak alur "Hubungkan X & verifikasi" dihapus, inilah satu-satunya jalan
 * sebuah lencana berpindah tangan. Yang memutuskan seorang manusia: pemakai
 * memposting klaimnya beserta tautan profil X di beranda, admin mencocokkannya
 * dengan daftar pengikut akun resmi di X, lalu menekan tombolnya di kartu
 * profil pengaju.
 *
 * Keadminan ditanyakan kepada basis data, bukan kepada apa pun yang dikirim
 * peramban, dan penulisannya tetap lewat fungsi `service_role` yang sama.
 */

export const dynamic = "force-dynamic";

/** Cukup besar untuk badan `{ pengguna, lencana, beri }` dan tidak lebih. */
const BATAS_BADAN = 4_096;

const BENTUK_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
 * Permintaan lintas asal ditolak sebelum apa pun dikerjakan: rute ini bekerja
 * dengan kuki sesi, jadi tanpa penjagaan ini sebuah halaman lain bisa membuat
 * peramban admin membagikan lencana atas namanya.
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

export async function POST(permintaan: NextRequest) {
  if (!supabaseSiap || !layananSiap) return galat("belum siap", 503);
  if (!seasal(permintaan)) return galat("asal tidak dikenal", 403);

  const pengelola = await admin();
  if (!pengelola) return galat("tidak ditemukan", 404);

  if (
    !ambilJatah(`lencana:${pengelola}`, 120, 60 * 60_000) ||
    !ambilJatah(`lencana-ip:${alamatPemanggil(permintaan)}`, 240, 60 * 60_000)
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

  const isi = badan as {
    pengguna?: unknown;
    lencana?: unknown;
    beri?: unknown;
  };

  if (typeof isi.pengguna !== "string" || !BENTUK_UUID.test(isi.pengguna)) {
    return galat("pengguna tidak sah", 400);
  }
  if (typeof isi.lencana !== "string" || !lencanaDikenal(isi.lencana)) {
    return galat("lencana tidak dikenal", 400);
  }
  if (typeof isi.beri !== "boolean") {
    return galat("beri harus true atau false", 400);
  }

  /* Lencana peran ditolak di sini juga, bukan hanya di basis data: yang
     menekan tombolnya berhak mendapat kalimat yang bisa dibaca, bukan pesan
     galat PostgreSQL. */
  if (!dapatDiatur(isi.lencana)) {
    return galat("lencana itu mengikuti peran, bukan pemberian", 409);
  }

  const { data, error } = await klienLayanan().rpc("atur_lencana_admin", {
    sasaran: isi.pengguna,
    kode_lencana: isi.lencana,
    beri: isi.beri,
  });

  if (error) {
    console.warn(`[admin/lencana] ditolak: ${error.message}`);
    return galat("gagal menyimpan", 400);
  }

  /* Daftar sesudah perubahannya, supaya kartu profil yang memanggil tidak perlu
     menebak hasilnya sendiri. */
  return NextResponse.json({ lencana: bacaLencana(data) });
}
