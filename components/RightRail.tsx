"use client";

import Avatar from "./Avatar";
import JamEmas from "./JamEmas";
import TombolPasang from "./TombolPasang";
import { IkonKeluar, IkonTren } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { angkaPenuh, angkaSosial } from "@/lib/time";
import type { Statistik, Tren, User } from "@/lib/types";

type Props = {
  statistik: Statistik;
  tren: Tren[];
  pengguna: User;
  /** epoch ms dari jam aplikasi; jam emas ikut berdetak bersamanya */
  sekarang: number;
  /** halaman panduan sudah memuat kartu jam emas sendiri di kolom tengah */
  tanpaJam: boolean;
  onTagar: (tagar: string) => void;
  onKeluar: () => void;
};

export default function RightRail({
  statistik,
  tren,
  pengguna,
  sekarang,
  tanpaJam,
  onTagar,
  onKeluar,
}: Props) {
  const { bahasa, t } = useBahasa();

  const angka = (nilai: number) => (
    <strong title={angkaPenuh(nilai, bahasa)}>{angkaSosial(nilai, bahasa)}</strong>
  );

  return (
    <aside className="rel" aria-label={t("rel.label")}>
      <div className="rel-isi">
        {/* Kapan menulis lebih menentukan jangkauan daripada apa pun yang ada
            di kartu-kartu di bawahnya, jadi tempatnya paling atas. Kecuali di
            panduan: di sana kartu yang sama sudah berdiri di kolom tengah, dan
            dua salinan bersebelahan hanya membuat pembacanya ragu apakah
            keduanya menunjukkan hal yang sama. */}
        {!tanpaJam && <JamEmas sekarang={sekarang} />}

        {/* Tren hanya muncul kalau memang ada yang sedang ramai; kartu kosong
            berisi kalimat "belum ada apa-apa" cuma menambah kebisingan. */}
        {tren.length > 0 && (
          <section className="kartu">
            <h2 className="kartu-judul">
              <IkonTren size={16} />
              {t("tren.judul")}
            </h2>
            <ul className="tren-daftar">
              {tren.map((butir) => (
                <li key={butir.tagar}>
                  <button
                    type="button"
                    className="tren-butir"
                    onClick={() => onTagar(butir.tagar)}
                  >
                    <span className="tren-tagar">#{butir.tagar}</span>
                    <span className="tren-jumlah">
                      {t("tren.jumlah", {
                        komentar: angkaSosial(butir.komentar, bahasa),
                        penulis: angkaSosial(butir.penulis, bahasa),
                      })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="kartu-kaki">{t("tren.masa")}</p>
          </section>
        )}

        <section className="kartu">
          <h2 className="kartu-judul">{t("rel.ringkasan")}</h2>
          <ul className="kartu-daftar">
            <li>
              <span>{t("rel.komentar")}</span>
              {angka(statistik.komentar)}
            </li>
            <li>
              <span>{t("rel.disukai")}</span>
              {angka(statistik.disukai)}
            </li>
            <li>
              <span>{t("rel.sukaDiterima")}</span>
              {angka(statistik.sukaDiterima)}
            </li>
            <li>
              <span>{t("rel.ulangDiterima")}</span>
              {angka(statistik.ulangDiterima)}
            </li>
          </ul>
        </section>

        <TombolPasang />

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
        <p className="rel-kaki">{t("rel.kreditAvatar")}</p>
      </div>
    </aside>
  );
}
