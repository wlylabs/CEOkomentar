"use client";

import { IkonCari } from "./Icons";
import { angkaPenuh, ringkasAngka } from "@/lib/time";

type Props = {
  kueri: string;
  onKueri: (nilai: string) => void;
  jumlahKomentar: number;
  jumlahBalasan: number;
  jumlahDisukai: number;
  sukaDiterima: number;
};

export default function RightRail({
  kueri,
  onKueri,
  jumlahKomentar,
  jumlahBalasan,
  jumlahDisukai,
  sukaDiterima,
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
              <strong>{angkaPenuh(jumlahKomentar)}</strong>
            </li>
            <li>
              <span>Balasan</span>
              <strong>{angkaPenuh(jumlahBalasan)}</strong>
            </li>
            <li>
              <span>Disukai</span>
              <strong>{angkaPenuh(jumlahDisukai)}</strong>
            </li>
            <li>
              <span>Suka diterima</span>
              <strong>{ringkasAngka(sukaDiterima)}</strong>
            </li>
          </ul>
        </section>

        <p className="rel-kaki">
          Twitter Mini — antarmuka contoh dengan dua fitur: profil dan feed komentar.
        </p>
      </div>
    </aside>
  );
}
