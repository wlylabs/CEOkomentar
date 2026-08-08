"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import Avatar from "./Avatar";
import { IkonTautan, IkonTutup, IkonX } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import {
  alamatAsing,
  alamatRingkas,
  cariAlamat,
  petikTautanX,
  uraiTautanX,
  type TautanX,
} from "@/lib/tautan";
import type { User } from "@/lib/types";

const BATAS = 280;

/**
 * Tulisan yang dituangkan dari luar — sejauh ini dari kartu misi, yang menyiapkan
 * kalimat klaim beserta tautan profilnya. `nomor` yang membedakan dua tuangan
 * berisi kalimat yang sama persis; tanpa itu menekan tombolnya dua kali tidak
 * akan terasa apa-apa setelah tulisannya sempat disunting.
 */
export type Draf = { teks: string; nomor: number };

type Props = {
  pengguna: User;
  /** teks bayangan; bila kosong dipakai ajakan bawaan */
  placeholder?: string;
  labelTombol?: string;
  draf?: Draf | null;
  onKirim: (teks: string) => void;
};

export default function Composer({
  pengguna,
  placeholder,
  labelTombol,
  draf,
  onKirim,
}: Props) {
  const { t, tk } = useBahasa();
  const bayangan = placeholder ?? t("komposer.bawaan");
  const [teks, setTeks] = useState("");
  /* Tautan X yang dilampirkan berdiri terpisah dari isi tulisan sampai saat
     dikirim. Dipisah begitu, ia bisa dicabut dengan satu tekan tanpa merusak
     kalimat, dan pratinjaunya bisa ditunjukkan sebelum komentarnya terkirim. */
  const [tautan, setTautan] = useState<TautanX | null>(null);
  const [kotakTerbuka, setKotakTerbuka] = useState(false);
  const [isiKotak, setIsiKotak] = useState("");
  const [galat, setGalat] = useState<string | null>(null);

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const kotakRef = useRef<HTMLInputElement>(null);
  const idArea = useId();
  const idKotak = useId();

  /* Tautan ikut dihitung karena ia ikut terkirim sebagai bagian isi komentar,
     dan basis data yang membatasi 280 karakter menghitungnya juga. */
  const panjangTautan = tautan ? tautan.url.length + 1 : 0;
  const terpakai = teks.length + panjangTautan;
  const sisa = BATAS - terpakai;
  const kosong = teks.trim().length === 0 && !tautan;
  const lewatBatas = sisa < 0;
  const asing = alamatAsing(teks);
  const bisaKirim = !kosong && !lewatBatas && asing.length === 0;

  const sesuaikanTinggi = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  /* Tuangan dari luar menimpa isi kotak, bukan menambahinya: yang mengirimnya
     adalah tombol yang menjanjikan satu kalimat utuh. Tautan X di dalamnya
     dipisah menjadi lampiran supaya kartu pratinjaunya berdiri seperti biasa. */
  const nomorDraf = useRef(0);

  useEffect(() => {
    if (!draf || draf.nomor === nomorDraf.current) return;
    nomorDraf.current = draf.nomor;

    const { teks: isi, tautan: lampiran } = petikTautanX(draf.teks);
    setTeks(isi);
    setTautan(lampiran);
    setGalat(null);
    setKotakTerbuka(false);
    setIsiKotak("");

    requestAnimationFrame(() => {
      areaRef.current?.setSelectionRange(isi.length, isi.length);
      sesuaikanTinggi();
    });
  }, [draf, sesuaikanTinggi]);

  function ubah(e: ChangeEvent<HTMLTextAreaElement>) {
    setTeks(e.target.value);
    setGalat(alamatAsing(e.target.value).length > 0 ? t("komposer.tautanAsing") : null);
    sesuaikanTinggi();
  }

  /** Menyisipkan potongan teks di tempat kursor berada, bukan di ujung. */
  function sisipkan(potong: string) {
    const el = areaRef.current;

    if (!el) {
      setTeks((sebelum) => sebelum + potong);
      return;
    }

    const awal = el.selectionStart ?? teks.length;
    const akhir = el.selectionEnd ?? awal;
    setTeks(teks.slice(0, awal) + potong + teks.slice(akhir));

    requestAnimationFrame(() => {
      const titik = awal + potong.length;
      el.setSelectionRange(titik, titik);
      sesuaikanTinggi();
    });
  }

  /**
   * Tempelan yang memuat alamat ditangani sendiri: yang berpangkal di X jadi
   * lampiran, yang lain ditolak sebelum sempat masuk. Tempelan tanpa alamat
   * sama sekali dibiarkan lewat seperti biasa.
   */
  function tempel(e: ClipboardEvent<HTMLTextAreaElement>) {
    const jatuhan = e.clipboardData.getData("text");
    const alamat = cariAlamat(jatuhan);
    if (alamat.length === 0) return;

    e.preventDefault();

    /* Satu alamat asing sudah cukup untuk menolak seluruh tempelan. Menyaring
       diam-diam lebih buruk: yang menempel mengira tautannya ikut terbawa. */
    const terurai = alamat.map((satu) => uraiTautanX(satu));
    const pertama = terurai[0];

    if (!pertama || terurai.some((hasil) => hasil === null)) {
      setGalat(t("komposer.tautanAsing"));
      return;
    }

    /* Yang pindah ke lampiran hanya alamat pertama; kalimat yang ikut tersalin
       masuk apa adanya, lengkap dengan tautan X lain yang mungkin ada di
       dalamnya — tidak ada yang hilang diam-diam. */
    const sisaTempelan = jatuhan
      .replace(alamat[0], "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    setTautan(pertama);
    setGalat(null);
    setKotakTerbuka(false);
    setIsiKotak("");
    sisipkan(sisaTempelan);
  }

  function lampirkanDariKotak() {
    const hasil = uraiTautanX(isiKotak);

    if (!hasil) {
      setGalat(t("komposer.tautanAsing"));
      kotakRef.current?.focus();
      return;
    }

    setTautan(hasil);
    setGalat(null);
    setIsiKotak("");
    setKotakTerbuka(false);
    areaRef.current?.focus();
  }

  function alihkanKotak() {
    setGalat(null);

    if (kotakTerbuka) {
      setKotakTerbuka(false);
      setIsiKotak("");
      return;
    }

    setKotakTerbuka(true);
    requestAnimationFrame(() => kotakRef.current?.focus());
  }

  function kirim() {
    if (!bisaKirim) return;

    /* Tautan menempel di baris terakhir supaya kalimatnya tetap utuh terbaca
       dan kartu pratinjaunya berdiri di bawah, sama seperti di X. */
    const isi = [teks.trim(), tautan?.url].filter(Boolean).join("\n");

    onKirim(isi);
    setTeks("");
    setTautan(null);
    setIsiKotak("");
    setKotakTerbuka(false);
    setGalat(null);
    requestAnimationFrame(sesuaikanTinggi);
  }

  function tombol(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      kirim();
    }
  }

  const rasio = Math.min(terpakai / BATAS, 1);
  const keliling = 2 * Math.PI * 9;

  return (
    <form
      className="komposer"
      onSubmit={(e) => {
        e.preventDefault();
        kirim();
      }}
    >
      <Avatar pengguna={pengguna} ukuran={44} />

      <div className="komposer-badan">
        <label className="sr-only" htmlFor={idArea}>
          {bayangan}
        </label>
        <textarea
          id={idArea}
          ref={areaRef}
          className="komposer-area"
          value={teks}
          onChange={ubah}
          onKeyDown={tombol}
          onPaste={tempel}
          placeholder={bayangan}
          rows={2}
          maxLength={BATAS + 40}
        />

        {tautan && (
          <div className="komposer-lampiran">
            <span className="komposer-lampiran-lambang">
              <IkonX size={15} />
            </span>
            <span className="komposer-lampiran-alamat">
              {alamatRingkas(tautan.url)}
            </span>
            <button
              type="button"
              className="komposer-lampiran-buang"
              onClick={() => setTautan(null)}
              aria-label={t("komposer.tautanBuang")}
              title={t("komposer.tautanBuang")}
            >
              <IkonTutup size={15} />
            </button>
          </div>
        )}

        {kotakTerbuka && (
          <div className="komposer-kotak">
            <label className="sr-only" htmlFor={idKotak}>
              {t("komposer.tautanLabel")}
            </label>
            <input
              id={idKotak}
              ref={kotakRef}
              className="komposer-kotak-isian"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={isiKotak}
              placeholder={t("komposer.tautanBayangan")}
              onChange={(e) => {
                setIsiKotak(e.target.value);
                setGalat(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  lampirkanDariKotak();
                }
                if (e.key === "Escape") alihkanKotak();
              }}
            />
            <button
              type="button"
              className="tombol tombol-garis tombol-kecil"
              onClick={lampirkanDariKotak}
              disabled={isiKotak.trim().length === 0}
            >
              {t("komposer.tautanLampir")}
            </button>
          </div>
        )}

        {galat && (
          <p className="komposer-galat" role="status">
            {galat}
          </p>
        )}

        <div className="komposer-kaki">
          <div className="komposer-alat">
            <button
              type="button"
              className={`komposer-tautan${kotakTerbuka ? " komposer-tautan-aktif" : ""}`}
              onClick={alihkanKotak}
              aria-expanded={kotakTerbuka}
              aria-label={t("komposer.tautanLabel")}
              title={t("komposer.tautanLabel")}
            >
              <IkonTautan size={18} />
              <span className="komposer-tautan-teks">{t("komposer.tautan")}</span>
            </button>

            <p className="komposer-petunjuk">{tk("komposer.petunjuk")}</p>
          </div>

          <div className="komposer-kanan">
            {terpakai > 0 && (
              <span
                className={`hitungan${lewatBatas ? " hitungan-lebih" : ""}`}
                aria-live="polite"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="var(--garis)"
                    strokeWidth="2.2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray={keliling}
                    strokeDashoffset={keliling * (1 - rasio)}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                {sisa <= 20 && (
                  <span className="hitungan-angka">{sisa}</span>
                )}
                <span className="sr-only">
                  {t("komposer.sisa", { sisa })}
                </span>
              </span>
            )}

            <button type="submit" className="tombol tombol-utama" disabled={!bisaKirim}>
              {labelTombol ?? t("komposer.kirim")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
