"use client";

import Avatar from "./Avatar";
import Brand from "./Brand";
import PemilihBahasa from "./PemilihBahasa";
import {
  IkonBeranda,
  IkonBulan,
  IkonKeluar,
  IkonMatahari,
  IkonProfil,
  IkonTulis,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import type { User, View } from "@/lib/types";

type Props = {
  tampilan: View;
  onPindah: (tampilan: View) => void;
  onTulis: () => void;
  pengguna: User;
  tema: "terang" | "gelap";
  onGantiTema: () => void;
  onKeluar: () => void;
};

const MENU: { kunci: View; label: KunciTeks }[] = [
  { kunci: "beranda", label: "nav.beranda" },
  { kunci: "profil", label: "nav.profil" },
];

export default function Sidebar({
  tampilan,
  onPindah,
  onTulis,
  pengguna,
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
            const Ikon = kunci === "beranda" ? IkonBeranda : IkonProfil;
            return (
              <button
                key={kunci}
                type="button"
                className={`menu-butir${aktif ? " menu-butir-aktif" : ""}`}
                onClick={() => onPindah(kunci)}
                aria-current={aktif ? "page" : undefined}
              >
                <Ikon size={24} aktif={aktif} />
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
