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
 *
 * Angka-angka di atas adalah dugaan awal, bukan kata akhir. Bila tabel
 * `jam_emas_agregat` sudah punya isi — hasil komentar yang benar-benar ditulis
 * di aplikasi ini, dikumpulkan penyapu kedaluwarsa — keduanya dicampur, dengan
 * bobot yang naik seiring banyaknya sampel. Lihat `campur` di bawah.
 */

/** Pergeseran WIB dari UTC. Dipakai juga jam dinding di `lib/jam.ts`. */
export const OFFSET_WIB_MS = 7 * 60 * 60 * 1000;

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

const batasi = (nilai: number) => Math.max(0, Math.min(100, Math.round(nilai)));

/**
 * Potensi jangkauan menurut pola bawaan, 0–100.
 *
 * Ini dugaan yang selalu tersedia: tidak butuh basis data, tidak butuh satu pun
 * komentar pernah ditulis, dan hasilnya sama di server maupun peramban.
 */
function skorPola(hari: number, menit: number) {
  const jendela = jendelaPada(menit);
  const dasar = jendela
    ? (diInti(jendela, menit) ? SKOR_INTI[jendela.kunci] : undefined) ??
      SKOR_JENDELA[jendela.kunci]
    : skorSepi(menit);

  const akhirPekan = hari === 0 || hari === 6;
  const bobot =
    BOBOT_HARI[hari] * (akhirPekan && menit < jam(12) ? BOBOT_PAGI_AKHIR_PEKAN : 1);

  return batasi(dasar * bobot);
}

/* ============================================================
   Agregat: pola yang dikoreksi kenyataan
   ============================================================ */

const BIN = 7 * 24;

/** Satu potongan jam dalam sepekan, apa adanya dari `jam_emas_agregat`. */
export type BinAgregat = {
  /** 0 Minggu sampai 6 Sabtu */
  hari: number;
  /** jam WIB, 0–23 */
  jam: number;
  komentar: number;
  suka: number;
  ulang: number;
};

/**
 * Bentuk siap pakai dari agregat: satu skor dan satu bobot untuk tiap potongan
 * jam sepekan, keduanya berindeks `hari * 24 + jam`.
 */
export type Agregat = {
  /** potensi terukur potongan itu, 0–100 */
  skor: number[];
  /** seberapa jauh angka terukurnya boleh dipercaya, 0–1 */
  bobot: number[];
  /** banyaknya komentar yang menjadi dasarnya */
  sampel: number[];
};

/* Posting ulang membawa sebuah komentar ke linimasa orang lain, sedangkan suka
   berhenti di tempatnya. Karena yang diukur di sini jangkauan — bukan
   kesukaan — satu posting ulang dihitung dua suka. */
const BOBOT_ULANG = 2;

/* Berapa banyak komentar yang harus terkumpul di sebuah potongan jam sebelum
   angka terukurnya menyamai pola bawaan. Di bawah itu polanya yang lebih
   berbicara; di atasnya, kenyataan. Tiga puluh cukup untuk meredam satu
   komentar yang kebetulan meledak, dan cukup kecil untuk tercapai dalam
   hitungan minggu, bukan tahun. */
const AMBANG_PERCAYA = 30;

/* Tinggi rata-rata pola sepanjang sepekan, dipakai sebagai titik temu kedua
   skala. Keterlibatan rata-rata dipetakan ke angka ini, sehingga potongan jam
   yang biasa-biasa saja bernilai sama entah datang dari pola atau dari
   pengukuran — dan campurannya tidak pernah melompat. Dihitung dari polanya
   sendiri supaya tetap benar bila angka di atas diubah. */
const SKOR_RUJUKAN = (() => {
  let jumlah = 0;
  let banyak = 0;
  for (let hari = 0; hari < 7; hari += 1) {
    for (let menit = 0; menit < SEHARI; menit += 15) {
      jumlah += skorPola(hari, menit);
      banyak += 1;
    }
  }
  return jumlah / banyak;
})();

/**
 * Mengubah baris mentah `jam_emas_agregat` menjadi bentuk yang bisa dicampur.
 *
 * Mengembalikan null bila belum ada apa pun yang layak diukur — aplikasi yang
 * baru dipasang, atau yang komentarnya belum pernah disukai sekali pun. Dalam
 * keadaan itu kartunya berjalan dengan pola bawaan saja, persis seperti
 * sebelum agregat ini ada.
 */
