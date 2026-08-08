"use client";

import { useId, useState } from "react";
import {
  IkonBagikan,
  IkonCentang,
  IkonJam,
  IkonTerverifikasi,
  IkonTulis,
  IkonX,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { judulLencana } from "@/lib/lencana";
import {
  AKUN_X,
  KATALOG,
  KLAIM,
  PROFIL_X,
  TAGAR_KLAIM,
  bacaProfilX,
  tautanProfilX,
  teksKlaim,
  type Misi,
} from "@/lib/misi";

type Props = {
  daftar: Misi[];
  memuat: boolean;
  /** menyalin kalimat klaim ke papan klip */
  onSalin: (teks: string) => void;
  /** membawa kalimat klaim ke kotak tulis di beranda */
  onTulis: (teks: string) => void;
};

/**
 * Daftar misi beserta lencana yang dihadiahkannya.
 *
 * Satu kartu per misi, dan kartunya tidak tahu apa-apa tentang X: yang
 * membedakan misi satu dengan lainnya hanya kalimat di katalog dan cara
 * pengajuannya. Misi berikutnya cukup menambah barisnya di lib/misi.ts.
 */
export default function DaftarMisi({
  daftar,
  memuat,
  onSalin,
  onTulis,
}: Props) {
  const { t } = useBahasa();

  if (memuat) {
    return (
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
        <span className="sr-only">{t("misi.memuat")}</span>
      </div>
    );
  }

  if (daftar.length === 0) {
    return (
      <div className="kosong">
        <h2 className="kosong-judul">{t("misi.kosongJudul")}</h2>
        <p className="kosong-teks">{t("misi.kosongTeks")}</p>
      </div>
    );
  }

  return (
    <div className="misi-daftar">
      {daftar.map((misi) => {
        const kata = KATALOG[misi.kode];
        const selesai = misi.status === "selesai";
        /* Keadaan ketiga: syaratnya sudah diajukan dan tinggal diputuskan.
           Bukan kegagalan, jadi kartunya tidak boleh terlihat seperti gagal. */
        const ditinjau = misi.status === "menunggu";

        return (
          <article
            className={`misi${selesai ? " misi-selesai" : ""}`}
            key={misi.kode}
          >
            <header className="misi-kepala">
              <span
                className={`misi-lencana lencana-${misi.lencana}`}
                aria-hidden="true"
              >
                <IkonTerverifikasi size={26} />
              </span>

              <span className="misi-judul-teks">
                <h2 className="misi-judul">{t(kata.judul)}</h2>
                <span className="misi-hadiah">
                  {t("misi.hadiah", { lencana: t(judulLencana(misi.lencana)) })}
                </span>
              </span>

              <span
                className={`misi-tanda${selesai ? " misi-tanda-selesai" : ""}${
                  ditinjau ? " misi-tanda-ditinjau" : ""
                }`}
              >
                {selesai && <IkonCentang size={14} />}
                {ditinjau && <IkonJam size={13} />}
                {t(
                  selesai
                    ? "misi.status.selesai"
                    : ditinjau
                      ? "misi.status.menunggu"
                      : "misi.status.belum",
                )}
              </span>
            </header>

            <p className="misi-teks">
              {t(
                selesai
                  ? kata.selesai
                  : ditinjau
                    ? (kata.menunggu ?? kata.teks)
                    : kata.teks,
                { akun: AKUN_X },
              )}
            </p>

            {selesai ? (
              <p className="misi-bukti">
                {misi.bukti.x_username
                  ? t("misi.bukti", { username: misi.bukti.x_username })
                  : t("misi.buktiAdmin")}
              </p>
            ) : (
              <>
                {/* Isian yang tidak dipakai sebuah kalimat dibiarkan lewat
                    begitu saja, jadi seluruh langkah boleh dikirimi yang sama. */}
                <ol className="misi-langkah">
                  {kata.langkah.map((langkah) => (
                    <li key={langkah}>
                      {t(langkah, { akun: AKUN_X, tagar: TAGAR_KLAIM })}
                    </li>
                  ))}
                </ol>

                {misi.kode === "ikuti-x" && (
                  <KlaimIkutiX onSalin={onSalin} onTulis={onTulis} />
                )}
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

/**
 * Pengajuan misi "ikuti-x": satu kotak untuk tautan profil X, satu pratinjau
 * kalimat yang akan diposting, dan dua jalan mengirimkannya.
 *
 * Tidak ada tombol yang menjanjikan verifikasi di sini, karena tidak ada yang
 * bisa memverifikasinya secara otomatis: X tidak lagi memberi aplikasi
 * self-serve akses ke daftar "mengikuti" siapa pun. Yang memutuskan adalah
 * admin, dan komentar inilah pengajuannya — kalimat tetap yang gampang dicari
 * di beranda, dengan tautan profil yang bisa dicocokkan ke daftar pengikut akun
 * resmi (`AKUN_X` di lib/misi.ts).
 */
function KlaimIkutiX({
  onSalin,
  onTulis,
}: {
  onSalin: (teks: string) => void;
  onTulis: (teks: string) => void;
}) {
  const { t } = useBahasa();
  const [isian, setIsian] = useState("");
  const idKotak = useId();

  const handle = bacaProfilX(isian);
  const kosong = isian.trim().length === 0;
  /* Kalimatnya tetap diperlihatkan sebelum tautannya diisi; yang belum ada
     ditandai sebagai isian, bukan disembunyikan. */
  const teks = handle ? teksKlaim(handle) : KLAIM;

  return (
    <div className="klaim">
      <label className="klaim-label" htmlFor={idKotak}>
        {t("misi.klaim.label")}
      </label>
      <input
        id={idKotak}
        className="klaim-isian"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder={t("misi.klaim.bayangan")}
        value={isian}
        onChange={(e) => setIsian(e.target.value)}
      />

      {!kosong && !handle && (
        <p className="klaim-galat" role="alert">
          {t("misi.klaim.asing")}
        </p>
      )}

      <p className="klaim-pratinjau">
        <span>{KLAIM}</span>
        <span className={handle ? "klaim-tautan" : "klaim-tautan klaim-kurang"}>
          {handle ? tautanProfilX(handle) : t("misi.klaim.kurang")}
        </span>
      </p>

      <div className="misi-aksi">
        <a
          className="tombol tombol-garis"
          href={PROFIL_X}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IkonX size={16} />
          <span>{t("misi.ikutiX.buka", { akun: AKUN_X })}</span>
        </a>

        <button
          type="button"
          className="tombol tombol-garis"
          onClick={() => onSalin(teks)}
          disabled={!handle}
        >
          <IkonBagikan size={15} />
          <span>{t("misi.klaim.salin")}</span>
        </button>

        <button
          type="button"
          className="tombol tombol-utama"
          onClick={() => onTulis(teks)}
          disabled={!handle}
        >
          <IkonTulis size={15} />
          <span>{t("misi.klaim.tulis")}</span>
        </button>
      </div>

      <p className="misi-catatan">
        {t("misi.klaim.catatan", { akun: AKUN_X })}
      </p>
    </div>
  );
}
