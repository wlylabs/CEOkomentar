"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IkonBagikan, IkonLainnya, IkonSampah, IkonSimpan } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

type Props = {
  disimpan: boolean;
  /** admin boleh menghapus komentar orang lain; kalimat konfirmasinya berbeda */
  bisaHapus: boolean;
  onSimpan: () => void;
  onBagikan: () => void;
  onHapus: () => void;
};

/**
 * Tindakan yang jarang dipakai — simpan, salin tautan, hapus — dikumpulkan di
 * balik satu tombol titik tiga di pojok kartu.
 *
 * Sebelumnya ketiganya berjajar di baris aksi bersama balas, posting ulang,
 * suka, dan tayangan; tujuh benda dalam satu baris membuat yang sering ditekan
 * pun ikut sulit ditemukan. Ikon hapus juga tak lagi menempel di baris nama
 * setiap kartu — di layar sentuh ia selalu terlihat karena tidak ada kursor
 * yang bisa disembunyikan darinya.
 */
export default function MenuKartu({
  disimpan,
  bisaHapus,
  onSimpan,
  onBagikan,
  onHapus,
}: Props) {
  const { t } = useBahasa();
  const [terbuka, setTerbuka] = useState(false);
  const wadahRef = useRef<HTMLDivElement>(null);
  const tombolRef = useRef<HTMLButtonElement>(null);
  const idMenu = useId();

  /* Menekan di luar menu atau menekan Esc menutupnya, dan fokus kembali ke
     tombol yang membukanya supaya papan ketik tidak kehilangan tempatnya. */
  useEffect(() => {
    if (!terbuka) return;

    function diLuar(peristiwa: PointerEvent) {
      if (!wadahRef.current?.contains(peristiwa.target as Node)) {
        setTerbuka(false);
      }
    }

    function tombolPapanKetik(peristiwa: KeyboardEvent) {
      if (peristiwa.key !== "Escape") return;
      setTerbuka(false);
      tombolRef.current?.focus();
    }

    document.addEventListener("pointerdown", diLuar);
    document.addEventListener("keydown", tombolPapanKetik);
    return () => {
      document.removeEventListener("pointerdown", diLuar);
      document.removeEventListener("keydown", tombolPapanKetik);
    };
  }, [terbuka]);

  function jalankan(tindakan: () => void) {
    setTerbuka(false);
    tindakan();
  }

  return (
    <div className="menu-kartu" ref={wadahRef}>
      <button
        type="button"
        ref={tombolRef}
        className="menu-kartu-tombol"
        onClick={() => setTerbuka((sebelum) => !sebelum)}
        aria-label={t(terbuka ? "aksi.tutupMenu" : "aksi.lainnya")}
        aria-haspopup="menu"
        aria-expanded={terbuka}
        aria-controls={terbuka ? idMenu : undefined}
      >
        <IkonLainnya size={17} />
      </button>

      {terbuka && (
        <div className="menu-kartu-daftar" id={idMenu} role="menu">
          <button
            type="button"
            role="menuitem"
            className="menu-kartu-butir"
            onClick={() => jalankan(onSimpan)}
          >
            <IkonSimpan size={18} terisi={disimpan} />
            <span>{t(disimpan ? "aksi.batalSimpan" : "aksi.simpan")}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            className="menu-kartu-butir"
            onClick={() => jalankan(onBagikan)}
          >
            <IkonBagikan size={18} />
            <span>{t("aksi.salinTautan")}</span>
          </button>

          {bisaHapus && (
            <button
              type="button"
              role="menuitem"
              className="menu-kartu-butir menu-kartu-bahaya"
              onClick={() => jalankan(onHapus)}
            >
              <IkonSampah size={18} />
              <span>{t("umum.hapus")}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
