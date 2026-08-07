"use client";

import Avatar from "./Avatar";
import { IkonCari, IkonKeluar } from "./Icons";
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
  return (
    <aside className="rel" aria-label="Panel samping">
      <div className="rel-isi">
        <div className="cari">
          <IkonCari size={19} className="cari-ikon" />
          <label className="sr-only" htmlFor="cari-komentar">
            Cari komentar
          </label>
          <input
            id="cari-komentar"
            className="cari-masukan"
            type="search"
            value={kueri}
            onChange={(e) => onKueri(e.target.value)}
            placeholder="Cari komentar"
          />
        </div>

        <section className="kartu">
          <h2 className="kartu-judul">Ringkasan aktivitas</h2>
          <ul className="kartu-daftar">
            <li>
              <span>Komentar</span>
              <strong>{angkaPenuh(statistik.komentar)}</strong>
            </li>
            <li>
              <span>Balasan</span>
              <strong>{angkaPenuh(statistik.balasan)}</strong>
            </li>
            <li>
              <span>Disukai</span>
              <strong>{angkaPenuh(statistik.disukai)}</strong>
            </li>
            <li>
              <span>Suka diterima</span>
              <strong>{ringkasAngka(statistik.sukaDiterima)}</strong>
            </li>
            <li>
              <span>Posting ulang diterima</span>
              <strong>{ringkasAngka(statistik.ulangDiterima)}</strong>
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
          <button type="button" className="tombol tombol-garis tombol-lebar" onClick={onKeluar}>
            <IkonKeluar size={18} />
            <span>Keluar</span>
          </button>
        </section>

        <p className="rel-kaki">
          Twitter Mini — profil dan feed komentar dengan data tersimpan di Supabase.
        </p>
      </div>
    </aside>
  );
}