export function siapkanAgregat(baris: readonly BinAgregat[]): Agregat | null {
  const skor = new Array<number>(BIN).fill(0);
  const bobot = new Array<number>(BIN).fill(0);
  const sampel = new Array<number>(BIN).fill(0);

  /* Keterlibatan per komentar di tiap potongan jam, beserta seberapa jauh
     angka itu boleh dipercaya. */
  const keterlibatan = new Array<number>(BIN).fill(0);

  for (const b of baris) {
    if (b.komentar <= 0) continue;
    if (b.hari < 0 || b.hari > 6 || b.jam < 0 || b.jam > 23) continue;

    const i = b.hari * 24 + b.jam;
    keterlibatan[i] = (b.suka + BOBOT_ULANG * b.ulang) / b.komentar;
    bobot[i] = b.komentar / (b.komentar + AMBANG_PERCAYA);
    sampel[i] = b.komentar;
  }

  /* Tolok ukurnya: keterlibatan sebuah potongan jam yang biasa-biasa saja.
     Rata-ratanya ditimbang kepercayaan tiap potongan, bukan jumlah komentarnya
     — kalau ditimbang volume, satu jam yang kebetulan paling ramai ditulisi
     akan menarik tolok ukurnya ke dirinya sendiri, dan justru jam itu lalu
     terbaca biasa saja. Yang dibandingkan di sini jam dengan jam, jadi
     seberapa banyak orang menulis pada jam tertentu tidak boleh ikut
     menggeser mistarnya. */
  let jumlah = 0;
  let pembagi = 0;
  for (let i = 0; i < BIN; i += 1) {
    jumlah += bobot[i] * keterlibatan[i];
    pembagi += bobot[i];
  }

  /* Belum ada apa pun yang layak diukur: aplikasi yang baru dipasang, atau
     yang komentarnya belum pernah disukai sekali pun. Membaginya hanya
     menghasilkan NaN, dan pola bawaan memang sudah cukup. */
  if (pembagi === 0 || jumlah === 0) return null;

  const rujukan = jumlah / pembagi;

  for (let i = 0; i < BIN; i += 1) {
    if (bobot[i] === 0) continue;
    skor[i] = batasi((keterlibatan[i] / rujukan) * SKOR_RUJUKAN);
  }

  return { skor, bobot, sampel };
}

/**
 * Potensi jangkauan pada satu titik waktu WIB, 0–100.
 *
 * Dipakai dua kali: untuk keadaan sekarang, dan untuk menggambar kurva 24 jam
 * di kartunya.
 *
 * Agregatnya boleh tidak ada, dan itu keadaan yang normal — bukan kegagalan.
 * Kalaupun ada, ia hanya menggeser polanya sejauh sampelnya membenarkan:
 * potongan jam yang baru berisi tiga komentar nyaris tidak menggeser apa pun,
 * sedangkan yang sudah ratusan hampir sepenuhnya menggantikan tebakannya.
 *
 * Yang dicampur adalah nilai akhirnya, setelah bobot hari dikenakan pada pola.
 * Angka terukur sudah membawa pengaruh harinya sendiri — ia memang dikumpulkan
 * per hari — jadi mencampurnya lebih awal berarti menghitung hari dua kali.
 */
export function skorPada(hari: number, menit: number, agregat?: Agregat | null) {
  const pola = skorPola(hari, menit);
  if (!agregat) return pola;

  const i = hari * 24 + Math.floor(menit / 60);
  const bobot = agregat.bobot[i] ?? 0;
  if (bobot <= 0) return pola;

  return batasi(bobot * agregat.skor[i] + (1 - bobot) * pola);
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

/**
 * Tanggal WIB dalam bentuk `YYYY-MM-DD`.
 *
 * Dipakai sebagai kunci harian oleh rencana di panduan, dan sengaja memakai WIB
 * seperti seluruh berkas ini: daftar hari ini berganti bersama tengah malam
 * audiensnya, bukan bersama tengah malam di zona waktu perangkat.
 */
export function tanggalWIB(sekarang: number): string {
  return new Date(sekarang + OFFSET_WIB_MS).toISOString().slice(0, 10);
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
  /** banyaknya komentar terukur yang ikut menentukan skor jam ini; 0 berarti
      angkanya murni pola bawaan */
  sampel: number;
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
 * Murni dari `sekarang` dan `agregat`, tanpa menyentuh jam perangkat sendiri,
 * supaya server dan peramban selalu menghitung hal yang sama dari angka yang
 * sama.
 */
export function isyaratJamEmas(
  sekarang: number,
  agregat?: Agregat | null,
): Isyarat {
  const waktu = keWIB(sekarang);
  const jendela = jendelaPada(waktu.menit);
  const berikut = jendelaBerikut(waktu.hari, waktu.menit);

  /* Tiap jam diwakili nilai terbaiknya, bukan nilai di menit ke-0: jam 09.00
     memuat setengah jam paling ramai sepanjang pagi, dan bilah yang membacanya
     dari menit pertama saja akan menyembunyikan itu. */
  const kurva = Array.from({ length: 24 }, (_, j) => {
    let tertinggi = 0;
    for (let m = 0; m < 60; m += 15) {
      tertinggi = Math.max(tertinggi, skorPada(waktu.hari, j * 60 + m, agregat));
    }
    return tertinggi;
  });

  const skor = skorPada(waktu.hari, waktu.menit, agregat);

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
    sampel: agregat?.sampel[waktu.hari * 24 + Math.floor(waktu.menit / 60)] ?? 0,
  };
}
