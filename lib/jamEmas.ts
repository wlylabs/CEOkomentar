/**
 * Jam emas audiens X/Twitter Indonesia.
 *
 * Kebiasaan membuka linimasa di Indonesia menumpuk di tiga waktu yang sama tiap
 * hari kerja: sebelum jam kantor, jeda makan siang, dan malam setelah pulang.
 * Angka di berkas ini menuliskan kebiasaan itu supaya antarmuka bisa mengatakan
 * kapan sebuah komentar paling mungkin terbaca banyak orang:
 *
 *   Pagi        07.00–10.00 (terkuat 08.00–09.30) — puncak tinggi
 *   Siang       12.00–14.00                       — cukup bagus
 *   Sore–Malam  19.00–21.30                       — puncak paling stabil dan lama
 *
 *   Hari terbaik : Selasa–Kamis
 *   Hari terlemah: Sabtu dan Minggu, terutama paginya
 *
 * Seluruh perhitungan memakai WIB, bukan jam perangkat: yang menentukan adalah
 * kapan orang Indonesia membuka ponselnya, bukan di zona mana penulisnya sedang
 * duduk. WIB tetap UTC+7 sepanjang tahun, jadi pergeserannya cukup ditambahkan
 * — tidak perlu tabel musim panas.
 */

const OFFSET_WIB_MS = 7 * 60 * 60 * 1000;

const SEHARI = 24 * 60;

export type KunciJendela = "pagi" | "siang" | "malam";

export type Jendela = {
  kunci: KunciJendela;
  /** menit dari tengah malam WIB */
  mulai: number;
  selesai: number;
  /** bagian terkuat di dalamnya; null bila seluruh jendela sama kuat */
  inti: readonly [number, number] | null;
};

const jam = (j: number, m = 0) => j * 60 + m;

export const JENDELA: readonly Jendela[] = [
  { kunci: "pagi", mulai: jam(7), selesai: jam(10), inti: [jam(8), jam(9, 30)] },
  { kunci: "siang", mulai: jam(12), selesai: jam(14), inti: null },
  { kunci: "malam", mulai: jam(19), selesai: jam(21, 30), inti: null },
];

/* Nilai puncak tiap jendela, 0–100, sebelum dikalikan bobot hari. Malam berada
   di atas pagi bukan karena lonjakannya lebih tinggi, melainkan karena ramainya
   bertahan paling lama — dua setengah jam penuh, bukan setengah jam terbaik
   yang dikepung jam berangkat kerja. */
const SKOR_JENDELA: Record<KunciJendela, number> = {
  pagi: 76,
  siang: 64,
  malam: 90,
};

const SKOR_INTI: Partial<Record<KunciJendela, number>> = { pagi: 88 };

/** Di luar ketiga jendela linimasa tidak mati, hanya jauh lebih sepi. */
function skorSepi(menit: number) {
  if (menit < jam(1)) return 24;
  if (menit < jam(5)) return 8;
  if (menit < jam(7)) return 28;
  if (menit < jam(12)) return 48;
  if (menit < jam(19)) return 44;
  return 38;
}

/* Selasa sampai Kamis adalah hari kerja yang benar-benar penuh: Senin masih
   membereskan akhir pekan, Jumat sudah menoleh ke sana. Sabtu dan Minggu
   turun paling jauh. Indeksnya mengikuti getDay(): 0 Minggu, 6 Sabtu. */
const BOBOT_HARI = [0.76, 0.94, 1, 1, 1, 0.9, 0.78];

/* Pagi akhir pekan adalah titik paling lemah sepanjang minggu — jam yang di
   hari kerja dipakai orang menunggu berangkat, di Sabtu dan Minggu dipakai
   tidur. Potongannya ditambahkan di atas bobot harinya. */
const BOBOT_PAGI_AKHIR_PEKAN = 0.78;

export type Tingkat = "puncak" | "tinggi" | "bagus" | "sedang" | "sepi";

const AMBANG: { batas: number; tingkat: Tingkat }[] = [
  { batas: 84, tingkat: "puncak" },
  { batas: 70, tingkat: "tinggi" },
  { batas: 55, tingkat: "bagus" },
  { batas: 34, tingkat: "sedang" },
];

export function tingkatDari(skor: number): Tingkat {
  return AMBANG.find(({ batas }) => skor >= batas)?.tingkat ?? "sepi";
}

export type PeringkatHari = "terbaik" | "biasa" | "lemah";

export function peringkatHari(hari: number): PeringkatHari {
  if (hari >= 2 && hari <= 4) return "terbaik";
  if (hari === 0 || hari === 6) return "lemah";
  return "biasa";
}

