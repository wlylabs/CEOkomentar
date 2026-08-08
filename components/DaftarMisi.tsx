"use client";

import {
  IkonBuka,
  IkonCentang,
  IkonJam,
  IkonTerverifikasi,
  IkonX,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { judulLencana } from "@/lib/lencana";
import { AKUN_X, KATALOG, PROFIL_X, type KodeMisi, type Misi } from "@/lib/misi";

type Props = {
  daftar: Misi[];
  memuat: boolean;
  /** misi yang sedang diantar ke X; tombolnya dikunci selama itu */
  menunggu: KodeMisi | null;
  onVerifikasi: (kode: KodeMisi) => void;
};

/**
 * Daftar misi beserta lencana yang dihadiahkannya.
 *
 * Satu kartu per misi, dan kartunya tidak tahu apa-apa tentang X: yang
 * membedakan misi satu dengan lainnya hanya kalimat di katalog dan tombol
 * pemeriksanya. Misi berikutnya cukup menambah barisnya di lib/misi.ts.
 */
export default function DaftarMisi({
  daftar,
  memuat,
  menunggu,
  onVerifikasi,
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
        /* Keadaan ketiga: syaratnya sudah dikerjakan dan tinggal dicocokkan.
           Bukan kegagalan, jadi kartunya tidak boleh terlihat seperti gagal. */
        const ditinjau = misi.status === "menunggu";
        const sibuk = menunggu === misi.kode;

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
              )}
            </p>

            {selesai || ditinjau ? (
              misi.bukti.x_username && (
                <p className="misi-bukti">
                  {t(ditinjau ? "misi.terhubung" : "misi.bukti", {
                    username: misi.bukti.x_username,
                  })}
                </p>
              )
            ) : (
              <ol className="misi-langkah">
                {kata.langkah.map((langkah) => (
                  <li key={langkah}>{t(langkah)}</li>
                ))}
              </ol>
            )}

            <div className="misi-aksi">
              {misi.kode === "ikuti-x" && !selesai && (
                <a
                  className="tombol tombol-garis"
                  href={PROFIL_X}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IkonX size={16} />
                  <span>{t("misi.ikutiX.buka", { akun: AKUN_X })}</span>
                </a>
              )}

              <button
                type="button"
                className={`tombol ${
                  selesai || ditinjau ? "tombol-garis" : "tombol-utama"
                }`}
                onClick={() => onVerifikasi(misi.kode)}
                disabled={sibuk}
              >
                {sibuk ? (
                  t("umum.memproses")
                ) : (
                  <>
                    <span>
                      {t(
                        selesai || ditinjau
                          ? "misi.periksaUlang"
                          : "misi.verifikasi",
                      )}
                    </span>
                    <IkonBuka size={15} />
                  </>
                )}
              </button>
            </div>

            {/* Catatan izin hanya perlu dibaca sebelum izinnya diberikan. */}
            {!selesai && !ditinjau && (
              <p className="misi-catatan">{t("misi.catatanIzin")}</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
