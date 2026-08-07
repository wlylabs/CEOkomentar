"use client";

import type { ReactNode } from "react";
import Avatar from "./Avatar";
import Composer from "./Composer";
import {
  IkonBagikan,
  IkonBalas,
  IkonSuka,
  IkonTerverifikasi,
  IkonUlang,
} from "./Icons";
import { ringkasAngka, waktuLengkap, waktuRelatif } from "@/lib/time";
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
  return (
    <button
      type="button"
      className={`aksi aksi-${warna}${aktif ? " aksi-aktif" : ""}`}
      onClick={onClick}
      aria-label={`${label}${jumlah > 0 ? `, ${jumlah}` : ""}`}
      aria-pressed={ditekan}
    >
      <span className="aksi-ikon">{children}</span>
      {jumlah > 0 && <span className="aksi-jumlah">{ringkasAngka(jumlah)}</span>}
    </button>
  );
}

type Props = {
  komentar: Comment;
  penulis: User;
  handleInduk: string | null;
  jumlahBalasan: number;
  akunSaya: User;
  /** epoch ms untuk menghitung label waktu relatif */
  sekarang: number;
  balasTerbuka: boolean;
  onSuka: () => void;
  onUlang: () => void;
  onBukaBalas: () => void;
  onKirimBalasan: (teks: string) => void;
  onBagikan: () => void;
};

export default function CommentCard({
  komentar,
  penulis,
  handleInduk,
  jumlahBalasan,
  akunSaya,
  sekarang,
  balasTerbuka,
  onSuka,
  onUlang,
  onBukaBalas,
  onKirimBalasan,
  onBagikan,
}: Props) {
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
            <span className="komentar-handle">@{penulis.handle}</span>
            <span className="komentar-pemisah" aria-hidden="true">
              ·
            </span>
            <time
              className="komentar-waktu"
              dateTime={new Date(komentar.createdAt).toISOString()}
              title={waktuLengkap(komentar.createdAt)}
              suppressHydrationWarning
            >
              {waktuRelatif(komentar.createdAt, sekarang)}
            </time>
          </header>

          {handleInduk && (
            <p className="komentar-konteks">
              Membalas <span className="sebut">@{handleInduk}</span>
            </p>
          )}

          <p className="komentar-teks">{komentar.text}</p>

          <div className="komentar-aksi">
            <Aksi
              label="Balas"
              jumlah={jumlahBalasan}
              warna="biru"
              aktif={balasTerbuka}
              onClick={onBukaBalas}
            >
              <IkonBalas size={19} />
            </Aksi>

            <Aksi
              label={komentar.reposted ? "Batalkan posting ulang" : "Posting ulang"}
              jumlah={komentar.reposts}
              warna="hijau"
              aktif={komentar.reposted}
              ditekan={komentar.reposted}
              onClick={onUlang}
            >
              <IkonUlang size={19} />
            </Aksi>

            <Aksi
              label={komentar.liked ? "Batalkan suka" : "Suka"}
              jumlah={komentar.likes}
              warna="merah"
              aktif={komentar.liked}
              ditekan={komentar.liked}
              onClick={onSuka}
            >
              <IkonSuka size={19} terisi={komentar.liked} />
            </Aksi>

            <Aksi label="Salin tautan" jumlah={0} warna="biru" onClick={onBagikan}>
              <IkonBagikan size={19} />
            </Aksi>
          </div>
        </div>
      </div>

      {balasTerbuka && (
        <div className="komentar-balas">
          <Composer
            pengguna={akunSaya}
            placeholder={`Balas ke @${penulis.handle}`}
            labelTombol="Balas"
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
