"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import Lencana from "./Lencana";
import { IkonMisi, IkonProfil } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { waktuLengkap, waktuRelatif } from "@/lib/time";
import type { JenisNotifikasi, Notifikasi, User } from "@/lib/types";

const KALIMAT: Record<JenisNotifikasi, KunciTeks> = {
  suka: "notif.suka",
  ulang: "notif.ulang",
  ikut: "notif.ikut",
  misi: "notif.misi",
};

/**
 * Kabar suka dan posting ulang sengaja tanpa ikon: kalimatnya sudah menyebut
 * apa yang terjadi, dan hati merah berjajar di sepanjang daftar lebih ramai
 * daripada memberi tahu. Yang berikon hanya dua yang jarang: pengikut baru —
 * satu-satunya kabar yang tidak menunjuk ke sebuah komentar — dan pengajuan
 * misi, yang datang ke daftar admin dan menunggu diputuskan.
 */
function ikonKabar(jenis: JenisNotifikasi) {
  if (jenis === "ikut") return <IkonProfil size={19} aktif />;
  if (jenis === "misi") return <IkonMisi size={19} aktif />;
  return null;
}

type Props = {
  daftar: Notifikasi[];
  pengguna: Record<string, User>;
  /** epoch ms untuk label waktu relatif */
  sekarang: number;
  onBukaProfil: (pengguna: User) => void;
};

export default function DaftarNotifikasi({
  daftar,
  pengguna,
  sekarang,
  onBukaProfil,
}: Props) {
  const { bahasa, t } = useBahasa();

  return (
    <>
      {daftar.map((kabar) => {
        const aktor = pengguna[kabar.aktorId];
        if (!aktor) return null;

        const ikon = ikonKabar(kabar.jenis);

        const isi = (
          <>
            {ikon && <span className="notif-ikon">{ikon}</span>}

            <span className="notif-isi">
              <Avatar pengguna={aktor} ukuran={34} />
              <span className="notif-teks">
                <span className="notif-kalimat">
                  <strong>{aktor.name}</strong>
                  <Lencana pengguna={aktor} size={15} />
                  <span>{t(KALIMAT[kabar.jenis])}</span>
                  <span className="komentar-pemisah" aria-hidden="true">
                    ·
                  </span>
                  <time
                    className="komentar-waktu"
                    dateTime={new Date(kabar.createdAt).toISOString()}
                    title={waktuLengkap(kabar.createdAt, bahasa)}
                    suppressHydrationWarning
                  >
                    {waktuRelatif(kabar.createdAt, sekarang, bahasa)}
                  </time>
                </span>
                {kabar.kutipan && (
                  <span className="notif-kutipan">{kabar.kutipan}</span>
                )}
              </span>
            </span>
          </>
        );

        const kelas = `notif${kabar.dibaca ? "" : " notif-baru"}`;

        /* Kabar yang punya komentar membuka utasnya; sisanya membuka profil
           orang yang melakukannya. */
        return (
          <div className="daftar-butir" key={kabar.id}>
            {kabar.komentarId ? (
              <Link className={kelas} href={`/komentar/${kabar.komentarId}`}>
                {isi}
              </Link>
            ) : (
              <button
                type="button"
                className={kelas}
                onClick={() => onBukaProfil(aktor)}
              >
                {isi}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
