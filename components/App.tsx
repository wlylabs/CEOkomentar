"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "./Avatar";
import BottomNav from "./BottomNav";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Composer from "./Composer";
import ProfileHeader from "./ProfileHeader";
import RightRail from "./RightRail";
import Sidebar from "./Sidebar";
import {
  IkonBulan,
  IkonCari,
  IkonKembali,
  IkonMatahari,
  IkonTulis,
} from "./Icons";
import { AKUN_SAYA, KOMENTAR_AWAL, PENGGUNA } from "@/lib/data";
import { angkaPenuh } from "@/lib/time";
import type { Comment, Tab, User, View } from "@/lib/types";

const TAB: { kunci: Tab; label: string }[] = [
  { kunci: "komentar", label: "Komentar" },
  { kunci: "balasan", label: "Balasan" },
  { kunci: "disukai", label: "Disukai" },
];

type Tema = "terang" | "gelap";

export default function App() {
  const [akun, setAkun] = useState<User>(PENGGUNA[AKUN_SAYA]);
  const [komentar, setKomentar] = useState<Comment[]>(KOMENTAR_AWAL);
  const [tampilan, setTampilan] = useState<View>("beranda");
  const [tab, setTab] = useState<Tab>("komentar");
  const [kueri, setKueri] = useState("");
  const [balasUntuk, setBalasUntuk] = useState<string | null>(null);
  const [tema, setTema] = useState<Tema>("gelap");
  const [pesan, setPesan] = useState<string | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  const komposerRef = useRef<HTMLDivElement>(null);
  const utamaRef = useRef<HTMLElement>(null);

  /* Tema: ikuti simpanan lokal, jatuh ke preferensi sistem. */
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

  /* Segarkan label waktu relatif tiap menit. */
  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pesan) return;
    const id = window.setTimeout(() => setPesan(null), 2600);
    return () => window.clearTimeout(id);
  }, [pesan]);

  const pengguna = useMemo<Record<string, User>>(
    () => ({ ...PENGGUNA, [AKUN_SAYA]: akun }),
    [akun],
  );

  const jumlahBalasan = useMemo(() => {
    const peta = new Map<string, number>();
    for (const k of komentar) {
      if (k.parentId) peta.set(k.parentId, (peta.get(k.parentId) ?? 0) + 1);
    }
    return peta;
  }, [komentar]);

  const cocokKueri = useCallback(
    (k: Comment) => {
      const cari = kueri.trim().toLowerCase();
      if (!cari) return true;
      const penulis = pengguna[k.authorId];
      return (
        k.text.toLowerCase().includes(cari) ||
        penulis.name.toLowerCase().includes(cari) ||
        penulis.handle.toLowerCase().includes(cari)
      );
    },
    [kueri, pengguna],
  );

  const daftar = useMemo(() => {
    const urut = [...komentar].sort((a, b) => b.createdAt - a.createdAt);

    if (tampilan === "beranda") return urut.filter(cocokKueri);

    if (tab === "komentar") {
      return urut.filter((k) => k.authorId === AKUN_SAYA && !k.parentId).filter(cocokKueri);
    }
    if (tab === "balasan") {
      return urut.filter((k) => k.authorId === AKUN_SAYA && k.parentId).filter(cocokKueri);
    }
    return urut.filter((k) => k.liked).filter(cocokKueri);
  }, [komentar, tampilan, tab, cocokKueri]);

  const statistik = useMemo(() => {
    const milikSaya = komentar.filter((k) => k.authorId === AKUN_SAYA);
    return {
      komentar: milikSaya.filter((k) => !k.parentId).length,
      balasan: milikSaya.filter((k) => k.parentId).length,
      disukai: komentar.filter((k) => k.liked).length,
      sukaDiterima: milikSaya.reduce((jumlah, k) => jumlah + k.likes, 0),
    };
  }, [komentar]);

  function buatKomentar(teks: string, parentId: string | null) {
    const baru: Comment = {
      id: `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      authorId: AKUN_SAYA,
      parentId,
      text: teks,
      createdAt: Date.now(),
      likes: 0,
      reposts: 0,
      liked: false,
      reposted: false,
    };
    setKomentar((sebelum) => [baru, ...sebelum]);
    setPesan(parentId ? "Balasan terkirim" : "Komentar terkirim");
  }

  function ubahKomentar(id: string, ubah: (k: Comment) => Comment) {
    setKomentar((sebelum) => sebelum.map((k) => (k.id === id ? ubah(k) : k)));
  }

  function alihkanSuka(id: string) {
    ubahKomentar(id, (k) => ({
      ...k,
      liked: !k.liked,
      likes: k.likes + (k.liked ? -1 : 1),
    }));
  }

  function alihkanUlang(id: string) {
    ubahKomentar(id, (k) => ({
      ...k,
      reposted: !k.reposted,
      reposts: k.reposts + (k.reposted ? -1 : 1),
    }));
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

  function mulaiMenulis() {
    setTampilan("beranda");
    requestAnimationFrame(() => {
      const area = komposerRef.current?.querySelector("textarea");
      area?.focus();
      utamaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function gantiTampilan(berikut: View) {
    setTampilan(berikut);
    setBalasUntuk(null);
    utamaRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }

  const judulDaftar =
    tampilan === "beranda"
      ? "Beranda"
      : TAB.find((t) => t.kunci === tab)?.label ?? "";

  return (
    <div className="kerangka">
      <Sidebar
        tampilan={tampilan}
        onPindah={gantiTampilan}
        onTulis={mulaiMenulis}
        pengguna={akun}
        tema={tema}
        onGantiTema={() => setTema(tema === "gelap" ? "terang" : "gelap")}
      />

      <main className="utama" ref={utamaRef}>
        {/* Bilah atas khusus layar kecil */}
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

          <button
            type="button"
            className="bulat"
            onClick={() => setTema(tema === "gelap" ? "terang" : "gelap")}
            aria-label={tema === "gelap" ? "Beralih ke tema terang" : "Beralih ke tema gelap"}
          >
            {tema === "gelap" ? <IkonMatahari size={20} /> : <IkonBulan size={20} />}
          </button>
        </div>

        {/* Kepala lengket khusus layar besar saat membuka profil */}
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
            onSimpan={(perubahan) => {
              setAkun((sebelum) => ({ ...sebelum, ...perubahan }));
              setPesan("Profil diperbarui");
            }}
          />
        )}

        {/* Kepala kolom: judul di beranda, tab di profil */}
        {tampilan === "beranda" ? (
          <div className="kepala-kolom">
            <h1 className="kepala-judul">Beranda</h1>
            <p className="kepala-sub">
              {angkaPenuh(daftar.length)} komentar
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

        {/* Pencarian untuk layar kecil dan sedang */}
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
          {daftar.length === 0 ? (
            <div className="kosong">
              <Avatar pengguna={akun} ukuran={56} />
              <h2 className="kosong-judul">Belum ada yang ditampilkan</h2>
              <p className="kosong-teks">
                {kueri.trim()
                  ? `Tidak ada komentar yang cocok dengan "${kueri.trim()}".`
                  : "Komentar yang kamu tulis akan muncul di sini."}
              </p>
              {kueri.trim() && (
                <button type="button" className="tombol tombol-garis" onClick={() => setKueri("")}>
                  Hapus pencarian
                </button>
              )}
            </div>
          ) : (
            daftar.map((k) => {
              const induk = k.parentId
                ? komentar.find((c) => c.id === k.parentId)
                : null;
              return (
                <div className="daftar-butir" id={k.id} key={k.id}>
                  <CommentCard
                    komentar={k}
                    penulis={pengguna[k.authorId]}
                    handleInduk={induk ? pengguna[induk.authorId].handle : null}
                    jumlahBalasan={jumlahBalasan.get(k.id) ?? 0}
                    akunSaya={akun}
                    sekarang={sekarang}
                    balasTerbuka={balasUntuk === k.id}
                    onSuka={() => alihkanSuka(k.id)}
                    onUlang={() => alihkanUlang(k.id)}
                    onBukaBalas={() => setBalasUntuk(balasUntuk === k.id ? null : k.id)}
                    onKirimBalasan={(teks) => {
                      buatKomentar(teks, k.id);
                      setBalasUntuk(null);
                    }}
                    onBagikan={() => salinTautan(k.id)}
                  />
                </div>
              );
            })
          )}
        </section>

        <div className="ruang-bawah" />
      </main>

      <RightRail
        kueri={kueri}
        onKueri={setKueri}
        jumlahKomentar={statistik.komentar}
        jumlahBalasan={statistik.balasan}
        jumlahDisukai={statistik.disukai}
        sukaDiterima={statistik.sukaDiterima}
      />

      {/* Di beranda komposer sudah ada di kolom, jadi tombol apung hanya perlu di profil */}
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

      <div className="pesan-wadah" aria-live="polite" role="status">
        {pesan && <div className="pesan">{pesan}</div>}
      </div>
    </div>
  );
}
