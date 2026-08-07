"use client";

import { useState, type ReactNode } from "react";
import Avatar from "./Avatar";
import Composer from "./Composer";
import {
  IkonAdmin,
  IkonBagikan,
  IkonBalas,
  IkonJam,
  IkonSampah,
  IkonSuka,
  IkonTerverifikasi,
  IkonUlang,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import { ringkasAngka, sisaWaktu, waktuLengkap, waktuRelatif } from "@/lib/time";
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
    >
      <span className="aksi-ikon">{children}</span>
      {jumlah > 0 && (
        <span className="aksi-jumlah">{ringkasAngka(jumlah, bahasa)}</span>
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
  onSuka: () => void;
  onUlang: () => void;
  onBukaBalas: () => void;
  onKirimBalasan: (teks: string) => void;
  onBagikan: () => void;
  onHapus: () => void;
};

export default function CommentCard({
  komentar,
  penulis,
  akunSaya,
  sekarang,
  balasTerbuka,
  onSuka,
  onUlang,
  onBukaBalas,
  onKirimBalasan,
  onBagikan,
  onHapus,
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
    <article className="komentar">
      <div className="komentar-baris">
        <Avatar pengguna={penulis} />

        <div className="komentar-isi">
          <header className="komentar-kepala">
            <span className="komentar-nama">{penulis.name}</span>
            {penulis.verified && (
              <IkonTerverifikasi className="lencana" size={17} />
            )}
            {penulis.admin && (
              <span className="lencana-admin" title={t("lencana.adminJudul")}>
                <IkonAdmin size={12} />
                {t("lencana.admin")}
              </span>
            )}
            <span className="komentar-handle">@{penulis.handle}</span>
            <span className="komentar-pemisah" aria-hidden="true">
              ·
            </span>
            <time
              className="komentar-waktu"
              dateTime={new Date(komentar.createdAt).toISOString()}
              title={waktuLengkap(komentar.createdAt, bahasa)}
              suppressHydrationWarning
            >
              {waktuRelatif(komentar.createdAt, sekarang, bahasa)}
            </time>

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
              <span className="sebut">@{komentar.parentHandle}</span>
            </p>
          )}

          <p className="komentar-teks">{komentar.text}</p>

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
