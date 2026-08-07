/** Ukuran keluaran per jenis media profil. */
const UKURAN = {
  avatar: { lebar: 400, tinggi: 400 },
  sampul: { lebar: 1500, tinggi: 500 },
} as const;

export type JenisMedia = keyof typeof UKURAN;

/** Batas ukuran berkas yang diterima sebelum diproses. */
const BATAS_BYTE = 8 * 1024 * 1024;

/** Batas hasil unggahan; sama dengan `file_size_limit` bucket di Supabase. */
const BATAS_HASIL = 5 * 1024 * 1024;

export class GalatFoto extends Error {}

export type Gambar = {
  /** berkas siap unggah ke Supabase Storage */
  berkas: Blob;
  /** ekstensi yang cocok dengan tipe blob, mis. "webp" */
  ekstensi: string;
  /** object URL untuk pratinjau; panggil bebaskanPratinjau bila tidak dipakai */
  pratinjau: string;
};

export function bebaskanPratinjau(alamat: string | null) {
  if (alamat?.startsWith("blob:")) URL.revokeObjectURL(alamat);
}

function muatGambar(berkas: File) {
  return new Promise<{ gambar: HTMLImageElement; bebaskan: () => void }>(
    (selesai, gagal) => {
      const alamat = URL.createObjectURL(berkas);
      const gambar = new Image();
      const bebaskan = () => URL.revokeObjectURL(alamat);

      gambar.onload = () => selesai({ gambar, bebaskan });
      gambar.onerror = () => {
        bebaskan();
        gagal(new GalatFoto("Gambar tidak dapat dibaca."));
      };
      gambar.src = alamat;
    },
  );
}

function keBlob(kanvas: HTMLCanvasElement, tipe: string, mutu: number) {
  return new Promise<Blob | null>((selesai) =>
    kanvas.toBlob(selesai, tipe, mutu),
  );
}

/**
 * Memangkas gambar dari bagian tengah sesuai rasio yang diminta, mengecilkannya
 * ke ukuran baku, lalu mengubahnya menjadi blob WebP (jatuh ke JPEG bila
 * peramban tidak mendukung WebP). Seluruh proses terjadi di peramban sehingga
 * berkas asli yang besar tidak pernah dikirim ke server.
 */
export async function siapkanGambar(
  berkas: File,
  jenis: JenisMedia,
): Promise<Gambar> {
  if (!berkas.type.startsWith("image/")) {
    throw new GalatFoto("Berkas yang dipilih bukan gambar.");
  }
  if (berkas.size > BATAS_BYTE) {
    throw new GalatFoto("Ukuran gambar maksimal 8 MB.");
  }

  const { gambar, bebaskan } = await muatGambar(berkas);

  try {
    const lebarAsli = gambar.naturalWidth;
    const tinggiAsli = gambar.naturalHeight;
    if (!lebarAsli || !tinggiAsli) {
      throw new GalatFoto("Gambar tidak dapat dibaca.");
    }

    const { lebar: lebarBaku, tinggi: tinggiBaku } = UKURAN[jenis];
    const rasio = lebarBaku / tinggiBaku;

    // Kotak pangkas terbesar dengan rasio yang diminta, diambil dari tengah.
    let lebarSumber = lebarAsli;
    let tinggiSumber = Math.round(lebarAsli / rasio);
    if (tinggiSumber > tinggiAsli) {
      tinggiSumber = tinggiAsli;
      lebarSumber = Math.round(tinggiAsli * rasio);
    }
    const geserX = Math.round((lebarAsli - lebarSumber) / 2);
    const geserY = Math.round((tinggiAsli - tinggiSumber) / 2);

    // Jangan pernah memperbesar: gambar kecil tetap dipakai apa adanya.
    const skala = Math.min(1, lebarBaku / lebarSumber);
    const lebarHasil = Math.max(1, Math.round(lebarSumber * skala));
    const tinggiHasil = Math.max(1, Math.round(tinggiSumber * skala));

    const kanvas = document.createElement("canvas");
    kanvas.width = lebarHasil;
    kanvas.height = tinggiHasil;

    const konteks = kanvas.getContext("2d");
    if (!konteks) {
      throw new GalatFoto("Peramban tidak mendukung pemrosesan gambar.");
    }

    konteks.imageSmoothingQuality = "high";
    konteks.drawImage(
      gambar,
      geserX,
      geserY,
      lebarSumber,
      tinggiSumber,
      0,
      0,
      lebarHasil,
      tinggiHasil,
    );

    const hasil =
      (await keBlob(kanvas, "image/webp", 0.9)) ??
      (await keBlob(kanvas, "image/jpeg", 0.88));

    if (!hasil) {
      throw new GalatFoto("Gambar gagal diproses. Coba gambar lain.");
    }
    if (hasil.size > BATAS_HASIL) {
      throw new GalatFoto("Hasil olahan masih terlalu besar. Coba gambar lain.");
    }

    return {
      berkas: hasil,
      ekstensi: hasil.type === "image/jpeg" ? "jpg" : "webp",
      pratinjau: URL.createObjectURL(hasil),
    };
  } finally {
    bebaskan();
  }
}
