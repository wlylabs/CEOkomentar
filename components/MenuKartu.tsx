"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { IkonBagikan, IkonLainnya, IkonSampah } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

/** Jarak menu dari tombolnya; harus sama dengan yang dipakai globals.css. */
const JARAK = 4;

/**
 * Bilah bawah menempel di kaki layar dan menutupi apa pun yang sampai ke sana,
 * jadi ruang di bawah tombol berhenti di batas atasnya, bukan di tepi layar.
 * Tingginya dan lebar layar tempat ia menghilang harus sama dengan globals.css.
 */
const TINGGI_BILAH = 54;
const LEBAR_TANPA_BILAH = "(min-width: 768px)";

type Props = {
  /** admin boleh menghapus komentar orang lain; kalimat konfirmasinya berbeda */
  bisaHapus: boolean;
  onBagikan: () => void;
  onHapus: () => void;
};

/**
 * Tindakan yang jarang dipakai — salin tautan dan hapus — dikumpulkan di balik
 * satu tombol titik tiga di pojok kartu.
 *
 * Sebelumnya keduanya berjajar di baris aksi bersama posting ulang, suka, dan
 * tayangan; terlalu banyak benda dalam satu baris membuat yang sering ditekan
 * pun ikut sulit ditemukan. Ikon hapus juga tak lagi menempel di baris nama
 * setiap kartu — di layar sentuh ia selalu terlihat karena tidak ada kursor
 * yang bisa disembunyikan darinya.
 */
export default function MenuKartu({ bisaHapus, onBagikan, onHapus }: Props) {
  const { t } = useBahasa();
  const [terbuka, setTerbuka] = useState(false);
  /* Ke bawah selama muat; kartu terakhir di layar membukanya ke atas. */
  const [arah, setArah] = useState<"bawah" | "atas">("bawah");
  const wadahRef = useRef<HTMLDivElement>(null);
  const tombolRef = useRef<HTMLButtonElement>(null);
  const daftarRef = useRef<HTMLDivElement>(null);
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

  /* Kartu terakhir di layar tidak punya ruang di bawah tombolnya: menunya
     tertelan tepi layar, dan bilah bawah menutupi sisanya. Diukur setelah
     menunya terpasang tetapi sebelum peramban menggambarnya, jadi ia tidak
     pernah terlihat melompat dari bawah ke atas. */
  useLayoutEffect(() => {
    if (!terbuka) return;

    function ukur() {
      const tombol = tombolRef.current;
      const daftar = daftarRef.current;
      if (!tombol || !daftar) return;

      const bilah = window.matchMedia(LEBAR_TANPA_BILAH).matches
        ? 0
        : TINGGI_BILAH;
      const kotak = tombol.getBoundingClientRect();
      const tinggi = daftar.offsetHeight + JARAK;
      const ruangBawah = window.innerHeight - kotak.bottom - bilah;
      const ruangAtas = kotak.top;

      /* Ke atas hanya kalau di sana memang lebih lapang — kalau kedua sisinya
         sama-sama sempit, ke bawah tetap arah yang lebih wajar. */
      setArah(tinggi > ruangBawah && ruangAtas > ruangBawah ? "atas" : "bawah");
    }

    ukur();
    window.addEventListener("resize", ukur);
    window.addEventListener("scroll", ukur, { passive: true });
    return () => {
      window.removeEventListener("resize", ukur);
      window.removeEventListener("scroll", ukur);
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
        <div
          className="menu-kartu-daftar"
          ref={daftarRef}
          data-arah={arah}
          id={idMenu}
          role="menu"
        >
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
