"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Composer from "./Composer";
import { IkonKembali } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { klienPeramban } from "@/lib/supabase/client";
import {
  ambilUtas,
  hapusKomentar,
  kirimKomentar,
  setSimpan,
  setSuka,
  setUlang,
  type Utas as IsiUtas,
} from "@/lib/api";
import { MASA_KOMENTAR_JAM } from "@/lib/kebijakan";
import type { Comment, User } from "@/lib/types";

/**
 * Halaman satu komentar: rantai yang dibalasnya di atas, komentarnya sendiri di
 * tengah, balasannya di bawah.
 *
 * Berdiri sendiri di rutenya sendiri supaya tautan komentar bisa dibagikan dan
 * dibuka langsung. Menekan nama atau tagar di sini kembali ke aplikasi utama
 * lewat query string, jadi tidak ada layar profil kedua yang perlu dirawat.
 */
export default function Utas({ id, akun }: { id: string; akun: User }) {
  const router = useRouter();
  const supabase = klienPeramban();
  const { t } = useBahasa();

  const [utas, setUtas] = useState<IsiUtas | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);
  const [balasUntuk, setBalasUntuk] = useState<string | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  useEffect(() => {
    let batal = false;
    setMemuat(true);

    ambilUtas(supabase, id, akun.id)
      .then((hasil) => {
        if (!batal) setUtas(hasil);
      })
      .catch(() => {
        if (!batal) setUtas(null);
      })
      .finally(() => {
        if (!batal) setMemuat(false);
      });

    return () => {
      batal = true;
    };
  }, [supabase, id, akun.id]);

  useEffect(() => {
    const jam = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(jam);
  }, []);

  useEffect(() => {
    if (!pesan) return;
    const jam = window.setTimeout(() => setPesan(null), 2600);
    return () => window.clearTimeout(jam);
  }, [pesan]);

  /* Satu komentar bisa berada di rantai induk, di tengah, atau di daftar
     balasan; perubahannya diterapkan ke ketiganya sekaligus. */
  const ubah = useCallback(
    (idKomentar: string, ganti: (k: Comment) => Comment) => {
      setUtas((sebelum) => {
        if (!sebelum) return sebelum;
        const sesuaikan = (k: Comment) => (k.id === idKomentar ? ganti(k) : k);
        return {
          ...sebelum,
          induk: sebelum.induk.map(sesuaikan),
          komentar: sesuaikan(sebelum.komentar),
          balasan: sebelum.balasan.map(sesuaikan),
        };
      });
    },
    [],
  );

  const semua = useMemo(
    () => (utas ? [...utas.induk, utas.komentar, ...utas.balasan] : []),
    [utas],
  );

  function cari(idKomentar: string) {
    return semua.find((k) => k.id === idKomentar);
  }

  async function alihkanSuka(idKomentar: string) {
    const sebelumnya = cari(idKomentar);
    if (!sebelumnya) return;
    const suka = !sebelumnya.liked;

    ubah(idKomentar, (k) => ({
      ...k,
      liked: suka,
      likes: Math.max(0, k.likes + (suka ? 1 : -1)),
    }));

    try {
      await setSuka(supabase, idKomentar, akun.id, suka);
    } catch {
      ubah(idKomentar, () => sebelumnya);
      setPesan(t("galat.suka"));
    }
  }

  async function alihkanUlang(idKomentar: string) {
    const sebelumnya = cari(idKomentar);
    if (!sebelumnya) return;
    const ulang = !sebelumnya.reposted;

    ubah(idKomentar, (k) => ({
      ...k,
      reposted: ulang,
      reposts: Math.max(0, k.reposts + (ulang ? 1 : -1)),
    }));

    try {
      await setUlang(supabase, idKomentar, akun.id, ulang);
    } catch {
      ubah(idKomentar, () => sebelumnya);
      setPesan(t("galat.ulang"));
    }
  }

  async function alihkanSimpan(idKomentar: string) {
    const sebelumnya = cari(idKomentar);
    if (!sebelumnya) return;
    const simpan = !sebelumnya.saved;

    ubah(idKomentar, (k) => ({ ...k, saved: simpan }));

    try {
      await setSimpan(supabase, idKomentar, akun.id, simpan);
      setPesan(t(simpan ? "pesan.komentarDisimpan" : "pesan.simpananDibuang"));
    } catch {
      ubah(idKomentar, () => sebelumnya);
      setPesan(t("galat.simpan"));
    }
  }

  async function balas(teks: string, parentId: string) {
    try {
      const baru = await kirimKomentar(supabase, akun.id, teks, parentId);
      const induk = cari(parentId);
      baru.parentHandle = induk
        ? (utas?.pengguna[induk.authorId]?.handle ?? akun.handle)
        : null;

      ubah(parentId, (k) => ({ ...k, replies: k.replies + 1 }));
      /* Balasan untuk komentar utama langsung menyusul di bawahnya; balasan
         untuk komentar lain hidup di utasnya sendiri. */
      if (parentId === utas?.komentar.id) {
        setUtas((sebelum) =>
          sebelum ? { ...sebelum, balasan: [...sebelum.balasan, baru] } : sebelum,
        );
      }

      setBalasUntuk(null);
      setPesan(t("pesan.balasanTerkirim"));
    } catch {
      setPesan(t("galat.kirimKomentar"));
    }
  }

  async function hapus(idKomentar: string) {
    try {
      await hapusKomentar(supabase, idKomentar);

      /* Menghapus komentar yang jadi pusat halaman berarti halamannya tidak
         punya isi lagi. */
      if (idKomentar === utas?.komentar.id) {
        router.push("/");
        return;
      }

      setUtas((sebelum) =>
        sebelum
          ? {
              ...sebelum,
              balasan: sebelum.balasan.filter((k) => k.id !== idKomentar),
              komentar: {
                ...sebelum.komentar,
                replies: Math.max(0, sebelum.komentar.replies - 1),
              },
            }
          : sebelum,
      );
      setPesan(t("pesan.komentarDihapus"));
    } catch {
      setPesan(t("galat.hapusKomentar"));
    }
  }

  async function salinTautan(idKomentar: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/komentar/${idKomentar}`,
      );
      setPesan(t("pesan.tautanDisalin"));
    } catch {
      setPesan(t("pesan.papanKlipDitolak"));
    }
  }

  /* Induk yang sudah ada di halaman ini cukup digulir ke tempatnya; yang tidak
     ikut termuat — rantainya lebih panjang dari yang ditelusuri — dibuka di
     halamannya sendiri. */
  function bukaInduk(indukId: string) {
    const dihalaman = semua.some((k) => k.id === indukId);
    if (!dihalaman) {
      router.push(`/komentar/${indukId}`);
      return;
    }
    document
      .getElementById(indukId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function kartu(komentar: Comment, kedalaman: number, sorot = false) {
    const penulis =
      komentar.authorId === akun.id
        ? akun
        : utas?.pengguna[komentar.authorId];
    if (!penulis) return null;

    return (
      <div className="daftar-butir" id={komentar.id} key={komentar.id}>
        <CommentCard
          komentar={komentar}
          penulis={penulis}
          akunSaya={akun}
          sekarang={sekarang}
          kedalaman={kedalaman}
          sorot={sorot}
          balasTerbuka={balasUntuk === komentar.id}
          onSuka={() => alihkanSuka(komentar.id)}
          onUlang={() => alihkanUlang(komentar.id)}
          onSimpan={() => alihkanSimpan(komentar.id)}
          onBukaBalas={() =>
            setBalasUntuk(balasUntuk === komentar.id ? null : komentar.id)
          }
          onKirimBalasan={(teks) => balas(teks, komentar.id)}
          onBagikan={() => salinTautan(komentar.id)}
          onHapus={() => hapus(komentar.id)}
          onBukaProfil={(orang) => router.push(`/?profil=${orang.handle}`)}
          onBukaInduk={bukaInduk}
          onTagar={(tagar) => router.push(`/?tagar=${encodeURIComponent(tagar)}`)}
          onSebut={(handle) => router.push(`/?profil=${handle}`)}
        />
      </div>
    );
  }

  return (
    <div className="kerangka kerangka-tunggal">
      <main className="utama utama-tunggal">
        <div className="bilah-mobil bilah-tunggal">
          <button
            type="button"
            className="bulat"
            onClick={() => router.push("/")}
            aria-label={t("nav.kembali")}
          >
            <IkonKembali size={20} />
          </button>
          <span className="bilah-judul">{t("utas.judul")}</span>
          <span className="bilah-merek bilah-merek-kanan">
            <Brand size={24} />
          </span>
        </div>

        {memuat ? (
          <div className="rangka" aria-hidden="true">
            {[0, 1].map((i) => (
              <div className="rangka-butir" key={i}>
                <span className="rangka-bulat" />
                <span className="rangka-baris">
                  <span className="rangka-garis rangka-garis-pendek" />
                  <span className="rangka-garis" />
                  <span className="rangka-garis rangka-garis-sedang" />
                </span>
              </div>
            ))}
            <span className="sr-only">{t("utas.memuat")}</span>
          </div>
        ) : !utas ? (
          <div className="kosong">
            <h1 className="kosong-judul">{t("utas.takAdaJudul")}</h1>
            <p className="kosong-teks">
              {t("utas.takAdaTeks", { jam: MASA_KOMENTAR_JAM })}
            </p>
            <button
              type="button"
              className="tombol tombol-garis"
              onClick={() => router.push("/")}
            >
              {t("utas.keBeranda")}
            </button>
          </div>
        ) : (
          <section className="daftar" aria-label={t("utas.judul")}>
            {utas.induk.map((k, i) => kartu(k, i))}
            {kartu(utas.komentar, utas.induk.length, true)}

            <div className="komposer-utama">
              <Composer
                pengguna={akun}
                placeholder={t("komposer.balasKe", {
                  handle: utas.pengguna[utas.komentar.authorId]?.handle ?? "",
                })}
                labelTombol={t("komposer.balas")}
                onKirim={(teks) => balas(teks, utas.komentar.id)}
              />
            </div>

            <h2 className="utas-judul">{t("utas.balasan")}</h2>

            {utas.balasan.length === 0 ? (
              <p className="utas-kosong">{t("utas.kosong")}</p>
            ) : (
              utas.balasan.map((k) => kartu(k, utas.induk.length + 1))
            )}
          </section>
        )}

        <div className="ruang-bawah" />
      </main>

      <div className="pesan-wadah" aria-live="polite" role="status">
        {pesan && <div className="pesan">{pesan}</div>}
      </div>
    </div>
  );
}
