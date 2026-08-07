import { Fragment, type ReactNode } from "react";

/**
 * Beberapa kalimat perlu penekanan di tengahnya: nama berkas dalam `<code>`,
 * tombol papan tik dalam `<kbd>`, atau satu frasa tebal. Menaruhnya di dalam
 * kamus membuat penerjemah bebas memindahkannya, sedangkan memecah kalimat
 * menjadi beberapa kunci selalu berakhir dengan urutan kata yang kaku.
 *
 * Yang dikenali hanya tiga tanda di bawah dan hasilnya elemen React biasa,
 * jadi tidak ada HTML mentah yang pernah disisipkan ke dokumen.
 */
const POLA = /<(code|strong|kbd)>([\s\S]*?)<\/\1>/g;

export function keNode(kalimat: string): ReactNode {
  const bagian: ReactNode[] = [];
  let posisi = 0;
  let cocok: RegExpExecArray | null;

  POLA.lastIndex = 0;
  while ((cocok = POLA.exec(kalimat)) !== null) {
    if (cocok.index > posisi) bagian.push(kalimat.slice(posisi, cocok.index));

    const [utuh, tanda, isi] = cocok;
    bagian.push(
      tanda === "code" ? <code>{isi}</code> : tanda === "kbd" ? <kbd>{isi}</kbd> : <strong>{isi}</strong>,
    );

    posisi = cocok.index + utuh.length;
  }

  /* Kalimat tanpa penanda dikembalikan apa adanya supaya tidak ada pembungkus
     tambahan di pohon React untuk teks biasa. */
  if (posisi === 0) return kalimat;
  if (posisi < kalimat.length) bagian.push(kalimat.slice(posisi));

  return (
    <>
      {bagian.map((b, i) => (
        <Fragment key={i}>{b}</Fragment>
      ))}
    </>
  );
}
