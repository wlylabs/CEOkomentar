/**
 * Tema terang/gelap: satu sumber kebenaran untuk skrip di `<head>`, tombol
 * pengalih, dan warna bilah status peramban.
 *
 * Tema yang berlaku tinggal di DOM, bukan di state React. SKRIP_TEMA
 * memasangnya sebelum lukisan pertama, CSS membaca `data-tema` di `<html>`, dan
 * modul ini yang menulis ulang ketika pemakai menekan tombolnya. React sengaja
 * tidak ikut mencerminkannya: cerminan itu baru terisi benar setelah halaman
 * selesai terhidrasi, dan selama jeda tersebut warnanya berkedip.
 */

export type Tema = "terang" | "gelap";

const KUNCI_TEMA = "tm-tema";

export const TEMA_BAWAAN: Tema = "gelap";

/* Sama dengan --latar di globals.css. Dipakai untuk <meta name="theme-color">
   supaya bilah alamat dan bilah status ikut warna halaman. */
const WARNA_TEMA: Record<Tema, string> = {
  terang: "#ffffff",
  gelap: "#000000",
};

/**
 * `<meta name="theme-color">` dibuat sendiri lewat SKRIP_TEMA, bukan lewat
 * `viewport.themeColor` milik Next.
 *
 * Next menulis metanya dengan `media=(prefers-color-scheme: …)`, sehingga bilah
 * status tetap mengikuti setelan sistem walau pemakai memilih tema lain di
 * dalam aplikasi — bilah hitam di atas halaman putih. Menyuntingnya pun tidak
 * bertahan: React memasang ulang meta itu begitu halaman terhidrasi. Meta
 * bikinan sendiri di luar pengetahuan React tidak ikut ditimpa.
 */
const ID_WARNA_BILAH = "warna-bilah";

/** Kelas sementara yang menyalakan transisi warna selama tema berganti. */
const KELAS_BERALIH = "tema-beralih";

/** Harus sama dengan lama transisi .tema-beralih di globals.css. */
const MASA_BERALIH = 220;

/**
 * Dijalankan sebelum lukisan pertama, jadi ditulis sebagai satu baris tanpa
 * bergantung pada apa pun di luar dirinya. Isinya kembar dengan `bacaPilihan`
 * dan `terapkanTema` di bawah — juga dengan skrip serupa di public/luring.html
 * — jadi ketiganya harus ikut berubah bila salah satu diubah.
 */
export const SKRIP_TEMA = `(function(){try{var t=localStorage.getItem("${KUNCI_TEMA}");if(t!=="terang"&&t!=="gelap"){t=matchMedia("(prefers-color-scheme: light)").matches?"terang":"gelap";}document.documentElement.dataset.tema=t;var m=document.createElement("meta");m.name="theme-color";m.id="${ID_WARNA_BILAH}";m.content=t==="terang"?"${WARNA_TEMA.terang}":"${WARNA_TEMA.gelap}";document.head.appendChild(m);}catch(e){document.documentElement.dataset.tema="${TEMA_BAWAAN}";}})();`;

function sahkan(nilai: unknown): Tema | null {
  return nilai === "terang" || nilai === "gelap" ? nilai : null;
}

/** Tema pilihan pemakai, atau null selama ia belum pernah menekan tombolnya. */
export function bacaPilihan(): Tema | null {
  try {
    return sahkan(window.localStorage.getItem(KUNCI_TEMA));
  } catch {
    /* Mode penyamaran di beberapa peramban melarang localStorage. */
    return null;
  }
}

/** Tema yang sudah dipasang SKRIP_TEMA di `<html>`. */
export function temaTerpasang(): Tema {
  return sahkan(document.documentElement.dataset.tema) ?? TEMA_BAWAAN;
}

/** Menyamakan warna bilah status peramban dengan tema yang sedang berlaku. */
function serasikanWarnaBilah(tema: Tema) {
  const ada = document.getElementById(ID_WARNA_BILAH);
  let meta = ada instanceof HTMLMetaElement ? ada : null;

  /* Belum ada bila SKRIP_TEMA sempat gagal. */
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.id = ID_WARNA_BILAH;
    document.head.appendChild(meta);
  }

  meta.content = WARNA_TEMA[tema];
}

/** Memasang tema ke dokumen tanpa animasi dan tanpa menyimpan pilihan. */
function terapkanTema(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  serasikanWarnaBilah(tema);
}

let jamBeralih = 0;

/**
 * Berganti tema dengan lelehan warna singkat.
 *
 * Transisinya dinyalakan lewat kelas yang hanya menempel selama peralihan.
 * Kalau transisinya dipasang permanen, setiap warna yang berubah karena hover
 * dan setiap kartu yang baru masuk ikut meleleh — dan lukisan pertama halaman
 * pun ikut beranimasi.
 *
 * @param simpan Tema sistem yang berubah sendiri bukan pilihan pemakai, jadi
 *   tidak boleh mengunci aplikasi ke salah satu tema.
 */
export function beralihTema(tema: Tema, { simpan = true } = {}) {
  const akar = document.documentElement;

  /* Pemakai yang meminta gerak seminimal mungkin tidak diberi lelehan warna;
     temanya langsung berganti. */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    akar.classList.add(KELAS_BERALIH);
    window.clearTimeout(jamBeralih);
    jamBeralih = window.setTimeout(() => {
      akar.classList.remove(KELAS_BERALIH);
    }, MASA_BERALIH);
  }

  terapkanTema(tema);

  if (!simpan) return;
  try {
    window.localStorage.setItem(KUNCI_TEMA, tema);
  } catch {
    /* Pilihannya tetap berlaku sampai halaman ditutup. */
  }
}
