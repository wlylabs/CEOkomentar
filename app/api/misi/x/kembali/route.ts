import { NextResponse, type NextRequest } from "next/server";
import { alamatPemanggil, ambilJatah } from "@/lib/keamanan/batas";
import { AKUN_X, type HasilMisi } from "@/lib/misi";
import { klienLayanan, layananSiap } from "@/lib/supabase/admin";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";
import {
  akunLewatUsername,
  akunSaya,
  apakahMengikutiX,
  cabutToken,
  samaAman,
  tukarKode,
  xSiap,
} from "@/lib/x/oauth";
import {
  alamatKembali,
  bersihkanKuki,
  https,
  namaState,
  namaVerifier,
  pulang,
} from "@/lib/x/alur";

export const dynamic = "force-dynamic";

/**
 * Langkah kedua: X memulangkan pemakai ke sini.
 *
 * Urutannya sengaja begini — state dulu, sesi kedua, baru X ditanya — supaya
 * permintaan yang tidak berasal dari alur kita berhenti sebelum satu pun
 * panggilan keluar dilakukan.
 *
 * Lencananya diberikan lewat `selesaikan_misi_x()`, satu-satunya jalan menulis
 * ke tabel lencana, dan hanya `service_role` yang boleh memanggilnya. Peramban
 * sama sekali tidak ikut menentukan hasilnya: ia cuma membaca kata di query
 * string dan menampilkan kalimatnya.
 */
export async function GET(permintaan: NextRequest) {
  const aman = https(permintaan);

  /* Kuki alur selalu dibuang, apa pun hasilnya: sekali pakai, sekali umur. */
  const selesai = (hasil: HasilMisi) => {
    const tanggapan = pulang(permintaan, hasil);
    bersihkanKuki(tanggapan, aman);
    return tanggapan;
  };

  if (!supabaseSiap || !xSiap || !layananSiap) return selesai("belumSiap");

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
    if (!saya) return selesai("gagal");

    const target = await akunLewatUsername(token, AKUN_X);
    if (!target) return selesai("gagal");

    /* Akun resmi tidak perlu mengikuti dirinya sendiri; X pun tidak
       mengizinkannya, jadi pertanyaannya tidak akan pernah dijawab "ya". */
    const mengikuti =
      saya.id === target.id
        ? true
        : await apakahMengikutiX(token, saya.id, target.id);

    if (mengikuti === null) return selesai("gagal");

    const layanan = klienLayanan();

    if (!mengikuti) {
      /*
       * Lencana yang sudah diberikan tidak boleh bertahan setelah akun yang
       * jadi buktinya berhenti mengikuti. Pencabutan hanya berlaku bila akun X
       * yang baru saja masuk memang akun yang dulu terikat — kalau bukan, yang
       * terjadi cuma pemeriksaan dari akun X orang lain, dan itu tidak boleh
       * bisa mencabut lencana siapa pun.
       */
      const [{ data: ikatan }, { data: kemajuan }] = await Promise.all([
        layanan
          .from("akun_x")
          .select("x_user_id")
          .eq("user_id", user.id)
          .maybeSingle(),
        layanan
          .from("misi_pengguna")
          .select("status")
          .eq("user_id", user.id)
          .eq("misi", "ikuti-x")
          .maybeSingle(),
      ]);

      if (kemajuan?.status === "selesai" && ikatan?.x_user_id === saya.id) {
        const { error } = await layanan.rpc("batalkan_misi", {
          pengguna: user.id,
          kode_misi: "ikuti-x",
        });
        if (!error) return selesai("dicabut");
      }

      return selesai("belumIkut");
    }

    const { data: hasil, error } = await layanan.rpc("selesaikan_misi_x", {
      pengguna: user.id,
      x_id: saya.id,
      x_username: saya.username,
    });

    if (error) return selesai("gagal");
    if (hasil === "terpakai") return selesai("terpakai");
    if (hasil === "lain") return selesai("lain");
    if (hasil === "sudah") return selesai("sudah");

    return selesai("berhasil");
  } finally {
    /* Izin yang sudah tidak diperlukan tidak dibiarkan menganggur di akun
       pemakai; ia dicabut sebelum jawaban ini meninggalkan server. */
    await cabutToken(token);
  }
}
