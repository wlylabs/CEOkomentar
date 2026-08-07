/** Sisi foto profil setelah dipangkas, dalam piksel. */
const SISI = 400;

/** Batas ukuran berkas yang diterima sebelum diproses. */
const BATAS_BYTE = 8 * 1024 * 1024;

export class GalatFoto extends Error {}

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

/**
 * Membaca berkas gambar, memangkasnya menjadi persegi dari bagian tengah, lalu
 * mengecilkannya ke ukuran avatar. Hasilnya data URL yang siap dipakai di <img>.
 */
export async function siapkanFotoProfil(berkas: File): Promise<string> {
  if (!berkas.type.startsWith("image/")) {
    throw new GalatFoto("Berkas yang dipilih bukan gambar.");
  }
  if (berkas.size > BATAS_BYTE) {
    throw new GalatFoto("Ukuran gambar maksimal 8 MB.");
  }

  const { gambar, bebaskan } = await muatGambar(berkas);

  try {
    const lebar = gambar.naturalWidth;
    const tinggi = gambar.naturalHeight;
    if (!lebar || !tinggi) {
      throw new GalatFoto("Gambar tidak dapat dibaca.");
    }

    // Pangkas persegi dari tengah, lalu skalakan ke SISI x SISI.
    const sisiSumber = Math.min(lebar, tinggi);
    const geserX = (lebar - sisiSumber) / 2;
    const geserY = (tinggi - sisiSumber) / 2;
    const sisiHasil = Math.min(SISI, sisiSumber);

    const kanvas = document.createElement("canvas");
    kanvas.width = sisiHasil;
    kanvas.height = sisiHasil;

    const konteks = kanvas.getContext("2d");
    if (!konteks) {
      throw new GalatFoto("Peramban tidak mendukung pemrosesan gambar.");
    }

    konteks.imageSmoothingQuality = "high";
    konteks.drawImage(
      gambar,
      geserX,
      geserY,
      sisiSumber,
      sisiSumber,
      0,
      0,
      sisiHasil,
      sisiHasil,
    );

    // toDataURL jatuh ke PNG bila webp tidak didukung, jadi transparansi tetap aman.
    return kanvas.toDataURL("image/webp", 0.9);
  } finally {
    bebaskan();
  }
}
