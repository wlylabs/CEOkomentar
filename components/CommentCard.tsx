"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import Avatar from "./Avatar";
import Composer from "./Composer";
import Lencana from "./Lencana";
import TeksKomentar from "./TeksKomentar";
import {
  IkonBagikan,
  IkonBalas,
  IkonJam,
  IkonSampah,
  IkonSimpan,
  IkonSuka,
  IkonUlang,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import { angkaPenuh, angkaSosial, sisaWaktu, waktuLengkap, waktuRelatif } from "@/lib/time";
import type { Comment, User } from "@/lib/types";

type AksiProps = {
  label: string;
  jumlah: number;
  warna: "biru" | "hijau" | "merah";
  aktif?: boolean;
  ditekan?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function Aksi({
  label,
  jumlah,
  warna,
  aktif = false,
  ditekan,
  onClick,
  children,
}: AksiProps) {
  const { bahasa } = useBahasa();

  return (
    <button
      type="button"
      className={`aksi aksi-${warna}${aktif ? " aksi-aktif" : ""}`}
      onClick={onClick}
      aria-label={`${label}${jumlah > 0 ? `, ${jumlah}` : ""}`}
      aria-pressed={ditekan}
      title={label}
    >
      <span className="aksi-ikon">{children}</span>
      {jumlah > 0 && (
        <span className="aksi-jumlah" title={angkaPenuh(jumlah, bahasa)}>
          {angkaSosial(jumlah, bahasa)}
        </span>
      )}
    </button>
  );
}

type Props = {
  komentar: Comment;
  penulis: User;
  akunSaya: User;
  /** epoch ms untuk menghitung label waktu relatif */
  sekarang: number;
  balasTerbuka: boolean;
  /** komentar yang jadi pusat perhatian di halaman utas */
  sorot?: boolean;
  onSuka: () => void;
  onUlang: () => void;
  onSimpan: () => void;
  onBukaBalas: () => void;
  onKirimBalasan: (teks: string) => void;
  onBagikan: () => void;
  onHapus: () => void;
  onBukaProfil: (pengguna: User) => void;
  onTagar: (tagar: string) => void;
  onSebut: (handle: string) => void;
};

export default function CommentCard({
  komentar,
  penulis,
  akunSaya,
  sekarang,
  balasTerbuka,
  sorot = false,
  onSuka,
  onUlang,
  onSimpan,
  onBukaBalas,
  onKirimBalasan,
  onBagikan,
  onHapus,
  onBukaProfil,
  onTagar,
  onSebut,
}: Props) {
  const { bahasa, t } = useBahasa();
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  const milikSaya = komentar.authorId === akunSaya.id;
  /* Admin menghapus komentar orang lain sebagai tindakan moderasi; kebijakan
     RLS di basis data yang benar-benar memutuskan, tombol ini hanya cerminannya. */
  const sebagaiAdmin = !milikSaya && akunSaya.admin;
  const bisaHapus = milikSaya || sebagaiAdmin;
  const sisa = sisaWaktu(komentar.createdAt, MASA_KOMENTAR_MS, sekarang, bahasa);

  return (
    <article className={`komentar${sorot ? " komentar-sorot" : ""}`}>
      <div className="komentar-baris">
        <button
          type="button"
          className="komentar-avatar"
          onClick={() => onBukaProfil(penulis)}
          aria-label={t("profil.buka", { handle: penulis.handle })}
        >
          <Avatar pengguna={penulis} />
        </button>

        <div className="komentar-isi">
          <header className="komentar-kepala">
            <button
              type="button"
              className="komentar-penulis"
              onClick={() => onBukaProfil(penulis)}
            >
              <span className="komentar-nama">{penulis.name}</span>
              <Lencana pengguna={penulis} size={17} />
              <span className="komentar-handle">@{penulis.handle}</span>
            </button>
            <span className="komentar-pemisah" aria-hidden="true">
              ·
            </span>
            <Link className="komentar-tautan-waktu" href={`/komentar/${komentar.id}`}>
              <time
                className="komentar-waktu"
                dateTime={new Date(komentar.createdAt).toISOString()}
                title={waktuLengkap(komentar.createdAt, bahasa)}
                suppressHydrationWarning
              >
                {waktuRelatif(komentar.createdAt, sekarang, bahasa)}
              </time>
            </Link>

            {sisa && (
              <span
                className="komentar-sisa"
                title={t("komentar.terhapusPada", {
                  waktu: waktuLengkap(komentar.createdAt + MASA_KOMENTAR_MS, bahasa),
                })}
              >
                <IkonJam size={13} />
                <span>{sisa}</span>
              </span>
            )}

            {bisaHapus && (
              <button
                type="button"
                className="komentar-hapus"
                onClick={() => setKonfirmasiHapus(true)}
                aria-label={
                  sebagaiAdmin
                    ? t("komentar.hapusLabelAdmin")
                    : t("komentar.hapusLabel")
                }
              >
                <IkonSampah size={17} />
              </button>
            )}
          </header>

          {komentar.parentHandle && (
            <p className="komentar-konteks">
              {t("komentar.membalas")}{" "}
              <button
                type="button"
                className="sebut sebut-tombol"
                onClick={() => onSebut(komentar.parentHandle ?? "")}
              >
                @{komentar.parentHandle}
              </button>
            </p>
          )}

          <TeksKomentar teks={komentar.text} onTagar={onTagar} onSebut={onSebut} />

          {konfirmasiHapus && (
            <div
              className="komentar-konfirmasi"
              role="alertdialog"
              aria-label={t("komentar.konfirmasiLabel")}
            >
              <p>
                {sebagaiAdmin
                  ? t("komentar.konfirmasiAdmin", { handle: penulis.handle })
                  : t("komentar.konfirmasi")}
              </p>
              <div className="komentar-konfirmasi-aksi">
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => setKonfirmasiHapus(false)}
                >
                  {t("umum.batal")}
                </button>
                <button
                  type="button"
                  className="tombol tombol-bahaya"
                  onClick={() => {
                    setKonfirmasiHapus(false);
                    onHapus();
                  }}
                >
                  {t("umum.hapus")}
                </button>
              </div>
            </div>
          )}

          <div className="komentar-aksi">
            <Aksi
              label={t("aksi.balas")}
              jumlah={komentar.replies}
              warna="biru"
              aktif={balasTerbuka}
              onClick={onBukaBalas}
            >
              <IkonBalas size={19} />
            </Aksi>

            <Aksi
              label={komentar.reposted ? t("aksi.batalUlang") : t("aksi.ulang")}
              jumlah={komentar.reposts}
              warna="hijau"
              aktif={komentar.reposted}
              ditekan={komentar.reposted}
              onClick={onUlang}
            >
              <IkonUlang size={19} />
            </Aksi>

            <Aksi
              label={komentar.liked ? t("aksi.batalSuka") : t("aksi.suka")}
              jumlah={komentar.likes}
              warna="merah"
              aktif={komentar.liked}
              ditekan={komentar.liked}
              onClick={onSuka}
            >
              <IkonSuka size={19} terisi={komentar.liked} />
            </Aksi>

            <Aksi
              label={komentar.saved ? t("aksi.batalSimpan") : t("aksi.simpan")}
              jumlah={0}
              warna="biru"
              aktif={komentar.saved}
              ditekan={komentar.saved}
              onClick={onSimpan}
            >
              <IkonSimpan size={19} terisi={komentar.saved} />
            </Aksi>

            <Aksi
              label={t("aksi.salinTautan")}
              jumlah={0}
              warna="biru"
              onClick={onBagikan}
            >
              <IkonBagikan size={19} />
            </Aksi>
          </div>
        </div>
      </div>

      {balasTerbuka && (
        <div className="komentar-balas">
          <Composer
            pengguna={akunSaya}
            placeholder={t("komposer.balasKe", { handle: penulis.handle })}
            labelTombol={t("komposer.balas")}
            kompak
            fokusOtomatis
            onKirim={onKirimBalasan}
            onBatal={onBukaBalas}
          />
        </div>
      )}
    </article>
  );
}
