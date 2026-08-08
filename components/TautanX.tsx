"use client";

import { IkonBuka, IkonX } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { alamatRingkas, type TautanX } from "@/lib/tautan";

/**
 * Kartu untuk tautan X yang dilampirkan di sebuah komentar.
 *
 * Isi postingannya tidak diambil dari mana pun — tidak ada permintaan ke luar,
 * tidak ada skrip pihak ketiga yang ikut termuat, dan tidak ada yang bocor
 * tentang siapa yang sedang membaca. Yang digambar hanya apa yang sudah ada di
 * dalam alamatnya sendiri: pemiliknya dan bahwa itu sebuah postingan.
 */
export default function KartuTautanX({ tautan }: { tautan: TautanX }) {
  const { t } = useBahasa();

  const judul = tautan.status
    ? tautan.handle
      ? t("tautan.postingMilik", { handle: tautan.handle })
      : t("tautan.posting")
    : t("tautan.profil", { handle: tautan.handle ?? "" });

  return (
    <a
      className="tautanx"
      href={tautan.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title={t("tautan.buka")}
    >
      <span className="tautanx-lambang">
        <IkonX size={17} />
      </span>

      <span className="tautanx-isi">
        <span className="tautanx-judul">{judul}</span>
        <span className="tautanx-alamat">{alamatRingkas(tautan.url)}</span>
      </span>

      <span className="tautanx-panah" aria-hidden="true">
        <IkonBuka size={15} />
      </span>
    </a>
  );
}
