"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import BottomNav from "./BottomNav";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Composer from "./Composer";
import DaftarMisi from "./DaftarMisi";
import DaftarNotifikasi from "./DaftarNotifikasi";
import JamEmas from "./JamEmas";
import Kabar, { type IsiKabar, type JenisKabar } from "./Kabar";
import ProfileHeader from "./ProfileHeader";
import RightRail from "./RightRail";
import Sidebar from "./Sidebar";
import TombolTema from "./TombolTema";
import BilahTamu from "./BilahTamu";
import PemilihBahasa from "./PemilihBahasa";
import {
  IkonJam,
  IkonKeluar,
  IkonKembali,
  IkonTulis,
  IkonTutup,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { klienPeramban } from "@/lib/supabase/client";
import {
  ambilFeed,
  ambilJejakKomentar,
  ambilKomentar,
  ambilMisi,
  ambilNotifikasi,
  ambilProfil,
  ambilProfilHandle,
  ambilStatistik,
  ambilTren,
  apakahMengikuti,
  hapusKomentar,
  hitungBelumDibaca,
  kirimKomentar,
  kunciGalat,
  setIkut,
  setSuka,
  setUlang,
  tandaiNotifikasiDibaca,
} from "@/lib/api";
import { jangkauanTerkumpul, type JejakKomentar } from "@/lib/jangkauan";
import { MASA_KOMENTAR_JAM, MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import {
  PESAN_HASIL,
  bacaHasil,
  type HasilMisi,
  type KodeMisi,
  type Misi,
} from "@/lib/misi";
import { bacaPilihan, beralihTema, temaTerpasang } from "@/lib/tema";
import { angkaSosial } from "@/lib/time";
import type {
  Comment,
  Notifikasi,
  Statistik,
  Tab,
  Tren,
  User,
  View,
} from "@/lib/types";

const TAB: { kunci: Tab; label: KunciTeks }[] = [
  { kunci: "komentar", label: "tab.komentar" },
  { kunci: "disukai", label: "tab.disukai" },
];

/* Tidak semua hasil verifikasi adalah kegagalan: "menunggu pencocokan", "belum
   mengikuti", dan "lencana dicabut" adalah keadaan yang wajar dan bisa
   diperbaiki sendiri. Yang bernada galat hanya yang benar-benar buntu. */
const NADA_HASIL: Record<HasilMisi, JenisKabar> = {
  berhasil: "berhasil",
  sudah: "berhasil",
  menunggu: "info",
  belumIkut: "info",
  belumSegar: "info",
  dicabut: "info",
  terpakai: "galat",
  lain: "galat",
  belumSiap: "galat",
  takTersedia: "galat",
  ditolak: "info",
  gagal: "galat",
  terlaluSering: "galat",
};

const STATISTIK_KOSONG: Statistik = {
  komentar: 0,
  disukai: 0,
  sukaDiterima: 0,
  ulangDiterima: 0,
};

/**
 * Menambahkan suka dan posting ulang bawaan ke ringkasan seorang penulis.
 *
 * Kartu komentar akun resmi menampilkan angka basis data ditambah jangkauan
 * yang tumbuh seiring umurnya. Tanpa penambahan yang sama di sini, "suka
 * diterima" di profil dan panel kanan akan lebih kecil daripada satu kartu
 * yang tepat di bawahnya — dan diam sementara kartunya terus naik.
 *
 * Dihitung ulang tiap jam aplikasi berdetak, jadi angkanya ikut merangkak.
 */
function denganJangkauan(
  dasar: Statistik,
  jejak: JejakKomentar[],
  penulis: User | null,
  sekarang: number,
): Statistik {
  if (!penulis?.admin || jejak.length === 0) return dasar;

  const { suka, ulang } = jangkauanTerkumpul(jejak, penulis, sekarang);
  return {
    ...dasar,
    sukaDiterima: dasar.sukaDiterima + suka,
    ulangDiterima: dasar.ulangDiterima + ulang,
  };
}

/**
 * Pesan dari Supabase selalu berbahasa Inggris dan lebih tepat daripada
 * tebakan kita, jadi itu yang ditampilkan apa adanya. Yang diterjemahkan hanya
 * dua keadaan yang kalimat aslinya tidak berarti apa-apa bagi pemakai:
 * kegagalan jaringan dan galat tanpa pesan sama sekali.
 */
function pesanGalat(
  kesalahan: unknown,
  cadangan: KunciTeks,
  t: (kunci: KunciTeks) => string,
) {
  /* Sebagian galat sudah membawa kunci kamusnya sendiri karena kalimat asli
     dari basis data tidak berarti apa-apa bagi pemakai. */
  const kunci = kunciGalat(kesalahan);
  if (kunci) return t(kunci);

  if (kesalahan && typeof kesalahan === "object" && "message" in kesalahan) {
    const pesan = String((kesalahan as { message: unknown }).message);
    if (pesan.toLowerCase().includes("failed to fetch")) {
      return t("galat.koneksi");
    }
    return pesan;
  }
  return t(cadangan);
}

export default function App({
  akunAwal,
  tamu,
}: {
  akunAwal: User;
  tamu: boolean;
}) {
  const router = useRouter();
  const supabase = klienPeramban();
  const { bahasa, t } = useBahasa();

  const [akun, setAkun] = useState<User>(akunAwal);
  const [komentar, setKomentar] = useState<Comment[]>([]);
  const [pengguna, setPengguna] = useState<Record<string, User>>({
    [akunAwal.id]: akunAwal,
  });
  const [statistik, setStatistik] = useState<Statistik>(STATISTIK_KOSONG);
  /* Komentar yang masih hidup milik akun sendiri dan milik profil yang sedang
     dibuka. Hanya diisi untuk akun resmi — akun lain tidak punya angka bawaan
     yang perlu dijumlahkan. */
  const [jejakSaya, setJejakSaya] = useState<JejakKomentar[]>([]);
  const [jejakProfil, setJejakProfil] = useState<JejakKomentar[]>([]);

  const [tampilan, setTampilan] = useState<View>("beranda");
  const [tab, setTab] = useState<Tab>("komentar");
  const [kueri, setKueri] = useState("");
  const [kueriTertunda, setKueriTertunda] = useState("");
  const [kabar, setKabar] = useState<IsiKabar | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  /* Profil yang sedang dibuka. Sama dengan akun sendiri sampai ada nama atau
     foto orang lain yang ditekan. */
  const [profilId, setProfilId] = useState(akunAwal.id);
  const [profilLain, setProfilLain] = useState<User | null>(null);
  const [statistikProfil, setStatistikProfil] =
    useState<Statistik>(STATISTIK_KOSONG);
  const [mengikuti, setMengikuti] = useState(false);
  const [menungguIkut, setMenungguIkut] = useState(false);

  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [memuatKabar, setMemuatKabar] = useState(false);
  const [belumDibaca, setBelumDibaca] = useState(0);
  /* Naik setiap ada kabar baru lewat realtime; dipakai sebagai pemicu muat
     ulang ketika daftar notifikasi sedang terbuka. */
  const [penandaKabar, setPenandaKabar] = useState(0);

  const [tren, setTren] = useState<Tren[]>([]);

  const [misi, setMisi] = useState<Misi[]>([]);
  const [memuatMisi, setMemuatMisi] = useState(false);
  /* Misi yang sedang diantar ke X; tombolnya dikunci sampai halaman berpindah. */
  const [misiTertunda, setMisiTertunda] = useState<KodeMisi | null>(null);

  const [tanyaKeluar, setTanyaKeluar] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [memuatLagi, setMemuatLagi] = useState(false);
  const [galatMuat, setGalatMuat] = useState<string | null>(null);
  const [kursor, setKursor] = useState<string | null>(null);
  const [habis, setHabis] = useState(true);

  const komposerRef = useRef<HTMLDivElement>(null);
  const utamaRef = useRef<HTMLElement>(null);
  /* Menandai permintaan feed terakhir agar jawaban yang telat diabaikan. */
  const nomorMuat = useRef(0);

  const profilSaya = profilId === akun.id;
  const penggunaProfil = profilSaya ? akun : profilLain;

  /* ----------------------------------------------------------------
     Tema, jam, dan kabar sekilas
     ---------------------------------------------------------------- */

  /* Tema sepenuhnya tinggal di DOM: SKRIP_TEMA memasangnya sebelum lukisan
     pertama, dan TombolTema membaca `data-tema` lewat CSS. React sengaja tidak
     mencerminkannya — cerminan itu baru terisi benar setelah halaman
     terhidrasi, dan selama jeda itulah dulu warnanya berkedip. */
  function gantiTema() {
    beralihTema(temaTerpasang() === "gelap" ? "terang" : "gelap");
  }

  /* Selama pemakai belum pernah memilih sendiri, temanya mengikuti setelan
     sistem — termasuk ketika setelan itu berubah saat halaman sedang terbuka. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    function ikutSistem() {
      if (bacaPilihan()) return;
      beralihTema(media.matches ? "terang" : "gelap", { simpan: false });
    }

    media.addEventListener("change", ikutSistem);
    return () => media.removeEventListener("change", ikutSistem);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  /* Nomor urut kabar. Dua kali menekan tombol yang sama harus terasa sebagai
     dua kabar, jadi yang membedakannya bukan kalimatnya. */
  const nomorKabar = useRef(0);

  const beriKabar = useCallback((teks: string, jenis: JenisKabar = "info") => {
    nomorKabar.current += 1;
    setKabar({ id: nomorKabar.current, teks, jenis });
  }, []);

  const tutupKabar = useCallback(() => setKabar(null), []);

  /* Galat dari tautan email dikirim lewat query string oleh /auth/callback. */
  useEffect(() => {
    const alamat = new URL(window.location.href);
    const galat = alamat.searchParams.get("galat");
    if (!galat) return;
    beriKabar(galat, "galat");
    alamat.searchParams.delete("galat");
    window.history.replaceState(null, "", alamat.pathname + alamat.search);
  }, []);

  /* Alur verifikasi misi pulang lewat query string: satu kata hasil, kalimatnya
     dipilih di sini supaya mengikuti bahasa yang sedang dipakai. Lencana yang
     baru didapat sudah ikut terbawa render server, jadi tidak ada yang perlu
     dimuat ulang selain daftar misinya. */
  useEffect(() => {
    const alamat = new URL(window.location.href);
    const kode = alamat.searchParams.get("misi");
    const hasil = bacaHasil(alamat.searchParams.get("hasil"));
    if (!kode || !hasil) return;

    beriKabar(t(PESAN_HASIL[hasil]), NADA_HASIL[hasil]);
    setTampilan("misi");

    alamat.searchParams.delete("misi");
    alamat.searchParams.delete("hasil");
    window.history.replaceState(null, "", alamat.pathname + alamat.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Halaman utas mengirim nama dan tagar yang ditekan ke sini lewat query
     string, karena profil dan pencarian hidup di aplikasi ini. Dijalankan
     sekali saat halaman dibuka, lalu alamatnya dirapikan kembali. */
  useEffect(() => {
    const alamat = new URL(window.location.href);
    const handle = alamat.searchParams.get("profil");
    const tagar = alamat.searchParams.get("tagar");
    if (!handle && !tagar) return;

    if (handle) bukaProfilHandle(handle);
    else if (tagar) pilihTagar(tagar);

    alamat.searchParams.delete("profil");
    alamat.searchParams.delete("tagar");
    window.history.replaceState(null, "", alamat.pathname + alamat.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Tunda pencarian supaya tiap ketikan tidak menjadi satu kueri. */
  useEffect(() => {
    const id = window.setTimeout(() => setKueriTertunda(kueri.trim()), 320);
    return () => window.clearTimeout(id);
  }, [kueri]);

  /* ----------------------------------------------------------------
     Muat data
     ---------------------------------------------------------------- */

  const gabungPengguna = useCallback((tambahan: Record<string, User>) => {
    setPengguna((sebelum) => ({ ...sebelum, ...tambahan }));
  }, []);

  const segarkanStatistik = useCallback(() => {
    ambilStatistik(supabase, akun.id)
      .then(setStatistik)
      .catch(() => {
        /* ringkasan boleh tertinggal sesaat; feed tetap yang utama */
      });

    if (!akun.admin) {
      setJejakSaya([]);
      return;
    }

    ambilJejakKomentar(supabase, akun.id)
      .then(setJejakSaya)
      .catch(() => {
        /* tanpa jejaknya ringkasan hanya memakai angka basis data */
      });
  }, [supabase, akun.id, akun.admin]);

  const segarkanTren = useCallback(() => {
    ambilTren(supabase)
      .then(setTren)
      .catch(() => {
        /* tren hanya pelengkap panel kanan */
      });
  }, [supabase]);

  useEffect(() => {
    /* Notifikasi dan misi punya jalur muatnya masing-masing. */
    if (tampilan === "notifikasi" || tampilan === "misi") return;

    let batal = false;
    const nomor = ++nomorMuat.current;

    setMemuat(true);
    setGalatMuat(null);

    ambilFeed(supabase, {
      akunId: akun.id,
      tampilan,
      profilId,
      tab,
      kueri: kueriTertunda,
      kursor: null,
    })
      .then((halaman) => {
        if (batal || nomor !== nomorMuat.current) return;
        setKomentar(halaman.komentar);
        gabungPengguna(halaman.pengguna);
        setKursor(halaman.kursor);
        setHabis(halaman.habis);
      })
      .catch((kesalahan) => {
        if (batal || nomor !== nomorMuat.current) return;
        setGalatMuat(pesanGalat(kesalahan, "galat.muatKomentar", t));
        setKomentar([]);
      })
      .finally(() => {
        if (!batal && nomor === nomorMuat.current) setMemuat(false);
      });

    return () => {
      batal = true;
    };
  }, [supabase, akun.id, profilId, tampilan, tab, kueriTertunda, gabungPengguna]);

  useEffect(segarkanStatistik, [segarkanStatistik]);
  useEffect(segarkanTren, [segarkanTren]);

  /* Katalog misi dibaca ketika halamannya dibuka, bukan saat aplikasi mulai:
     isinya jarang berubah dan tidak ada yang menunggunya di layar lain. */
  useEffect(() => {
    if (tampilan !== "misi") return;

    let batal = false;
    setMemuatMisi(true);

    ambilMisi(supabase, akun.id)
      .then((daftar) => {
        if (!batal) setMisi(daftar);
      })
      .catch((kesalahan) => {
        if (!batal) beriKabar(pesanGalat(kesalahan, "galat.muatMisi", t), "galat");
      })
      .finally(() => {
        if (!batal) setMemuatMisi(false);
      });

    return () => {
      batal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, akun.id, tampilan]);

  /* Profil orang lain: datanya sudah ada sekilas dari kartu komentar, tapi
     jumlah pengikut dan hubungan "sedang mengikuti" harus ditanyakan. */
  useEffect(() => {
    if (profilSaya) {
      setMengikuti(false);
      return;
    }

    let batal = false;
    Promise.all([
      ambilProfil(supabase, profilId),
      apakahMengikuti(supabase, akun.id, profilId),
    ])
      .then(([profil, ikut]) => {
        if (batal) return;
        if (profil) setProfilLain(profil);
        setMengikuti(ikut);
      })
      .catch(() => {
        /* kartu profil tetap memakai data seadanya dari feed */
      });

    return () => {
      batal = true;
    };
  }, [supabase, profilId, akun.id, profilSaya]);

  /* Ringkasan angka di bawah profil. Untuk akun sendiri angkanya sudah ada. */
  useEffect(() => {
    if (profilSaya) {
      setStatistikProfil(statistik);
      return;
    }

    let batal = false;
    ambilStatistik(supabase, profilId)
      .then((hasil) => {
        if (!batal) setStatistikProfil(hasil);
      })
      .catch(() => {});

    return () => {
      batal = true;
    };
  }, [supabase, profilId, profilSaya, statistik]);

  /* Jejak komentar profil orang lain, untuk menjumlahkan angka bawaannya.
     Profil sendiri memakai `jejakSaya` yang sudah ikut disegarkan bersama
     ringkasan. */
  useEffect(() => {
    if (profilSaya || !profilLain?.admin) {
      setJejakProfil([]);
      return;
    }

    let batal = false;
    ambilJejakKomentar(supabase, profilLain.id)
      .then((jejak) => {
        if (!batal) setJejakProfil(jejak);
      })
      .catch(() => {});

    return () => {
      batal = true;
    };
  }, [supabase, profilSaya, profilLain]);

  /* Lencana kabar menyala sejak halaman dibuka, bukan hanya setelah daftarnya
     dilihat sekali. */
  useEffect(() => {
    hitungBelumDibaca(supabase, akun.id)
      .then(setBelumDibaca)
      .catch(() => {});
  }, [supabase, akun.id]);

  useEffect(() => {
    const saluran = supabase
      .channel("kabar-langsung")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${akun.id}`,
        },
        () => {
          setBelumDibaca((jumlah) => jumlah + 1);
          setPenandaKabar((nomor) => nomor + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(saluran);
    };
  }, [supabase, akun.id]);

  /* Membuka daftar notifikasi sekaligus menandainya terbaca — sama seperti
     aplikasi ponsel: lencananya padam begitu isinya terlihat. */
  useEffect(() => {
    if (tampilan !== "notifikasi") return;

    let batal = false;
    setMemuatKabar(true);

    ambilNotifikasi(supabase, akun.id)
      .then(({ daftar, pengguna: profil }) => {
        if (batal) return;
        setNotifikasi(daftar);
        gabungPengguna(profil);

        if (daftar.some((kabar) => !kabar.dibaca)) {
          tandaiNotifikasiDibaca(supabase, akun.id)
            .then(() => {
              if (!batal) setBelumDibaca(0);
            })
            .catch(() => {});
        } else {
          setBelumDibaca(0);
        }
      })
      .catch((kesalahan) => {
        if (!batal) {
          beriKabar(pesanGalat(kesalahan, "galat.muatNotifikasi", t), "galat");
        }
      })
      .finally(() => {
        if (!batal) setMemuatKabar(false);
      });

    return () => {
      batal = true;
    };
  }, [supabase, akun.id, tampilan, penandaKabar, gabungPengguna]);

  async function muatLagi() {
    if (memuatLagi || habis || !kursor) return;
    setMemuatLagi(true);
    try {
      const halaman = await ambilFeed(supabase, {
        akunId: akun.id,
        tampilan,
        profilId,
        tab,
        kueri: kueriTertunda,
        kursor,
      });
      setKomentar((sebelum) => {
        const ada = new Set(sebelum.map((k) => k.id));
        return [...sebelum, ...halaman.komentar.filter((k) => !ada.has(k.id))];
      });
      gabungPengguna(halaman.pengguna);
      setKursor(halaman.kursor);
      setHabis(halaman.habis);
    } catch (kesalahan) {
      beriKabar(pesanGalat(kesalahan, "galat.muatLagi", t), "galat");
    } finally {
      setMemuatLagi(false);
    }
  }

  /* Komentar orang lain masuk ke beranda tanpa perlu memuat ulang halaman. */
  useEffect(() => {
    if (tampilan !== "beranda" || kueriTertunda) return;

    const saluran = supabase
      .channel("komentar-langsung")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        async (muatan) => {
          const baris = muatan.new as { id: string; author_id: string };
          if (baris.author_id === akun.id) return;

          const hasil = await ambilKomentar(supabase, baris.id, akun.id);
          if (!hasil) return;

          setKomentar((sebelum) =>
            sebelum.some((k) => k.id === hasil.komentar.id)
              ? sebelum
              : [hasil.komentar, ...sebelum],
          );
          gabungPengguna(hasil.pengguna);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(saluran);
    };
  }, [supabase, akun.id, tampilan, kueriTertunda, gabungPengguna]);

  /* ----------------------------------------------------------------
     Aksi
     ---------------------------------------------------------------- */

  function ubahKomentar(id: string, ubah: (k: Comment) => Comment) {
    setKomentar((sebelum) => sebelum.map((k) => (k.id === id ? ubah(k) : k)));
  }

  async function buatKomentar(teks: string) {
    try {
      const baru = await kirimKomentar(supabase, akun.id, teks);

      /* Daftar yang sedang terbuka belum tentu tempatnya: tab "Disukai" dan
         hasil pencarian punya syaratnya sendiri, dan komentar baru tidak
         memenuhi keduanya. */
      const masukDaftar =
        tampilan === "beranda"
          ? !kueriTertunda
          : profilSaya && tab === "komentar" && !kueriTertunda;

      if (masukDaftar) setKomentar((sebelum) => [baru, ...sebelum]);

      beriKabar(t("pesan.komentarTerkirim"), "berhasil");
      segarkanStatistik();
      /* Tagar di komentar baru bisa langsung mengubah papan tren. */
      if (teks.includes("#")) segarkanTren();
    } catch (kesalahan) {
      beriKabar(pesanGalat(kesalahan, "galat.kirimKomentar", t), "galat");
    }
  }

  async function alihkanSuka(id: string) {
    const sebelumnya = komentar.find((k) => k.id === id);
    if (!sebelumnya) return;
    const suka = !sebelumnya.liked;

    ubahKomentar(id, (k) => ({
      ...k,
      liked: suka,
      likes: Math.max(0, k.likes + (suka ? 1 : -1)),
    }));

    try {
      await setSuka(supabase, id, akun.id, suka);
      segarkanStatistik();
    } catch (kesalahan) {
      ubahKomentar(id, () => sebelumnya);
      beriKabar(pesanGalat(kesalahan, "galat.suka", t), "galat");
    }
  }

  async function alihkanUlang(id: string) {
    const sebelumnya = komentar.find((k) => k.id === id);
    if (!sebelumnya) return;
    const ulang = !sebelumnya.reposted;

    ubahKomentar(id, (k) => ({
      ...k,
      reposted: ulang,
      reposts: Math.max(0, k.reposts + (ulang ? 1 : -1)),
    }));

    try {
      await setUlang(supabase, id, akun.id, ulang);
    } catch (kesalahan) {
      ubahKomentar(id, () => sebelumnya);
      beriKabar(pesanGalat(kesalahan, "galat.ulang", t), "galat");
    }
  }

  /*
   * Verifikasi misi selalu berangkat ke server, tidak pernah diputuskan di
   * sini: peramban cuma mengantar pemakai ke alur izin X, dan Route Handler
   * yang memutuskan lencananya. Karena itu yang terjadi di baris ini hanyalah
   * perpindahan halaman.
   */
  function verifikasiMisi(kode: KodeMisi) {
    if (kode !== "ikuti-x" || misiTertunda) return;
    setMisiTertunda(kode);
    window.location.href = "/api/misi/x/mulai";
  }

  async function alihkanIkut() {
    const sasaran = profilLain;
    if (!sasaran || profilSaya || menungguIkut) return;

    const ikut = !mengikuti;
    const geser = ikut ? 1 : -1;

    setMenungguIkut(true);
    setMengikuti(ikut);
    setProfilLain({
      ...sasaran,
      followers: Math.max(0, sasaran.followers + geser),
    });
    setAkun((sebelum) => ({
      ...sebelum,
      following: Math.max(0, sebelum.following + geser),
    }));

    try {
      await setIkut(supabase, akun.id, sasaran.id, ikut);
      beriKabar(
        t(ikut ? "pesan.mulaiMengikuti" : "pesan.berhentiMengikuti", {
          handle: sasaran.handle,
        }),
        "berhasil",
      );
    } catch (kesalahan) {
      setMengikuti(!ikut);
      setProfilLain(sasaran);
      setAkun((sebelum) => ({
        ...sebelum,
        following: Math.max(0, sebelum.following - geser),
      }));
      beriKabar(pesanGalat(kesalahan, "galat.ikut", t), "galat");
    } finally {
      setMenungguIkut(false);
    }
  }

  async function hapus(id: string) {
    const sebelumnya = komentar;
    setKomentar((daftar) => daftar.filter((k) => k.id !== id));

    try {
      await hapusKomentar(supabase, id);
      beriKabar(t("pesan.komentarDihapus"), "berhasil");
      segarkanStatistik();
    } catch (kesalahan) {
      setKomentar(sebelumnya);
      beriKabar(pesanGalat(kesalahan, "galat.hapusKomentar", t), "galat");
    }
  }

  async function salinTautan(id: string) {
    const tautan = `${window.location.origin}/komentar/${id}`;
    try {
      await navigator.clipboard.writeText(tautan);
      beriKabar(t("pesan.tautanDisalin"), "berhasil");
    } catch {
      beriKabar(t("pesan.papanKlipDitolak"), "galat");
    }
  }

  /* Keluar dari akun tamu berarti kehilangan akunnya, jadi ditanya dulu. */
  function mintaKeluar() {
    if (tamu) {
      setTanyaKeluar(true);
      return;
    }
    keluar();
  }

  async function keluar() {
    setTanyaKeluar(false);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  function simpanProfilLokal(baru: User) {
    setAkun(baru);
    setPengguna((sebelum) => ({ ...sebelum, [baru.id]: baru }));
    beriKabar(t("pesan.profilDiperbarui"), "berhasil");
  }

  function keAtas() {
    utamaRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }

  function mulaiMenulis() {
    setTampilan("beranda");
    requestAnimationFrame(() => {
      const area = komposerRef.current?.querySelector("textarea");
      area?.focus({ preventScroll: true });
      keAtas();
    });
  }

  function gantiTampilan(berikut: View) {
    /* Menekan "Profil" di navigasi selalu berarti profil sendiri, walau yang
       terakhir dibuka milik orang lain. */
    if (berikut === "profil") {
      setProfilId(akun.id);
      setProfilLain(null);
      setTab("komentar");
    }
    setTampilan(berikut);
    keAtas();
  }

  function bukaProfil(sasaran: User) {
    setProfilId(sasaran.id);
    setProfilLain(sasaran.id === akun.id ? null : sasaran);
    setTab("komentar");
    setTampilan("profil");
    keAtas();
  }

  async function bukaProfilHandle(handle: string) {
    const dikenal = Object.values(daftarPengguna).find(
      (calon) => calon.handle.toLowerCase() === handle.toLowerCase(),
    );
    if (dikenal) {
      bukaProfil(dikenal);
      return;
    }

    try {
      const profil = await ambilProfilHandle(supabase, handle);
      if (profil) bukaProfil(profil);
      else beriKabar(t("pesan.profilTakDitemukan", { handle }));
    } catch {
      beriKabar(t("pesan.profilTakDitemukan", { handle }));
    }
  }

  function pilihTagar(tagar: string) {
    setKueri(`#${tagar}`);
    setTampilan("beranda");
    keAtas();
  }

  /* ----------------------------------------------------------------
     Tampilan
     ---------------------------------------------------------------- */

  const judulDaftar = t(
    tampilan === "beranda"
      ? "beranda.judul"
      : tampilan === "notifikasi"
        ? "nav.notifikasi"
        : tampilan === "misi"
          ? "nav.misi"
          : (TAB.find((butir) => butir.kunci === tab)?.label ?? "tab.komentar"),
  );

  const daftarPengguna = useMemo(
    () => ({ ...pengguna, [akun.id]: akun }),
    [pengguna, akun],
  );

  /* Ringkasan yang benar-benar ditampilkan: angka basis data ditambah
     jangkauan bawaan, dihitung ulang tiap menit bersama jam aplikasi. */
  const statistikTampil = useMemo(
    () => denganJangkauan(statistik, jejakSaya, akun, sekarang),
    [statistik, jejakSaya, akun, sekarang],
  );

  const statistikProfilTampil = useMemo(
    () =>
      profilSaya
        ? statistikTampil
        : denganJangkauan(statistikProfil, jejakProfil, profilLain, sekarang),
    [profilSaya, statistikTampil, statistikProfil, jejakProfil, profilLain, sekarang],
  );

  /* Basis data yang menentukan, tetapi daftar di layar tetap disaring sendiri
     supaya komentar yang lewat 24 jam hilang tanpa menunggu muat ulang. Jam
     `sekarang` berdetak tiap menit, jadi ini ikut menyegarkan sendiri. */
  const daftar = useMemo(
    () => komentar.filter((k) => sekarang - k.createdAt < MASA_KOMENTAR_MS),
    [komentar, sekarang],
  );

  const teksKosong = kueriTertunda
    ? t("kosong.cari", { kueri: kueriTertunda })
    : tampilan === "profil"
      ? profilSaya
        ? tab === "disukai"
          ? t("kosong.disukai")
          : t("kosong.komentar")
        : t("kosong.profilOrang", { handle: penggunaProfil?.handle ?? "" })
      : t("kosong.beranda");

  /* Beranda memakai lambangnya di kiri bilah, jadi namanya tidak perlu diulang
     lagi di tengah; ruang kosongnya tetap dipakai untuk menjaga tata letak.
     Profil pun begitu: nama dan fotonya sudah sebesar itu di kartu tepat di
     bawah bilah, jadi mengulangnya di sini hanya menumpuk. */
  const judulBilah =
    tampilan === "notifikasi"
      ? t("nav.notifikasi")
      : tampilan === "misi"
        ? t("nav.misi")
        : "";

  /* Dua layar yang bukan tempat menulis; keduanya memakai panah pulang di
     tempat lambang merek berada. */
  const layarSekunder = tampilan === "notifikasi" || tampilan === "misi";

  return (
    <div className="kerangka">
      <Sidebar
        tampilan={tampilan}
        onPindah={gantiTampilan}
        onTulis={mulaiMenulis}
        pengguna={akun}
        belumDibaca={belumDibaca}
        onGantiTema={gantiTema}
        onKeluar={mintaKeluar}
      />

      <main className="utama" ref={utamaRef}>
        <div className="bilah-mobil">
          {!layarSekunder ? (
            <span className="bilah-merek">
              <Brand size={26} />
            </span>
          ) : (
            <button
              type="button"
              className="bulat"
              onClick={() => gantiTampilan("beranda")}
              aria-label={t("nav.kembali")}
            >
              <IkonKembali size={20} />
            </button>
          )}

          <span className="bilah-judul">{judulBilah}</span>

          <span className="bilah-aksi">
            <PemilihBahasa varian="bulat" size={20} />
            <TombolTema varian="bulat" size={20} onGanti={gantiTema} />
            <button
              type="button"
              className="bulat"
              onClick={mintaKeluar}
              aria-label={t("nav.keluarLabel")}
            >
              <IkonKeluar size={20} />
            </button>
          </span>
        </div>

        {tamu && (
          <BilahTamu onSelesai={() => router.refresh()} onKabar={beriKabar} />
        )}

        {tampilan === "profil" && penggunaProfil && (
          /* Tanpa bilah nama dan tanpa panah kembali: keduanya hanya mengulang
             apa yang sudah ada — nama lengkapnya di kartu profil tepat di
             bawah, jalan pulangnya di navigasi bawah dan bilah samping. */
          <ProfileHeader
            pengguna={penggunaProfil}
            milikSaya={profilSaya}
            mengikuti={mengikuti}
            menungguIkut={menungguIkut}
            jumlahKomentar={statistikProfilTampil.komentar}
            jumlahSukaDiterima={statistikProfilTampil.sukaDiterima}
            onIkuti={alihkanIkut}
            onSimpan={simpanProfilLokal}
            onKabar={beriKabar}
          />
        )}

        {tampilan === "beranda" ? (
          <div className="kepala-kolom">
            <h1 className="kepala-judul">{t("beranda.judul")}</h1>
            <p className="kepala-sub">
              {memuat
                ? t("beranda.memuat")
                : t("umum.jumlahKomentar", {
                    jumlah: `${angkaSosial(daftar.length, bahasa)}${habis ? "" : "+"}`,
                  })}
              <span className="kepala-tanda">
                <IkonJam size={13} />
                {t("beranda.masa", { jam: MASA_KOMENTAR_JAM })}
              </span>
            </p>
          </div>
        ) : tampilan === "notifikasi" ? (
          <div className="kepala-kolom">
            <h1 className="kepala-judul">{t("nav.notifikasi")}</h1>
            <p className="kepala-sub">{t("notif.sub")}</p>
          </div>
        ) : tampilan === "misi" ? (
          <div className="kepala-kolom">
            <h1 className="kepala-judul">{t("nav.misi")}</h1>
            <p className="kepala-sub">{t("misi.sub")}</p>
          </div>
        ) : (
          <div className="tab" role="tablist" aria-label={t("tab.saringan")}>
            {TAB.map(({ kunci, label }) => (
              <button
                key={kunci}
                type="button"
                role="tab"
                aria-selected={tab === kunci}
                className={`tab-butir${tab === kunci ? " tab-butir-aktif" : ""}`}
                onClick={() => setTab(kunci)}
              >
                <span>{t(label)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Menekan tagar menyaring daftar di bawahnya, dan tanpa kotak cari
            tidak ada lagi yang memperlihatkan saringan itu sedang menyala.
            Kepingan ini yang mengatakannya, sekaligus jalan melepaskannya. */}
        {kueriTertunda && !layarSekunder && (
          <div className="saringan">
            <span className="saringan-keping">
              <span className="saringan-teks">{kueriTertunda}</span>
              <button
                type="button"
                className="saringan-lepas"
                onClick={() => setKueri("")}
                aria-label={t("kosong.hapusCari")}
              >
                <IkonTutup size={14} />
              </button>
            </span>
          </div>
        )}

        {tampilan === "beranda" && (
          <>
            {/* Panel kanan tidak pernah muncul di layar sempit, jadi jam
                emasnya ikut turun ke kolom utama — satu baris tepat di atas
                kotak tulis, tempat keputusan "kirim sekarang atau nanti"
                diambil. */}
            <JamEmas sekarang={sekarang} varian="ringkas" />

            <div className="komposer-utama" ref={komposerRef}>
              <Composer
                pengguna={akun}
                placeholder={t("komposer.komentar")}
                labelTombol={t("komposer.kirim")}
                onKirim={buatKomentar}
              />
            </div>
          </>
        )}

        <section
          className="daftar"
          aria-label={t("daftar.label", { judul: judulDaftar.toLowerCase() })}
        >
          {tampilan === "misi" ? (
            <DaftarMisi
              daftar={misi}
              memuat={memuatMisi}
              menunggu={misiTertunda}
              onVerifikasi={verifikasiMisi}
            />
          ) : tampilan === "notifikasi" ? (
            memuatKabar && notifikasi.length === 0 ? (
              <div className="rangka" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div className="rangka-butir" key={i}>
                    <span className="rangka-bulat" />
                    <span className="rangka-baris">
                      <span className="rangka-garis rangka-garis-pendek" />
                      <span className="rangka-garis rangka-garis-sedang" />
                    </span>
                  </div>
                ))}
              </div>
            ) : notifikasi.length === 0 ? (
              <div className="kosong">
                <Avatar pengguna={akun} ukuran={56} />
                <h2 className="kosong-judul">{t("notif.kosongJudul")}</h2>
                <p className="kosong-teks">{t("notif.kosongTeks")}</p>
              </div>
            ) : (
              <DaftarNotifikasi
                daftar={notifikasi}
                pengguna={daftarPengguna}
                sekarang={sekarang}
                onBukaProfil={bukaProfil}
              />
            )
          ) : memuat ? (
            <div className="rangka" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div className="rangka-butir" key={i}>
                  <span className="rangka-bulat" />
                  <span className="rangka-baris">
                    <span className="rangka-garis rangka-garis-pendek" />
                    <span className="rangka-garis" />
                    <span className="rangka-garis rangka-garis-sedang" />
                  </span>
                </div>
              ))}
              <span className="sr-only">{t("daftar.memuatKomentar")}</span>
            </div>
          ) : galatMuat ? (
            <div className="kosong">
              <h2 className="kosong-judul">{t("galat.judul")}</h2>
              <p className="kosong-teks">{galatMuat}</p>
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => router.refresh()}
              >
                {t("umum.cobaLagi")}
              </button>
            </div>
          ) : daftar.length === 0 ? (
            <div className="kosong">
              <Avatar pengguna={penggunaProfil ?? akun} ukuran={56} />
              <h2 className="kosong-judul">{t("kosong.judul")}</h2>
              <p className="kosong-teks">{teksKosong}</p>
              {kueriTertunda && (
                <button
                  type="button"
                  className="tombol tombol-garis"
                  onClick={() => setKueri("")}
                >
                  {t("kosong.hapusCari")}
                </button>
              )}
            </div>
          ) : (
            <>
              {daftar.map((k) => {
                const penulis = daftarPengguna[k.authorId];
                if (!penulis) return null;

                return (
                  <div className="daftar-butir" id={k.id} key={k.id}>
                    <CommentCard
                      komentar={k}
                      penulis={penulis}
                      akunSaya={akun}
                      sekarang={sekarang}
                      onSuka={() => alihkanSuka(k.id)}
                      onUlang={() => alihkanUlang(k.id)}
                      onBagikan={() => salinTautan(k.id)}
                      onHapus={() => hapus(k.id)}
                      onBukaProfil={bukaProfil}
                      onTagar={pilihTagar}
                      onSebut={bukaProfilHandle}
                    />
                  </div>
                );
              })}

              {!habis && (
                <div className="muat-lagi">
                  <button
                    type="button"
                    className="tombol tombol-garis"
                    onClick={muatLagi}
                    disabled={memuatLagi}
                  >
                    {t(memuatLagi ? "umum.memuat" : "daftar.muatLagi")}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="ruang-bawah" />
      </main>

      <RightRail
        statistik={statistikTampil}
        tren={tren}
        pengguna={akun}
        sekarang={sekarang}
        onTagar={pilihTagar}
        onKeluar={mintaKeluar}
      />

      {/* Di profil tombol melayang ini menutupi kartu profil dan angkanya,
          sedangkan jalan menulis sudah tersedia lewat navigasi bawah. */}
      {layarSekunder && (
        <button
          type="button"
          className="apung"
          onClick={mulaiMenulis}
          aria-label={t("nav.tulisBaru")}
        >
          <IkonTulis size={22} />
        </button>
      )}

      <BottomNav
        tampilan={tampilan}
        onPindah={gantiTampilan}
        belumDibaca={belumDibaca}
      />

      {tanyaKeluar && (
        <div className="tirai" onClick={() => setTanyaKeluar(false)}>
          <div
            className="tanya"
            role="alertdialog"
            aria-labelledby="tanya-judul"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="tanya-judul" id="tanya-judul">
              {t("keluar.judul")}
            </h2>
            <p className="tanya-teks">{t("keluar.teks")}</p>
            <div className="tanya-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => setTanyaKeluar(false)}
                autoFocus
              >
                {t("keluar.tetap")}
              </button>
              <button type="button" className="tombol tombol-bahaya" onClick={keluar}>
                {t("keluar.keluar")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Kabar kabar={kabar} onTutup={tutupKabar} />
    </div>
  );
}
