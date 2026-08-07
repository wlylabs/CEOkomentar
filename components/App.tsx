"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import BottomNav from "./BottomNav";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Composer from "./Composer";
import ProfileHeader from "./ProfileHeader";
import RightRail from "./RightRail";
import Sidebar from "./Sidebar";
import BilahTamu from "./BilahTamu";
import {
  IkonBulan,
  IkonCari,
  IkonJam,
  IkonKeluar,
  IkonKembali,
  IkonMatahari,
  IkonTulis,
} from "./Icons";
import { klienPeramban } from "@/lib/supabase/client";
import {
  ambilFeed,
  ambilKomentar,
  ambilStatistik,
  hapusKomentar,
  kirimKomentar,
  setSuka,
  setUlang,
} from "@/lib/api";
import { MASA_KOMENTAR_JAM, MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import { angkaPenuh } from "@/lib/time";
import type { Comment, Statistik, Tab, User, View } from "@/lib/types";

const TAB: { kunci: Tab; label: string }[] = [
  { kunci: "komentar", label: "Komentar" },
  { kunci: "balasan", label: "Balasan" },
  { kunci: "disukai", label: "Disukai" },
];

const STATISTIK_KOSONG: Statistik = {
  komentar: 0,
  balasan: 0,
  disukai: 0,
  sukaDiterima: 0,
  ulangDiterima: 0,
};

type Tema = "terang" | "gelap";

function pesanGalat(kesalahan: unknown, cadangan: string) {
  if (kesalahan && typeof kesalahan === "object" && "message" in kesalahan) {
    const pesan = String((kesalahan as { message: unknown }).message);
    if (pesan.toLowerCase().includes("failed to fetch")) {
      return "Koneksi ke server terputus.";
    }
    return pesan;
  }
  return cadangan;
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
  const [tema, setTema] = useState<Tema>("gelap");
  const [pesan, setPesan] = useState<string | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

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

  /* ----------------------------------------------------------------
     Tema, jam, dan pesan sekilas
     ---------------------------------------------------------------- */

  useEffect(() => {
    const tersimpan = window.localStorage.getItem("tm-tema");
    if (tersimpan === "terang" || tersimpan === "gelap") {
      setTema(tersimpan);
      return;
    }
    const terang = window.matchMedia("(prefers-color-scheme: light)").matches;
    setTema(terang ? "terang" : "gelap");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    window.localStorage.setItem("tm-tema", tema);
  }, [tema]);

  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pesan) return;
    const id = window.setTimeout(() => setPesan(null), 2600);
    return () => window.clearTimeout(id);
  }, [pesan]);

  /* Galat dari tautan email dikirim lewat query string oleh /auth/callback. */
  useEffect(() => {
    const alamat = new URL(window.location.href);
    const galat = alamat.searchParams.get("galat");
    if (!galat) return;
    setPesan(galat);
    alamat.searchParams.delete("galat");
    window.history.replaceState(null, "", alamat.pathname + alamat.search);
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

  useEffect(() => {
    let batal = false;
    const nomor = ++nomorMuat.current;

    setMemuat(true);
    setGalatMuat(null);

    ambilFeed(supabase, {
      akunId: akun.id,
      tampilan,
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
        setGalatMuat(pesanGalat(kesalahan, "Komentar gagal dimuat."));
        setKomentar([]);
      })
      .finally(() => {
        if (!batal && nomor === nomorMuat.current) setMemuat(false);
      });

    return () => {
      batal = true;
    };
  }, [supabase, akun.id, tampilan, tab, kueriTertunda, gabungPengguna]);

  useEffect(segarkanStatistik, [segarkanStatistik]);

  async function muatLagi() {
    if (memuatLagi || habis || !kursor) return;
    setMemuatLagi(true);
    try {
      const halaman = await ambilFeed(supabase, {
        akunId: akun.id,
        tampilan,
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
      setPesan(pesanGalat(kesalahan, "Gagal memuat komentar berikutnya."));
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
          : tab === (parentId ? "balasan" : "komentar") && !kueriTertunda;

      if (masukDaftar) setKomentar((sebelum) => [baru, ...sebelum]);
      if (parentId) {
        ubahKomentar(parentId, (k) => ({ ...k, replies: k.replies + 1 }));
      }

      setPesan(parentId ? "Balasan terkirim" : "Komentar terkirim");
      segarkanStatistik();
    } catch (kesalahan) {
      setPesan(pesanGalat(kesalahan, "Komentar gagal dikirim."));
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
      setPesan(pesanGalat(kesalahan, "Suka gagal disimpan."));
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
      setPesan(pesanGalat(kesalahan, "Posting ulang gagal disimpan."));
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
      setPesan("Komentar dihapus");
      segarkanStatistik();
    } catch (kesalahan) {
      setKomentar(sebelumnya);
      setPesan(pesanGalat(kesalahan, "Komentar gagal dihapus."));
    }
  }

  async function salinTautan(id: string) {
    const tautan = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(tautan);
      setPesan("Tautan komentar disalin");
    } catch {
      setPesan("Peramban menolak akses papan klip");
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
    setPesan("Profil diperbarui");
  }

  function mulaiMenulis() {
    setTampilan("beranda");
    requestAnimationFrame(() => {
      const area = komposerRef.current?.querySelector("textarea");
      area?.focus({ preventScroll: true });
      utamaRef.current?.scrollTo({ top: 0 });
      window.scrollTo({ top: 0 });
    });
  }

  function gantiTampilan(berikut: View) {
    setTampilan(berikut);
    setBalasUntuk(null);
    utamaRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }

  /* ----------------------------------------------------------------
     Tampilan
     ---------------------------------------------------------------- */

  const judulDaftar =
    tampilan === "beranda"
      ? "Beranda"
      : (TAB.find((t) => t.kunci === tab)?.label ?? "");

  const daftarPengguna = useMemo(
    () => ({ ...pengguna, [akun.id]: akun }),
    [pengguna, akun],
  );

  /* Basis data yang menentukan, tetapi daftar di layar tetap disaring sendiri
     supaya komentar yang lewat 24 jam hilang tanpa menunggu muat ulang. Jam
     `sekarang` berdetak tiap menit, jadi ini ikut menyegarkan sendiri. */
  const daftar = useMemo(
    () => komentar.filter((k) => sekarang - k.createdAt < MASA_KOMENTAR_MS),
    [komentar, sekarang],
  );

  const teksKosong = kueriTertunda
    ? `Tidak ada komentar yang cocok dengan "${kueriTertunda}".`
    : tampilan === "profil"
      ? tab === "disukai"
        ? "Komentar yang kamu sukai akan muncul di sini."
        : tab === "balasan"
          ? "Balasan yang kamu kirim akan muncul di sini."
          : "Komentar yang kamu tulis akan muncul di sini."
      : "Belum ada komentar sama sekali. Tulis yang pertama.";

  return (
    <div className="kerangka">
      <Sidebar
        tampilan={tampilan}
        onPindah={gantiTampilan}
        onTulis={mulaiMenulis}
        pengguna={akun}
        tema={tema}
        onGantiTema={() => setTema(tema === "gelap" ? "terang" : "gelap")}
        onKeluar={mintaKeluar}
      />

      <main className="utama" ref={utamaRef}>
        <div className="bilah-mobil">
          {tampilan === "profil" ? (
            <button
              type="button"
              className="bulat"
              onClick={() => gantiTampilan("beranda")}
              aria-label="Kembali ke beranda"
            >
              <IkonKembali size={20} />
            </button>
          ) : (
            <span className="bilah-merek">
              <Brand size={26} />
            </span>
          )}

          <span className="bilah-judul">
            {tampilan === "profil" ? akun.name : "Twitter Mini"}
          </span>

          <span className="bilah-aksi">
            <button
              type="button"
              className="bulat"
              onClick={() => setTema(tema === "gelap" ? "terang" : "gelap")}
              aria-label={
                tema === "gelap" ? "Beralih ke tema terang" : "Beralih ke tema gelap"
              }
            >
              {tema === "gelap" ? <IkonMatahari size={20} /> : <IkonBulan size={20} />}
            </button>
            <button
              type="button"
              className="bulat"
              onClick={mintaKeluar}
              aria-label="Keluar dari akun"
            >
              <IkonKeluar size={20} />
            </button>
          </span>
        </div>

        {tamu && (
          <BilahTamu
            onSelesai={() => router.refresh()}
            onKabar={setPesan}
          />
        )}

        {tampilan === "profil" && (
          <div className="kepala-profil">
            <button
              type="button"
              className="bulat"
              onClick={() => gantiTampilan("beranda")}
              aria-label="Kembali ke beranda"
            >
              <IkonKembali size={20} />
            </button>
            <span className="kepala-profil-teks">
              <span className="kepala-profil-nama">{akun.name}</span>
              <span className="kepala-profil-sub">
                {angkaPenuh(statistik.komentar + statistik.balasan)} komentar
              </span>
            </span>
          </div>
        )}

        {tampilan === "profil" && (
          <ProfileHeader
            pengguna={akun}
            jumlahKomentar={statistik.komentar + statistik.balasan}
            jumlahSukaDiterima={statistik.sukaDiterima}
            onSimpan={simpanProfilLokal}
            onKabar={setPesan}
          />
        )}

        {tampilan === "beranda" ? (
          <div className="kepala-kolom">
            <h1 className="kepala-judul">Beranda</h1>
            <p className="kepala-sub">
              {memuat
                ? "Memuat komentar…"
                : `${angkaPenuh(daftar.length)}${habis ? "" : "+"} komentar`}
              <span className="kepala-tanda">
                <IkonJam size={13} />
                Hilang setelah {MASA_KOMENTAR_JAM} jam
              </span>
            </p>
          </div>
        ) : (
          <div className="tab" role="tablist" aria-label="Saringan komentar">
            {TAB.map(({ kunci, label }) => (
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
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="cari cari-mobil">
          <IkonCari size={18} className="cari-ikon" />
          <label className="sr-only" htmlFor="cari-mobil">
            Cari komentar
          </label>
          <input
            id="cari-mobil"
            className="cari-masukan"
            type="search"
            value={kueri}
            onChange={(e) => setKueri(e.target.value)}
            placeholder="Cari komentar"
          />
        </div>

        {tampilan === "beranda" && (
          <div className="komposer-utama" ref={komposerRef}>
            <Composer
              pengguna={akun}
              placeholder="Tulis komentar"
              labelTombol="Kirim"
              onKirim={(teks) => buatKomentar(teks, null)}
            />
          </div>
        )}

        <section className="daftar" aria-label={`Daftar ${judulDaftar.toLowerCase()}`}>
          {memuat ? (
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
              <span className="sr-only">Memuat komentar</span>
            </div>
          ) : galatMuat ? (
            <div className="kosong">
              <h2 className="kosong-judul">Komentar tidak bisa dimuat</h2>
              <p className="kosong-teks">{galatMuat}</p>
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => router.refresh()}
              >
                Coba lagi
              </button>
            </div>
          ) : daftar.length === 0 ? (
            <div className="kosong">
              <Avatar pengguna={akun} ukuran={56} />
              <h2 className="kosong-judul">Belum ada yang ditampilkan</h2>
              <p className="kosong-teks">{teksKosong}</p>
              {kueriTertunda && (
                <button
                  type="button"
                  className="tombol tombol-garis"
                  onClick={() => setKueri("")}
                >
                  Hapus pencarian
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
                      balasTerbuka={balasUntuk === k.id}
                      onSuka={() => alihkanSuka(k.id)}
                      onUlang={() => alihkanUlang(k.id)}
                      onBukaBalas={() =>
                        setBalasUntuk(balasUntuk === k.id ? null : k.id)
                      }
                      onKirimBalasan={(teks) => {
                        buatKomentar(teks, k.id);
                        setBalasUntuk(null);
                      }}
                      onBagikan={() => salinTautan(k.id)}
                      onHapus={() => hapus(k.id)}
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
                    {memuatLagi ? "Memuat…" : "Muat lebih banyak"}
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
        pengguna={akun}
        onKeluar={mintaKeluar}
      />

      {tampilan === "profil" && (
        <button
          type="button"
          className="apung"
          onClick={mulaiMenulis}
          aria-label="Tulis komentar baru"
        >
          <IkonTulis size={22} />
        </button>
      )}

      <BottomNav tampilan={tampilan} onPindah={gantiTampilan} />

      {tanyaKeluar && (
        <div className="tirai" onClick={() => setTanyaKeluar(false)}>
          <div
            className="tanya"
            role="alertdialog"
            aria-labelledby="tanya-judul"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="tanya-judul" id="tanya-judul">
              Keluar dari akun tamu?
            </h2>
            <p className="tanya-teks">
              Akun tamu tidak punya email atau kata sandi, jadi sesi ini tidak
              bisa dimasuki lagi setelah keluar. Komentar yang sudah terkirim
              tetap tampil sampai umurnya habis, tapi kamu tidak akan bisa
              menyuntingnya lagi. Buat akun dulu kalau ingin menyimpannya.
            </p>
            <div className="tanya-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => setTanyaKeluar(false)}
                autoFocus
              >
                Tetap di sini
              </button>
              <button type="button" className="tombol tombol-bahaya" onClick={keluar}>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pesan-wadah" aria-live="polite" role="status">
        {pesan && <div className="pesan">{pesan}</div>}
      </div>
    </div>
  );
}
