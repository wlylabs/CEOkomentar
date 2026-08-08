import { NextResponse, type NextRequest } from "next/server";
import { alamatPemanggil, ambilJatah } from "@/lib/keamanan/batas";
import { bacaHasil, type HasilMisi } from "@/lib/misi";
import { klienLayanan, layananSiap } from "@/lib/supabase/admin";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";
import {
  akunSaya,
  cabutToken,
  samaAman,
  tukarKode,
  xSiap,
  type SebabGagalX,
} from "@/lib/x/oauth";
import {
  alamatKembali,
  bersihkanKuki,
  https,
  laporBelumSiap,
  namaState,
  namaVerifier,
  pulang,
} from "@/lib/x/alur";

export const dynamic = "force-dynamic";

/** Kegagalan di sisi X diterjemahkan menjadi kabar yang bisa ditindaklanjuti. */
const KABAR_GAGAL: Record<SebabGagalX, HasilMisi> = {
  akses: "takTersedia",
  rem: "terlaluSering",
  putus: "gagal",
};

/**
 * Langkah kedua: X memulangkan pemakai ke sini.
 *
 * Urutannya sengaja begini — state dulu, sesi kedua, baru X ditanya — supaya
 * permintaan yang tidak berasal dari alur kita berhenti sebelum satu pun
 * panggilan keluar dilakukan.
 *
 * X hanya ditanyai satu hal: siapa pemilik token ini. Pertanyaan "apakah ia
 * mengikuti akun resmi" dijawab `periksa_misi_x()` dari daftar pengikut yang
 * disegarkan pengelola — satu-satunya jalan menulis ke tabel lencana, dan hanya
 * `service_role` yang boleh memanggilnya. Peramban sama sekali tidak ikut
 * menentukan hasilnya: ia cuma membaca kata di query string dan menampilkan
 * kalimatnya.
 */
export async function GET(permintaan: NextRequest) {
  const aman = https(permintaan);

  /* Kuki alur selalu dibuang, apa pun hasilnya: sekali pakai, sekali umur. */
  const selesai = (hasil: HasilMisi) => {
    const tanggapan = pulang(permintaan, hasil);
    bersihkanKuki(tanggapan, aman);
    return tanggapan;
  };

  if (!supabaseSiap || !xSiap || !layananSiap) {
    return selesai(laporBelumSiap());
  }

  const kueri = permintaan.nextUrl.searchParams;

  /* "Cancel" di halaman izin X memulangkan error=access_denied. */
  if (kueri.get("error")) return selesai("ditolak");

  const kode = kueri.get("code");
  const state = kueri.get("state");
  const stateTitipan = permintaan.cookies.get(namaState(aman))?.value;
  const verifier = permintaan.cookies.get(namaVerifier(aman))?.value;

  if (!kode || !state || !stateTitipan || !verifier) return selesai("gagal");
  if (!samaAman(state, stateTitipan)) return selesai("gagal");

  const supabase = await klienServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const tanggapan = NextResponse.redirect(
      new URL("/", permintaan.nextUrl.origin),
    );
    bersihkanKuki(tanggapan, aman);
    return tanggapan;
  }

  if (
    !ambilJatah(`x-kembali:${user.id}`, 8, 10 * 60_000) ||
    !ambilJatah(`x-kembali-ip:${alamatPemanggil(permintaan)}`, 30, 10 * 60_000)
  ) {
    return selesai("terlaluSering");
  }

  const token = await tukarKode(kode, verifier, alamatKembali(permintaan));
  if (!token) return selesai("gagal");

  try {
    const saya = await akunSaya(token);
    if (!saya.ok) return selesai(KABAR_GAGAL[saya.sebab]);

    /*
     * Seluruh keputusan ada di dalam satu fungsi basis data: ikatan akun X,
     * pencocokan ke daftar pengikut, antrean tinjauan, dan pencabutan. Ditulis
     * begitu supaya tidak ada urutan langkah yang bisa berbeda antara sini dan
     * penyegaran daftar — keduanya memanggil `selesaikan_misi()` yang sama.
     */
    const { data: hasil, error } = await klienLayanan().rpc("periksa_misi_x", {
      pengguna: user.id,
      x_id: saya.nilai.id,
      x_username: saya.nilai.username,
    });

    if (error) {
      console.warn(`[misi/x] periksa_misi_x gagal: ${error.message}`);
      return selesai("gagal");
    }

    /* Kata yang dipulangkan basis data adalah kata yang sama yang dikenal
       antarmuka; yang tidak dikenal berarti skemanya lebih baru dari kode ini. */
    return selesai(bacaHasil(hasil) ?? "gagal");
  } finally {
    /* Izin yang sudah tidak diperlukan tidak dibiarkan menganggur di akun
       pemakai; ia dicabut sebelum jawaban ini meninggalkan server. */
    await cabutToken(token);
  }
}
