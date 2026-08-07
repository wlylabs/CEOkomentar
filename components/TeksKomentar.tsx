"use client";

import { Fragment, useMemo } from "react";

/**
 * Isi komentar dengan tagar dan sebutan yang bisa ditekan.
 *
 * Polanya sengaja sempit — huruf, angka, dan garis bawah — supaya sama persis
 * dengan yang dikenali `tren_tagar()` di basis data dan dengan bentuk handle
 * yang diizinkan tabel profil. Teks di luar itu tetap teks biasa; tidak ada
 * HTML yang pernah disisipkan ke dokumen.
 */
const POLA = /([#@][A-Za-z0-9_]{2,30})/g;

type Props = {
  teks: string;
  onTagar: (tagar: string) => void;
  onSebut: (handle: string) => void;
};

export default function TeksKomentar({ teks, onTagar, onSebut }: Props) {
  const bagian = useMemo(() => teks.split(POLA), [teks]);

  return (
    <p className="komentar-teks">
      {bagian.map((potong, i) => {
        /* Pemisah hasil split() selalu di indeks ganjil: itulah tagar dan
           sebutannya, sisanya teks apa adanya. */
        if (i % 2 === 0 || !potong) return <Fragment key={i}>{potong}</Fragment>;

        const tagar = potong.startsWith("#");
        const isi = potong.slice(1);

        return (
          <button
            key={i}
            type="button"
            className="sebut sebut-tombol"
            onClick={() => (tagar ? onTagar(isi) : onSebut(isi))}
          >
            {potong}
          </button>
        );
      })}
    </p>
  );
}