/** Jendela yang sedang berlangsung pada menit tertentu, bila ada. */
function jendelaPada(menit: number) {
  return JENDELA.find((j) => menit >= j.mulai && menit < j.selesai) ?? null;
}

function diInti(jendela: Jendela | null, menit: number) {
  if (!jendela?.inti) return false;
  return menit >= jendela.inti[0] && menit < jendela.inti[1];
}

/**
 * Potensi jangkauan pada satu titik waktu WIB, 0–100.
 *
 * Dipakai dua kali: untuk keadaan sekarang, dan untuk menggambar kurva 24 jam
 * di kartunya.
 */
export function skorPada(hari: number, menit: number) {
  const jendela = jendelaPada(menit);
  const dasar = jendela
    ? (diInti(jendela, menit) ? SKOR_INTI[jendela.kunci] : undefined) ??
      SKOR_JENDELA[jendela.kunci]
    : skorSepi(menit);

  const akhirPekan = hari === 0 || hari === 6;
  const bobot =
    BOBOT_HARI[hari] * (akhirPekan && menit < jam(12) ? BOBOT_PAGI_AKHIR_PEKAN : 1);

  return Math.max(0, Math.min(100, Math.round(dasar * bobot)));
}

export type WaktuWIB = {
  /** 0 Minggu sampai 6 Sabtu */
  hari: number;
  /** menit dari tengah malam */
  menit: number;
};

/** Waktu WIB dari epoch ms, apa pun zona waktu perangkatnya. */
export function keWIB(sekarang: number): WaktuWIB {
  const t = new Date(sekarang + OFFSET_WIB_MS);
  return {
    hari: t.getUTCDay(),
    menit: t.getUTCHours() * 60 + t.getUTCMinutes(),
  };
}

export type Isyarat = {
  waktu: WaktuWIB;
  /** potensi jangkauan sekarang, 0–100 */
  skor: number;
  tingkat: Tingkat;
  /** jendela yang sedang berlangsung; null berarti di luar jam emas */
  jendela: Jendela | null;
  /** sedang berada di bagian terkuat jendelanya */
  inti: boolean;
  /** sisa menit jendela yang sedang berlangsung; null bila di luar */
  sisa: number | null;
  /** jendela terdekat berikutnya beserta jaraknya dalam menit */
  berikut: Jendela;
  jarakBerikut: number;
  /** hari jendela berikutnya, dipakai untuk menyebut harinya bila besok */
  hariBerikut: number;
  peringkat: PeringkatHari;
  /** potensi tiap jam hari ini, 24 angka, untuk bilah kurva */
  kurva: number[];
};

/** Jendela terdekat setelah `menit`, melompat ke hari berikutnya bila perlu. */
function jendelaBerikut(hari: number, menit: number) {
  const hariIni = JENDELA.find((j) => j.mulai > menit);
  if (hariIni) {
    return { jendela: hariIni, jarak: hariIni.mulai - menit, hari };
  }
  const besok = JENDELA[0];
  return {
    jendela: besok,
    jarak: SEHARI - menit + besok.mulai,
    hari: (hari + 1) % 7,
  };
}

/**
 * Seluruh keterangan jam emas untuk satu titik waktu.
 *
 * Murni dari `sekarang`, tanpa menyentuh jam perangkat sendiri, supaya server
 * dan peramban selalu menghitung hal yang sama dari angka yang sama.
 */
export function isyaratJamEmas(sekarang: number): Isyarat {
  const waktu = keWIB(sekarang);
  const jendela = jendelaPada(waktu.menit);
  const berikut = jendelaBerikut(waktu.hari, waktu.menit);

  /* Tiap jam diwakili nilai terbaiknya, bukan nilai di menit ke-0: jam 09.00
     memuat setengah jam paling ramai sepanjang pagi, dan bilah yang membacanya
     dari menit pertama saja akan menyembunyikan itu. */
  const kurva = Array.from({ length: 24 }, (_, j) => {
    let tertinggi = 0;
    for (let m = 0; m < 60; m += 15) {
      tertinggi = Math.max(tertinggi, skorPada(waktu.hari, j * 60 + m));
    }
    return tertinggi;
  });

  const skor = skorPada(waktu.hari, waktu.menit);

  return {
    waktu,
    skor,
    tingkat: tingkatDari(skor),
    jendela,
    inti: diInti(jendela, waktu.menit),
    sisa: jendela ? jendela.selesai - waktu.menit : null,
    berikut: berikut.jendela,
    jarakBerikut: berikut.jarak,
    hariBerikut: berikut.hari,
    peringkat: peringkatHari(waktu.hari),
    kurva,
  };
}
