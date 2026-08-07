"use client";

import Avatar from "./Avatar";
import { IkonCari, IkonKeluar } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { angkaPenuh, ringkasAngka } from "@/lib/time";
import type { Statistik, User } from "@/lib/types";

type Props = {
  kueri: string;
  onKueri: (nilai: string) => void;
  statistik: Statistik;
  pengguna: User;
  onKeluar: () => void;
};

export default function RightRail({
  kueri,
  onKueri,
  statistik,
  pengguna,
  onKeluar,
}: Props) {
  const { bahasa, t } = useBahasa();

  return (
    <aside className="rel" aria-label={t("rel.label")}>
      <div className="rel-isi">
        <div className="cari">
          <IkonCari size={19} className="cari-ikon" />
          <label className="sr-only" htmlFor="cari-komentar">
            {t("cari.label")}
          </label>
          <input
            id="cari-komentar"
            className="cari-masukan"
            type="search"
            value={kueri}
            onChange={(e) => onKueri(e.target.value)}
            placeholder={t("cari.label")}
          />
        </div>

        <section className="kartu">
          <h2 className="kartu-judul">{t("rel.ringkasan")}</h2>
          <ul className="kartu-daftar">
            <li>
              <span>{t("rel.komentar")}</span>
              <strong>{angkaPenuh(statistik.komentar, bahasa)}</strong>
            </li>
            <li>
              <span>{t("rel.balasan")}</span>
              <strong>{angkaPenuh(statistik.balasan, bahasa)}</strong>
            </li>
            <li>
              <span>{t("rel.disukai")}</span>
              <strong>{angkaPenuh(statistik.disukai, bahasa)}</strong>
            </li>
            <li>
              <span>{t("rel.sukaDiterima")}</span>
              <strong>{ringkasAngka(statistik.sukaDiterima, bahasa)}</strong>
            </li>
            <li>
              <span>{t("rel.ulangDiterima")}</span>
              <strong>{ringkasAngka(statistik.ulangDiterima, bahasa)}</strong>
            </li>
          </ul>
        </section>

        <section className="kartu kartu-akun">
          <div className="akun-baris">
            <Avatar pengguna={pengguna} ukuran={40} />
            <span className="akun-teks">
              <span className="akun-nama">{pengguna.name}</span>
              <span className="akun-handle">@{pengguna.handle}</span>
            </span>
          </div>
          <button
            type="button"
            className="tombol tombol-garis tombol-lebar"
            onClick={onKeluar}
          >
            <IkonKeluar size={18} />
            <span>{t("nav.keluar")}</span>
          </button>
        </section>

        <p className="rel-kaki">{t("rel.kaki")}</p>
      </div>
    </aside>
  );
}
