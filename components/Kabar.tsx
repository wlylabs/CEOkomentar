"use client";

import { useEffect, useState } from "react";
import { IkonCentang, IkonInfo, IkonPeringatan, IkonTutup } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

export type JenisKabar = "info" | "berhasil" | "galat";

export type IsiKabar = {
  /* Nomor urut, bukan isinya, yang menandai kabar baru — dua kali menekan
     tombol simpan harus memunculkan kabar kedua meski kalimatnya sama. */
  id: number;
  teks: string;
  jenis: JenisKabar;
};

/* Kabar galat kerap berupa kalimat panjang dari Supabase, jadi diberi waktu
   baca lebih lama daripada konfirmasi dua kata. */
const MASA: Record<JenisKabar, number> = {
  berhasil: 2800,
  info: 3400,
  galat: 5200,
};

/** Harus sama dengan lama transisi .kabar di globals.css. */
const MASA_KELUAR = 200;

const IKON = {
  berhasil: IkonCentang,
  info: IkonInfo,
  galat: IkonPeringatan,
};

type Props = {
  kabar: IsiKabar | null;
  /** Dipanggil saat kabar sudah habis waktunya atau ditutup pemakai. */
  onTutup: () => void;
};

/**
 * Kabar sekilas di sudut bawah layar.
 *
 * Kartunya bertahan di pohon sebentar setelah `kabar` menjadi null supaya
 * animasi keluarnya sempat berjalan; tanpa itu kartunya lenyap begitu saja dan
 * terlihat seperti kedipan.
 */
export default function Kabar({ kabar, onTutup }: Props) {
  const { t } = useBahasa();

  /* Salinan lokal yang tetap dirender selama kartunya beranimasi keluar. */
  const [isi, setIsi] = useState<IsiKabar | null>(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    if (!kabar) return;
    setIsi(kabar);

    /* Dua bingkai: yang pertama memasang kartu dalam keadaan tersembunyi, yang
       kedua menyalakannya. Tanpa jeda itu peramban menghitung kedua keadaan
       sebagai satu, dan transisi masuknya tidak pernah berjalan. */
    const bingkai = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTampil(true));
    });
    const jam = window.setTimeout(onTutup, MASA[kabar.jenis]);

    return () => {
      cancelAnimationFrame(bingkai);
      window.clearTimeout(jam);
    };
  }, [kabar, onTutup]);

  useEffect(() => {
    if (kabar) return;
    setTampil(false);
    const jam = window.setTimeout(() => setIsi(null), MASA_KELUAR);
    return () => window.clearTimeout(jam);
  }, [kabar]);

  const Ikon = isi ? IKON[isi.jenis] : null;

  return (
    <div className="kabar-wadah">
      {/* Wadahnya tetap ada sejak awal supaya pembaca layar mengumumkan
          kalimat yang masuk belakangan. */}
      <div className="kabar-siar" role="status" aria-live="polite">
        {isi?.teks}
      </div>

      {isi && Ikon && (
        <div
          className="kabar"
          data-jenis={isi.jenis}
          data-tampil={tampil ? "ya" : undefined}
        >
          <span className="kabar-ikon" aria-hidden="true">
            <Ikon size={18} />
          </span>
          <p className="kabar-teks">{isi.teks}</p>
          <button
            type="button"
            className="kabar-tutup"
            onClick={onTutup}
            aria-label={t("pesan.tutup")}
          >
            <IkonTutup size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
