"use client";

import { IkonTerverifikasi } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { judulLencana } from "@/lib/lencana";
import type { User } from "@/lib/types";

/**
 * Lencana yang dimiliki sebuah akun, berjajar di sebelah namanya.
 *
 * Bentuknya sama untuk semua, yang membedakan hanya warna: emas untuk akun
 * resmi, biru untuk yang sudah menyelesaikan misi centang biru. Dengan begitu
 * arti "ini akun yang benar" terbaca sekali lihat, dan bedanya cukup dijelaskan
 * lewat tooltip alih-alih pil bertuliskan namanya.
 *
 * Satu akun bisa memiliki lebih dari satu lencana sejak ada misi — urutannya
 * ditentukan katalog di lib/lencana.ts, bukan urutan mendapatkannya.
 */
export default function Lencana({
  pengguna,
  size = 17,
}: {
  pengguna: User;
  size?: number;
}) {
  const { t } = useBahasa();

  if (pengguna.lencana.length === 0) return null;

  return (
    <>
      {pengguna.lencana.map((kode) => {
        const judul = t(judulLencana(kode));
        return (
          <span
            key={kode}
            className={`lencana lencana-${kode}`}
            title={judul}
            role="img"
            aria-label={judul}
          >
            <IkonTerverifikasi size={size} />
          </span>
        );
      })}
    </>
  );
}
