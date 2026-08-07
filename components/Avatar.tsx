import type { User } from "@/lib/types";

/** Rona warna yang stabil per pengguna, diturunkan dari handle. */
function rona(handle: string) {
  let jumlah = 0;
  for (let i = 0; i < handle.length; i += 1) {
    jumlah = (jumlah * 31 + handle.charCodeAt(i)) % 360;
  }
  return jumlah;
}

function inisial(nama: string) {
  const bagian = nama.trim().split(/\s+/);
  const awal = bagian[0]?.[0] ?? "";
  const akhir = bagian.length > 1 ? bagian[bagian.length - 1][0] : "";
  return (awal + akhir).toUpperCase();
}

type Props = {
  pengguna: User;
  ukuran?: number;
};

export default function Avatar({ pengguna, ukuran = 44 }: Props) {
  const h = rona(pengguna.handle);

  return (
    <span
      className="avatar"
      style={{
        width: ukuran,
        height: ukuran,
        fontSize: Math.round(ukuran * 0.36),
        background: pengguna.avatar
          ? "var(--latar-naik)"
          : `linear-gradient(140deg, hsl(${h} 70% 58%), hsl(${(h + 42) % 360} 68% 44%))`,
      }}
      aria-hidden="true"
    >
      {pengguna.avatar ? (
        // Sumbernya URL Supabase Storage atau object URL pratinjau, keduanya di
        // luar jangkauan pengoptimal gambar Next.js, jadi <img> biasa sudah tepat.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="avatar-foto" src={pengguna.avatar} alt="" loading="lazy" />
      ) : (
        inisial(pengguna.name)
      )}
    </span>
  );
}
