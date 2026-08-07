"use client";

import Avatar from "./Avatar";
import Brand from "./Brand";
import PemilihBahasa from "./PemilihBahasa";
import LencanaKabar from "./LencanaKabar";
import { IKON_MENU, MENU } from "./menu";
import {
  IkonBulan,
  IkonKeluar,
  IkonMatahari,
  IkonTulis,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { User, View } from "@/lib/types";

type Props = {
  tampilan: View;
  onPindah: (tampilan: View) => void;
  onTulis: () => void;
  pengguna: User;
  belumDibaca: number;
  tema: "terang" | "gelap";
  onGantiTema: () => void;
  onKeluar: () => void;
};

export default function Sidebar({
  tampilan,
  onPindah,
  onTulis,
  pengguna,
  belumDibaca,
  tema,
  onGantiTema,
  onKeluar,
}: Props) {
  const { t } = useBahasa();

  return (
    <header className="samping">
      <div className="samping-isi">
        <div className="samping-merek">
          <Brand size={32} />
          <span className="samping-merek-teks">{t("umum.merek")}</span>
        </div>

        <nav className="samping-menu" aria-label={t("nav.utama")}>
          {MENU.map(({ kunci, label }) => {
            const aktif = tampilan === kunci;
            const Ikon = IKON_MENU[kunci];
            const kabar = kunci === "notifikasi" ? belumDibaca : 0;
            return (
              <button
                key={kunci}
                type="button"
                className={`menu-butir${aktif ? " menu-butir-aktif" : ""}`}
                onClick={() => onPindah(kunci)}
                aria-current={aktif ? "page" : undefined}
              >
                <span className="menu-ikon">
                  <Ikon size={24} aktif={aktif} />
                  <LencanaKabar jumlah={kabar} />
                </span>
                <span className="menu-label">{t(label)}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="menu-butir"
            onClick={onGantiTema}
            aria-label={
              tema === "gelap" ? t("nav.keTemaTerang") : t("nav.keTemaGelap")
            }
          >
            {tema === "gelap" ? <IkonMatahari size={24} /> : <IkonBulan size={24} />}
            <span className="menu-label">
              {tema === "gelap" ? t("nav.temaTerang") : t("nav.temaGelap")}
            </span>
          </button>

          <PemilihBahasa varian="menu" />

          <button
            type="button"
            className="menu-butir"
            onClick={onKeluar}
            aria-label={t("nav.keluarLabel")}
          >
            <IkonKeluar size={24} />
            <span className="menu-label">{t("nav.keluar")}</span>
          </button>
        </nav>

        <button
          type="button"
          className="tombol tombol-utama tombol-tulis"
          onClick={onTulis}
        >
          <IkonTulis size={20} className="tombol-tulis-ikon" />
          <span className="tombol-tulis-teks">{t("nav.tulis")}</span>
        </button>

        <button
          type="button"
          className="samping-akun"
          onClick={() => onPindah("profil")}
          aria-label={t("nav.bukaProfil")}
        >
          <Avatar pengguna={pengguna} ukuran={38} />
          <span className="samping-akun-teks">
            <span className="samping-akun-nama">{pengguna.name}</span>
            <span className="samping-akun-handle">@{pengguna.handle}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
