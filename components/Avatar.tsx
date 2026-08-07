import { avatarBawaan } from "@/lib/avatar";
import type { User } from "@/lib/types";

/** Rona warna yang stabil per pengguna, diturunkan dari handle. */
function rona(handle: string) {
  let jumlah = 0;
  for (let i = 0; i < handle.length; i += 1) {
    jumlah = (jumlah * 31 + handle.charCodeAt(i)) % 360;
  }
  return jumlah;
}

type Props = {
  pengguna: User;
  ukuran?: number;
};

export default function Avatar({ pengguna, ukuran = 44 }: Props) {
  const h = rona(pengguna.handle);
  const foto = pengguna.avatar ?? avatarBawaan(pengguna.handle);

  return (
    <span
      className="avatar"
      style={{
        width: ukuran,
        height: ukuran,
        /* Sosok bawaan DiceBear digambar tanpa latar; gradien per-handle inilah
           yang mengisi bingkai di belakangnya, sekaligus jadi warna sementara
           sebelum foto sungguhan selesai dimuat. */
        background: pengguna.avatar
          ? "var(--latar-naik)"
          : `linear-gradient(140deg, hsl(${h} 70% 58%), hsl(${(h + 42) % 360} 68% 44%))`,
      }}
      aria-hidden="true"
    >
      {/* Sumbernya URL Supabase Storage, object URL pratinjau, atau data URI
          avatar bawaan — ketiganya di luar jangkauan pengoptimal gambar Next.js,
          jadi <img> biasa sudah tepat. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="avatar-foto"
        src={foto}
        alt=""
        width={ukuran}
        height={ukuran}
        loading="lazy"
        draggable={false}
      />
    </span>
  );
}
