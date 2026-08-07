"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import BottomNav from "./BottomNav";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Composer from "./Composer";
import DaftarNotifikasi from "./DaftarNotifikasi";
import Kabar, { type IsiKabar, type JenisKabar } from "./Kabar";
import ProfileHeader from "./ProfileHeader";
import RightRail from "./RightRail";
import Sidebar from "./Sidebar";
import TombolTema from "./TombolTema";
import BilahTamu from "./BilahTamu";
import PemilihBahasa from "./PemilihBahasa";
import {
  IkonCari,
  IkonJam,
  IkonKeluar,
  IkonKembali,
  IkonTulis,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { klienPeramban } from "@/lib/supabase/client";
import {
  ambilFeed,
  ambilKomentar,
  ambilNotifikasi,
  ambilProfil,
  ambilProfilHandle,
  ambilStatistik,
  ambilTren,
  apakahMengikuti,
  hapusKomentar,
  hitungBelumDibaca,
  kirimKomentar,
  setIkut,
  setSimpan,
  setSuka,
  setUlang,
  tandaiNotifikasiDibaca,
} from "@/lib/api";
import { MASA_KOMENTAR_JAM, MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import { bacaPilihan, beralihTema, temaTerpasang } from "@/lib/tema";
import { susunUtas } from "@/lib/utas";
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
  { kunci: "balasan", label: "tab.balasan" },
  { kunci: "disukai", label: "tab.disukai" },
  { kunci: "disimpan", label: "tab.disimpan" },
];

const STATISTIK_KOSONG: Statistik = {
  komentar: 0,
  balasan: 0,
  disukai: 0,
  sukaDiterima: 0,
  ulangDiterima: 0,
};

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

  const [tampilan, setTampilan] = useState<View>("beranda");
  const [tab, setTab] = useState<Tab>("komentar");
  const [kueri, setKueri] = useState("");
  const [kueriTertunda, setKueriTertunda] = useState("");
  const [balasUntuk, setBalasUntuk] = useState<string | null>(null);
  const [kabar, setKabar] = useState<IsiKabar | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());
  /* Komentar yang baru saja dituju dari sebuah balasan; sorotannya padam
     sendiri setelah cukup lama untuk mengikuti mata ke sana. */
  const [sorotId, setSorotId] = useState<string | null>(null);

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
  }, [supabase, akun.id]);

  const segarkanTren = useCallback(() => {
    ambilTren(supabase)
      .then(setTren)
      .catch(() => {
        /* tren hanya pelengkap panel kanan */
      });
  }, [supabase]);

  useEffect(() => {
    /* Daftar notifikasi punya jalur muatnya sendiri. */
    if (tampilan === "notifikasi") return;

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

  async function buatKomentar(teks: string, parentId: string | null) {
    try {
      const baru = await kirimKomentar(supabase, akun.id, teks, parentId);
      baru.parentHandle = parentId
        ? (pengguna[komentar.find((k) => k.id === parentId)?.authorId ?? ""]
            ?.handle ?? null)
        : null;

      const masukDaftar =
        tampilan === "beranda"
          ? !kueriTertunda
          : profilSaya &&
            tab === (parentId ? "balasan" : "komentar") &&
            !kueriTertunda;

      if (masukDaftar) setKomentar((sebelum) => [baru, ...sebelum]);
      if (parentId) {
        ubahKomentar(parentId, (k) => ({ ...k, replies: k.replies + 1 }));
      }

      beriKabar(
        t(parentId ? "pesan.balasanTerkirim" : "pesan.komentarTerkirim"),
        "berhasil",
      );
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

  async function alihkanSimpan(id: string) {
    const sebelumnya = komentar.find((k) => k.id === id);
    if (!sebelumnya) return;
    const simpan = !sebelumnya.saved;

    ubahKomentar(id, (k) => ({ ...k, saved: simpan }));

    try {
      await setSimpan(supabase, id, akun.id, simpan);
      beriKabar(
        t(simpan ? "pesan.komentarDisimpan" : "pesan.simpananDibuang"),
        "berhasil",
      );
      /* Tab "Disimpan" adalah daftar itu sendiri, jadi barisnya langsung pergi
         begitu tandanya dilepas. */
      if (!simpan && tampilan === "profil" && tab === "disimpan") {
        setKomentar((daftar) => daftar.filter((k) => k.id !== id));
      }
    } catch (kesalahan) {
      ubahKomentar(id, () => sebelumnya);
      beriKabar(pesanGalat(kesalahan, "galat.simpan", t), "galat");
    }
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
    const sasaran = komentar.find((k) => k.id === id);
    setKomentar((daftar) => daftar.filter((k) => k.id !== id));

    try {
      await hapusKomentar(supabase, id);
      if (sasaran?.parentId) {
        ubahKomentar(sasaran.parentId, (k) => ({
          ...k,
          replies: Math.max(0, k.replies - 1),
        }));
      }
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
    setBalasUntuk(null);
    keAtas();
  }

  function bukaProfil(sasaran: User) {
    setProfilId(sasaran.id);
    setProfilLain(sasaran.id === akun.id ? null : sasaran);
    setTab("komentar");
    setTampilan("profil");
    setBalasUntuk(null);
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

  /* Dari sebuah balasan, yang dicari adalah percakapan asalnya. Kalau komentar
     itu memang sedang ada di layar, cukup digulir ke sana dan disorot sebentar;
     kalau tidak — halamannya sudah lewat, atau daftarnya sedang tersaring —
     utasnya yang dibuka. */
  function bukaInduk(indukId: string) {
    setSorotId(null);

    if (!daftar.some(({ komentar: k }) => k.id === indukId)) {
      router.push(`/komentar/${indukId}`);
      return;
    }

    document
      .getElementById(indukId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    requestAnimationFrame(() => setSorotId(indukId));
  }

  /* Sorotan dipadamkan lewat efek, bukan lewat penghitung waktu di dalam
     penangan tekan, supaya berpindah halaman tidak meninggalkannya menyala. */
  useEffect(() => {
    if (!sorotId) return;
    const jam = window.setTimeout(() => setSorotId(null), 2400);
    return () => window.clearTimeout(jam);
  }, [sorotId]);

  function pilihTagar(tagar: string) {
    setKueri(`#${tagar}`);
    setTampilan("beranda");
    setBalasUntuk(null);
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
        : (TAB.find((butir) => butir.kunci === tab)?.label ?? "tab.komentar"),
  );

  const daftarPengguna = useMemo(
    () => ({ ...pengguna, [akun.id]: akun }),
    [pengguna, akun],
  );

  /* Basis data yang menentukan, tetapi daftar di layar tetap disaring sendiri
     supaya komentar yang lewat 24 jam hilang tanpa menunggu muat ulang. Jam
     `sekarang` berdetak tiap menit, jadi ini ikut menyegarkan sendiri.
     Sesudah disaring, balasan dikumpulkan tepat di bawah komentar yang
     dibalasnya alih-alih tersebar menurut waktu kirim. */
  const daftar = useMemo(
    () =>
      susunUtas(
        komentar.filter((k) => sekarang - k.createdAt < MASA_KOMENTAR_MS),
      ),
    [komentar, sekarang],
  );

  /* Simpanan bersifat pribadi, jadi tabnya hanya ada di profil sendiri. */
  const tabTampil = profilSaya
    ? TAB
    : TAB.filter((butir) => butir.kunci !== "disimpan");

  const teksKosong = kueriTertunda
    ? t("kosong.cari", { kueri: kueriTertunda })
    : tampilan === "profil"
      ? profilSaya
        ? tab === "disukai"
          ? t("kosong.disukai")
          : tab === "disimpan"
            ? t("kosong.disimpan")
            : tab === "balasan"
              ? t("kosong.balasan")
              : t("kosong.komentar")
        : t("kosong.profilOrang", { handle: penggunaProfil?.handle ?? "" })
      : t("kosong.beranda");

  /* Beranda memakai lambangnya di kiri bilah, jadi namanya tidak perlu diulang
     lagi di tengah; ruang kosongnya tetap dipakai untuk menjaga tata letak.
     Profil pun begitu: nama dan fotonya sudah sebesar itu di kartu tepat di
     bawah bilah, jadi mengulangnya di sini hanya menumpuk. */
  const judulBilah = tampilan === "notifikasi" ? t("nav.notifikasi") : "";

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
          {tampilan !== "notifikasi" ? (
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
            jumlahKomentar={statistikProfil.komentar + statistikProfil.balasan}
            jumlahSukaDiterima={statistikProfil.sukaDiterima}
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
        ) : (
          <div className="tab" role="tablist" aria-label={t("tab.saringan")}>
            {tabTampil.map(({ kunci, label }) => (
              <button
                key={kunci}
                type="button"
                role="tab"
                aria-selected={tab === kunci}
                className={`tab-butir${tab === kunci ? " tab-butir-aktif" : ""}`}
                onClick={() => {
                  setTab(kunci);
                  setBalasUntuk(null);
                }}
              >
                <span>{t(label)}</span>
              </button>
            ))}
          </div>
        )}

        {tampilan !== "notifikasi" && (
          <div className="cari cari-mobil">
            <IkonCari size={18} className="cari-ikon" />
            <label className="sr-only" htmlFor="cari-mobil">
              {t("cari.label")}
            </label>
            <input
              id="cari-mobil"
              className="cari-masukan"
              type="search"
              value={kueri}
              onChange={(e) => setKueri(e.target.value)}
              placeholder={t("cari.label")}
            />
          </div>
        )}

        {tampilan === "beranda" && (
          <div className="komposer-utama" ref={komposerRef}>
            <Composer
              pengguna={akun}
              placeholder={t("komposer.komentar")}
              labelTombol={t("komposer.kirim")}
              onKirim={(teks) => buatKomentar(teks, null)}
            />
          </div>
        )}

        <section
          className="daftar"
          aria-label={t("daftar.label", { judul: judulDaftar.toLowerCase() })}
        >
          {tampilan === "notifikasi" ? (
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
              {daftar.map(({ komentar: k }, i) => {
                const penulis = daftarPengguna[k.authorId];
                if (!penulis) return null;

                /* "Membalas @siapa" hanya ditulis kalau ia menambah sesuatu.
                   Pada balasan langsung atas komentar utama yang persis di
                   atasnya, kalimat itu cuma mengeja ulang susunan yang sudah
                   terlihat. Balasan atas balasan tetap menyebutkannya — semua
                   balasan berdiri di garis yang sama, jadi tanpa baris itu tak
                   ada lagi yang membedakannya. */
                const atas = daftar[i - 1];
                const konteksJelas =
                  atas !== undefined &&
                  atas.kedalaman === 0 &&
                  atas.komentar.id === k.parentId;

                return (
                  <div className="daftar-butir" id={k.id} key={k.id}>
                    <CommentCard
                      komentar={k}
                      penulis={penulis}
                      akunSaya={akun}
                      sekarang={sekarang}
                      konteksJelas={konteksJelas}
                      sorot={sorotId === k.id}
                      balasTerbuka={balasUntuk === k.id}
                      onSuka={() => alihkanSuka(k.id)}
                      onUlang={() => alihkanUlang(k.id)}
                      onSimpan={() => alihkanSimpan(k.id)}
                      onBukaBalas={() =>
                        setBalasUntuk(balasUntuk === k.id ? null : k.id)
                      }
                      onKirimBalasan={(teks) => {
                        buatKomentar(teks, k.id);
                        setBalasUntuk(null);
                      }}
                      onBagikan={() => salinTautan(k.id)}
                      onHapus={() => hapus(k.id)}
                      onBukaProfil={bukaProfil}
                      onBukaInduk={bukaInduk}
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
        kueri={kueri}
        onKueri={setKueri}
        statistik={statistik}
        tren={tren}
        pengguna={akun}
        onTagar={pilihTagar}
        onKeluar={mintaKeluar}
      />

      {/* Di profil tombol melayang ini menutupi kartu profil dan angkanya,
          sedangkan jalan menulis sudah tersedia lewat navigasi bawah. */}
      {tampilan === "notifikasi" && (
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
