const MENIT = 60 * 1000;
const JAM = 60 * MENIT;
const HARI = 24 * JAM;

const BULAN = [
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
];

/** Waktu relatif ringkas ala linimasa: 12d, 8m, 5j, 3h, lalu tanggal. */
export function waktuRelatif(createdAt: number, now: number = Date.now()) {
  const selisih = Math.max(0, now - createdAt);

  if (selisih < MENIT) return `${Math.floor(selisih / 1000)}d`;
  if (selisih < JAM) return `${Math.floor(selisih / MENIT)}m`;
  if (selisih < HARI) return `${Math.floor(selisih / JAM)}j`;
  if (selisih < 7 * HARI) return `${Math.floor(selisih / HARI)}h`;

  const tanggal = new Date(createdAt);
  const hari = tanggal.getDate();
  const bulan = BULAN[tanggal.getMonth()];
  const tahun = tanggal.getFullYear();

  return tahun === new Date(now).getFullYear()
    ? `${hari} ${bulan}`
    : `${hari} ${bulan} ${tahun}`;
}

const BULAN_PANJANG = [
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
];

/** "Maret 2021" — dipakai pada baris "Bergabung …" di profil. */
export function bulanTahun(iso: string) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  return `${BULAN_PANJANG[t.getMonth()]} ${t.getFullYear()}`;
}

/** Label lengkap untuk atribut title/datetime. */
export function waktuLengkap(createdAt: number) {
  const t = new Date(createdAt);
  const jam = String(t.getHours()).padStart(2, "0");
  const menit = String(t.getMinutes()).padStart(2, "0");
  return `${jam}.${menit} · ${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
}

/** 1.2 rb / 3,4 jt — ringkasan angka ala penghitung interaksi. */
export function ringkasAngka(nilai: number) {
  if (nilai < 1000) return String(nilai);
  if (nilai < 1_000_000) {
    const ribu = nilai / 1000;
    return `${ribu < 10 ? ribu.toFixed(1).replace(".", ",") : Math.round(ribu)} rb`;
  }
  const juta = nilai / 1_000_000;
  return `${juta < 10 ? juta.toFixed(1).replace(".", ",") : Math.round(juta)} jt`;
}

/** Pemisah ribuan gaya Indonesia untuk angka pengikut. */
export function angkaPenuh(nilai: number) {
  return nilai.toLocaleString("id-ID");
}
