"use client";

import Avatar from "./Avatar";
import Brand from "./Brand";
import {
  IkonBeranda,
  IkonBulan,
  IkonKeluar,
  IkonMatahari,
  IkonProfil,
  IkonTulis,
} from "./Icons";
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

const MENU: { kunci: View; label: string }[] = [
  { kunci: "beranda", label: "Beranda" },
  { kunci: "profil", label: "Profil" },
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
  return (
    <header className="samping">
      <div className="samping-isi">
        <div className="samping-merek">
          <Brand size={32} />
          <span className="samping-merek-teks">Twitter Mini</span>
        </div>

        <nav className="samping-menu" aria-label="Navigasi utama">
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
                <span className="menu-label">{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="menu-butir"
            onClick={onGantiTema}
            aria-label={
              tema === "gelap" ? "Beralih ke tema terang" : "Beralih ke tema gelap"
            }
          >
            {tema === "gelap" ? <IkonMatahari size={24} /> : <IkonBulan size={24} />}
            <span className="menu-label">
              {tema === "gelap" ? "Tema terang" : "Tema gelap"}
            </span>
          </button>

          <button
            type="button"
            className="menu-butir"
            onClick={onKeluar}
            aria-label="Keluar dari akun"
          >
            <IkonKeluar size={24} />
            <span className="menu-label">Keluar</span>
          </button>
        </nav>

        <button
          type="button"
          className="tombol tombol-utama tombol-tulis"
          onClick={onTulis}
        >
          <IkonTulis size={20} className="tombol-tulis-ikon" />
          <span className="tombol-tulis-teks">Tulis komentar</span>
        </button>

        <button
          type="button"
          className="samping-akun"
          onClick={() => onPindah("profil")}
          aria-label="Buka profil"
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
