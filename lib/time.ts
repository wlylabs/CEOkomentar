import { LOKAL, type Bahasa } from "./i18n/bahasa";
import { teks } from "./i18n/kamus";

const MENIT = 60 * 1000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

const BULAN: Record<Bahasa, string[]> = {
  id: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

const BULAN_PANJANG: Record<Bahasa, string[]> = {
  id: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/* Nama bulan ditulis sendiri, tidak lewat Intl, supaya server dan peramban
   selalu menghasilkan teks yang sama persis dan hidrasi tidak pernah mengeluh. */

/** Waktu relatif ringkas ala linimasa: 12d, 8m, 5j, 3h, lalu tanggal. */
export function waktuRelatif(
  createdAt: number,
  now: number,
  bahasa: Bahasa,
) {
  const selisih = Math.max(0, now - createdAt);

  if (selisih < MENIT) {
    return teks(bahasa, "waktu.detik", { nilai: Math.floor(selisih / 1000) });
  }
  if (selisih < JAM) {
    return teks(bahasa, "waktu.menit", { nilai: Math.floor(selisih / MENIT) });
  }
  if (selisih < HARI) {
    return teks(bahasa, "waktu.jam", { nilai: Math.floor(selisih / JAM) });
  }
  if (selisih < 7 * HARI) {
    return teks(bahasa, "waktu.hari", { nilai: Math.floor(selisih / HARI) });
  }

  return tanggalPendek(new Date(createdAt), new Date(now).getFullYear(), bahasa);
}

/** "3 Agu" / "Aug 3", dengan tahun bila bukan tahun ini. */
function tanggalPendek(tanggal: Date, tahunIni: number, bahasa: Bahasa) {
  const hari = tanggal.getDate();
  const bulan = BULAN[bahasa][tanggal.getMonth()];
  const tahun = tanggal.getFullYear();
  const sertakanTahun = tahun !== tahunIni;

  if (bahasa === "en") {
    return sertakanTahun ? `${bulan} ${hari}, ${tahun}` : `${bulan} ${hari}`;
  }
  return sertakanTahun ? `${hari} ${bulan} ${tahun}` : `${hari} ${bulan}`;
}

/** "Maret 2021" — dipakai pada baris "Bergabung …" di profil. */
export function bulanTahun(iso: string, bahasa: Bahasa) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  return `${BULAN_PANJANG[bahasa][t.getMonth()]} ${t.getFullYear()}`;
}

/** Sisa umur komentar: "3j lagi", "12m left". null berarti sudah lewat. */
export function sisaWaktu(
  createdAt: number,
  masaMs: number,
  now: number,
  bahasa: Bahasa,
) {
  const sisa = createdAt + masaMs - now;
  if (sisa <= 0) return null;
  if (sisa < JAM) {
    return teks(bahasa, "waktu.sisaMenit", {
      nilai: Math.max(1, Math.floor(sisa / MENIT)),
    });
  }
  return teks(bahasa, "waktu.sisaJam", { nilai: Math.floor(sisa / JAM) });
}

/** "07.00" / "07:00" — jam dinding dari menit sejak tengah malam. */
export function jamMenit(menit: number, bahasa: Bahasa) {
  const utuh = ((Math.round(menit) % (24 * 60)) + 24 * 60) % (24 * 60);
  const jam = String(Math.floor(utuh / 60)).padStart(2, "0");
  const sisa = String(utuh % 60).padStart(2, "0");
  return `${jam}${bahasa === "en" ? ":" : "."}${sisa}`;
}

/** "3j 20m" / "3h 20m"; di bawah satu jam cukup menitnya saja. */
export function durasiSingkat(menit: number, bahasa: Bahasa) {
  const utuh = Math.max(0, Math.round(menit));
  const jam = Math.floor(utuh / 60);
  const sisa = utuh % 60;

  if (jam === 0) return teks(bahasa, "waktu.menit", { nilai: Math.max(1, sisa) });
  if (sisa === 0) return teks(bahasa, "waktu.jam", { nilai: jam });

  return `${teks(bahasa, "waktu.jam", { nilai: jam })} ${teks(bahasa, "waktu.menit", { nilai: sisa })}`;
}

/** Label lengkap untuk atribut title/datetime. */
export function waktuLengkap(createdAt: number, bahasa: Bahasa) {
  const t = new Date(createdAt);
  const jam = String(t.getHours()).padStart(2, "0");
  const menit = String(t.getMinutes()).padStart(2, "0");
  const pemisahJam = bahasa === "en" ? ":" : ".";
  const hari = t.getDate();
  const bulan = BULAN[bahasa][t.getMonth()];
  const tahun = t.getFullYear();

  return bahasa === "en"
    ? `${jam}${pemisahJam}${menit} · ${bulan} ${hari}, ${tahun}`
    : `${jam}${pemisahJam}${menit} · ${hari} ${bulan} ${tahun}`;
}

/** Pemisah ribuan sesuai bahasa; dipakai juga sebagai judul angka ringkas. */
export function angkaPenuh(nilai: number, bahasa: Bahasa) {
  return nilai.toLocaleString(LOKAL[bahasa]);
}

/**
 * Angka pecahan dengan pemisah desimal sesuai bahasa: "13,5" dan "13.5".
 *
 * Dipakai bobot sinyal di panduan — tiga di antaranya lebih kecil dari satu,
 * jadi angkanya tidak boleh dibulatkan seperti penghitung sosial.
 */
export function angkaDesimal(nilai: number, bahasa: Bahasa) {
  return nilai.toLocaleString(LOKAL[bahasa], { maximumFractionDigits: 3 });
}

const SATUAN_RINGKAS: Record<Bahasa, [number, string][]> = {
  id: [
    [1_000_000_000, " M"],
    [1_000_000, " jt"],
    [1_000, " rb"],
  ],
  en: [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ],
};

/**
 * Angka bergaya Twitter untuk seluruh penghitung sosial — suka, posting ulang,
 * tayangan, pengikut: utuh sampai 9.999, di atas itu disingkat satu angka
 * desimal. Desimalnya dipotong, bukan dibulatkan, supaya sebuah angka tak
 * pernah tampak lebih besar dari yang sebenarnya — 1.999.999 → "1,9 jt".
 * Desimal nol ikut hilang: 10.000 → "10 rb".
 */
export function angkaSosial(nilai: number, bahasa: Bahasa) {
  if (nilai < 10_000) return angkaPenuh(nilai, bahasa);

  for (const [ambang, akhiran] of SATUAN_RINGKAS[bahasa]) {
    if (nilai < ambang) continue;

    const dipotong = Math.floor((nilai / ambang) * 10) / 10;
    const angka = Number.isInteger(dipotong)
      ? String(dipotong)
      : bahasa === "id"
        ? dipotong.toFixed(1).replace(".", ",")
        : dipotong.toFixed(1);

    return `${angka}${akhiran}`;
  }

  return angkaPenuh(nilai, bahasa);
}
