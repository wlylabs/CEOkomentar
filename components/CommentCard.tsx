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
  IkonTayang,
  IkonUlang,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { jangkauan } from "@/lib/jangkauan";
import { MASA_KOMENTAR_MS } from "@/lib/kebijakan";
import { KEDALAMAN_MAKS } from "@/lib/utas";
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
  /** 0 untuk komentar utama, naik satu tiap tingkat balasan */
  kedalaman?: number;
  onSuka: () => void;
  onUlang: () => void;
  onSimpan: () => void;
  onBukaBalas: () => void;
  onKirimBalasan: (teks: string) => void;
  onBagikan: () => void;
  onHapus: () => void;
  onBukaProfil: (pengguna: User) => void;
  onBukaInduk: (indukId: string) => void;
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
  kedalaman = 0,
  onSuka,
  onUlang,
  onSimpan,
  onBukaBalas,
  onKirimBalasan,
  onBagikan,
  onHapus,
  onBukaProfil,
  onBukaInduk,
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
  /* Balasan dan komentar awal dulu tampil serupa, jadi daftar campuran sulit
     dibaca. Balasan kini lebih kecil dalam segala hal, menjorok sedalam
     tingkatnya, bergaris tepi, dan menyebut yang dibalas di baris paling atas —
     sebelum nama penulisnya, bukan di tengah kartu. */
  const balasan = komentar.parentId !== null;
  const tingkat = balasan ? Math.min(Math.max(kedalaman, 1), KEDALAMAN_MAKS) : 0;

  /* Angka sebenarnya dari basis data ditambah jangkauan yang tumbuh seiring
     umur komentar. Yang ditambah hanya tampilannya — tombol suka dan posting
     ulang tetap bekerja pada angka asli, jadi menekannya tetap menggeser satu. */
  const tambahan = jangkauan(komentar, penulis, sekarang);
  const jumlahSuka = komentar.likes + tambahan.suka;
  const jumlahUlang = komentar.reposts + tambahan.ulang;

  const ikonAksi = balasan ? 17 : 19;

  return (
    <article
      className={`komentar${balasan ? ` komentar-balasan komentar-tingkat-${tingkat}` : ""}${sorot ? " komentar-sorot" : ""}`}
    >
      {balasan && (
        /* Menekan baris ini membuka komentar yang dibalas, bukan profil orang
           yang menulisnya — dari sebuah balasan, yang dicari hampir selalu
           percakapan asalnya. */
        <button
          type="button"
          className="komentar-konteks"
          onClick={() => komentar.parentId && onBukaInduk(komentar.parentId)}
          title={t("komentar.bukaInduk")}
        >
          <IkonBalas size={13} />
          {komentar.parentHandle ? (
            <span>
              {t("komentar.membalas")}{" "}
              <span className="sebut">@{komentar.parentHandle}</span>
            </span>
          ) : (
            <span>{t("komentar.balasan")}</span>
          )}
        </button>
      )}

      <div className="komentar-baris">
        <button
          type="button"
          className="komentar-avatar"
          onClick={() => onBukaProfil(penulis)}
          aria-label={t("profil.buka", { handle: penulis.handle })}
        >
          <Avatar pengguna={penulis} ukuran={balasan ? 34 : 44} />
        </button>

        <div className="komentar-isi">
          <header className="komentar-kepala">
            <button
              type="button"
              className="komentar-penulis"
              onClick={() => onBukaProfil(penulis)}
            >
              <span className="komentar-nama">{penulis.name}</span>
              <Lencana pengguna={penulis} size={balasan ? 15 : 17} />
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
                <IkonSampah size={balasan ? 15 : 17} />
              </button>
            )}
          </header>

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
              <IkonBalas size={ikonAksi} />
            </Aksi>

            <Aksi
              label={komentar.reposted ? t("aksi.batalUlang") : t("aksi.ulang")}
              jumlah={jumlahUlang}
              warna="hijau"
              aktif={komentar.reposted}
              ditekan={komentar.reposted}
              onClick={onUlang}
            >
              <IkonUlang size={ikonAksi} />
            </Aksi>

            <Aksi
              label={komentar.liked ? t("aksi.batalSuka") : t("aksi.suka")}
              jumlah={jumlahSuka}
              warna="merah"
              aktif={komentar.liked}
              ditekan={komentar.liked}
              onClick={onSuka}
            >
              <IkonSuka size={ikonAksi} terisi={komentar.liked} />
            </Aksi>

            {/* Tayangan tidak bisa ditekan — tidak ada yang bisa dilakukan
                terhadapnya, jadi bentuknya keterangan, bukan tombol. Selama
                belum ada yang melihat, barisnya kosong seperti penghitung lain
                yang masih nol. */}
            {tambahan.tayang > 0 && (
              <span
                className="aksi aksi-tayang"
                title={t("aksi.tayangJumlah", {
                  jumlah: angkaPenuh(tambahan.tayang, bahasa),
                })}
              >
                <span className="aksi-ikon">
                  <IkonTayang size={ikonAksi} />
                </span>
                <span className="aksi-jumlah">
                  {angkaSosial(tambahan.tayang, bahasa)}
                </span>
                <span className="sr-only">{t("aksi.tayang")}</span>
              </span>
            )}

            <Aksi
              label={komentar.saved ? t("aksi.batalSimpan") : t("aksi.simpan")}
              jumlah={0}
              warna="biru"
              aktif={komentar.saved}
              ditekan={komentar.saved}
              onClick={onSimpan}
            >
              <IkonSimpan size={ikonAksi} terisi={komentar.saved} />
            </Aksi>

            <Aksi
              label={t("aksi.salinTautan")}
              jumlah={0}
              warna="biru"
              onClick={onBagikan}
            >
              <IkonBagikan size={ikonAksi} />
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
