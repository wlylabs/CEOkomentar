"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "./Brand";
import CommentCard from "./CommentCard";
import Kabar, { type IsiKabar, type JenisKabar } from "./Kabar";
import { IkonKembali } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { klienPeramban } from "@/lib/supabase/client";
import {
  ambilKomentar,
  hapusKomentar,
  setSimpan,
  setSuka,
  setUlang,
} from "@/lib/api";
import { MASA_KOMENTAR_JAM } from "@/lib/kebijakan";
import type { Comment, User } from "@/lib/types";

type Isi = { komentar: Comment; pengguna: Record<string, User> };

/**
 * Halaman satu komentar.
 *
 * Berdiri sendiri di rutenya sendiri supaya tautan komentar bisa dibagikan dan
 * dibuka langsung — itu pula yang dituju kabar suka dan posting ulang. Menekan
 * nama atau tagar di sini kembali ke aplikasi utama lewat query string, jadi
 * tidak ada layar profil kedua yang perlu dirawat.
 */
export default function Utas({ id, akun }: { id: string; akun: User }) {
  const router = useRouter();
  const supabase = klienPeramban();
  const { t } = useBahasa();

  const [isi, setIsi] = useState<Isi | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [kabar, setKabar] = useState<IsiKabar | null>(null);
  const [sekarang, setSekarang] = useState(() => Date.now());

  useEffect(() => {
    let batal = false;
    setMemuat(true);

    ambilKomentar(supabase, id, akun.id)
      .then((hasil) => {
        if (!batal) setIsi(hasil);
      })
      .catch(() => {
        if (!batal) setIsi(null);
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

  /* Nomor urut kabar. Dua kali menekan tombol yang sama harus terasa sebagai
     dua kabar, jadi yang membedakannya bukan kalimatnya. */
  const nomorKabar = useRef(0);

  const beriKabar = useCallback((teks: string, jenis: JenisKabar = "info") => {
    nomorKabar.current += 1;
    setKabar({ id: nomorKabar.current, teks, jenis });
  }, []);

  const tutupKabar = useCallback(() => setKabar(null), []);

  const ubah = useCallback((ganti: (k: Comment) => Comment) => {
    setIsi((sebelum) =>
      sebelum ? { ...sebelum, komentar: ganti(sebelum.komentar) } : sebelum,
    );
  }, []);

  async function alihkanSuka() {
    const sebelumnya = isi?.komentar;
    if (!sebelumnya) return;
    const suka = !sebelumnya.liked;

    ubah((k) => ({
      ...k,
      liked: suka,
      likes: Math.max(0, k.likes + (suka ? 1 : -1)),
    }));

    try {
      await setSuka(supabase, sebelumnya.id, akun.id, suka);
    } catch {
      ubah(() => sebelumnya);
      beriKabar(t("galat.suka"), "galat");
    }
  }

  async function alihkanUlang() {
    const sebelumnya = isi?.komentar;
    if (!sebelumnya) return;
    const ulang = !sebelumnya.reposted;

    ubah((k) => ({
      ...k,
      reposted: ulang,
      reposts: Math.max(0, k.reposts + (ulang ? 1 : -1)),
    }));

    try {
      await setUlang(supabase, sebelumnya.id, akun.id, ulang);
    } catch {
      ubah(() => sebelumnya);
      beriKabar(t("galat.ulang"), "galat");
    }
  }

  async function alihkanSimpan() {
    const sebelumnya = isi?.komentar;
    if (!sebelumnya) return;
    const simpan = !sebelumnya.saved;

    ubah((k) => ({ ...k, saved: simpan }));

    try {
      await setSimpan(supabase, sebelumnya.id, akun.id, simpan);
      beriKabar(
        t(simpan ? "pesan.komentarDisimpan" : "pesan.simpananDibuang"),
        "berhasil",
      );
    } catch {
      ubah(() => sebelumnya);
      beriKabar(t("galat.simpan"), "galat");
    }
  }

  /* Menghapus komentar yang jadi pusat halaman berarti halamannya tidak punya
     isi lagi, jadi jalannya pulang ke beranda. */
  async function hapus() {
    if (!isi) return;

    try {
      await hapusKomentar(supabase, isi.komentar.id);
      router.push("/");
    } catch {
      beriKabar(t("galat.hapusKomentar"), "galat");
    }
  }

  async function salinTautan() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      beriKabar(t("pesan.tautanDisalin"), "berhasil");
    } catch {
      beriKabar(t("pesan.papanKlipDitolak"), "galat");
    }
  }

  const penulis = isi
    ? isi.komentar.authorId === akun.id
      ? akun
      : isi.pengguna[isi.komentar.authorId]
    : undefined;

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
            <div className="rangka-butir">
              <span className="rangka-bulat" />
              <span className="rangka-baris">
                <span className="rangka-garis rangka-garis-pendek" />
                <span className="rangka-garis" />
                <span className="rangka-garis rangka-garis-sedang" />
              </span>
            </div>
            <span className="sr-only">{t("utas.memuat")}</span>
          </div>
        ) : !isi || !penulis ? (
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
            <div className="daftar-butir">
              <CommentCard
                komentar={isi.komentar}
                penulis={penulis}
                akunSaya={akun}
                sekarang={sekarang}
                onSuka={alihkanSuka}
                onUlang={alihkanUlang}
                onSimpan={alihkanSimpan}
                onBagikan={salinTautan}
                onHapus={hapus}
                onBukaProfil={(orang) => router.push(`/?profil=${orang.handle}`)}
                onTagar={(tagar) => router.push(`/?tagar=${encodeURIComponent(tagar)}`)}
                onSebut={(handle) => router.push(`/?profil=${handle}`)}
              />
            </div>
          </section>
        )}

        <div className="ruang-bawah" />
      </main>

      <Kabar kabar={kabar} onTutup={tutupKabar} />
    </div>
  );
}
