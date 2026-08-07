"use client";

import { useState, type FormEvent } from "react";
import { IkonMata, IkonPeringatan, IkonTamu, IkonTutup } from "./Icons";
import { klienPeramban } from "@/lib/supabase/client";

const PANJANG_SANDI = 8;

type Props = {
  /** dipanggil setelah akun tamu benar-benar menjadi permanen */
  onSelesai: () => void;
  onKabar: (pesan: string) => void;
};

/**
 * Ajakan mengubah akun tamu menjadi permanen. Supabase memakai akun yang sama,
 * hanya menambahkan email dan kata sandi, jadi komentar dan profil yang sudah
 * ada ikut terbawa.
 */
export default function BilahTamu({ onSelesai, onKabar }: Props) {
  const supabase = klienPeramban();

  const [terbuka, setTerbuka] = useState(false);
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;

    const alamat = email.trim().toLowerCase();
    if (!alamat.includes("@")) {
      setGalat("Masukkan email yang bisa dihubungi.");
      return;
    }
    if (sandi.length < PANJANG_SANDI) {
      setGalat(`Kata sandi minimal ${PANJANG_SANDI} karakter.`);
      return;
    }

    setGalat(null);
    setSibuk(true);
    const { data, error } = await supabase.auth.updateUser(
      { email: alamat, password: sandi },
      { emailRedirectTo: `${window.location.origin}/auth/callback` },
    );
    setSibuk(false);

    if (error) {
      const pesan = error.message.toLowerCase();
      setGalat(
        pesan.includes("already been registered") || pesan.includes("already registered")
          ? "Email itu sudah dipakai akun lain."
          : error.message,
      );
      return;
    }

    /* Bila konfirmasi email menyala, akun baru jadi permanen setelah tautannya
       dibuka; sampai saat itu sesinya masih sesi tamu. */
    if (data.user?.new_email) {
      setTerbuka(false);
      onKabar("Cek emailmu untuk mengonfirmasi alamat itu");
      return;
    }

    onKabar("Akun tamu berhasil dijadikan permanen");
    onSelesai();
  }

  return (
    <section className="tamu" aria-label="Akun tamu">
      <div className="tamu-kepala">
        <IkonTamu size={20} className="tamu-ikon" />
        <p className="tamu-teks">
          Kamu memakai <strong>akun tamu</strong>. Komentarmu tersimpan seperti
          biasa, tapi akunnya hanya hidup di peramban ini — sekali keluar, tidak
          bisa dimasuki lagi.
        </p>
        {terbuka ? (
          <button
            type="button"
            className="bulat"
            onClick={() => setTerbuka(false)}
            aria-label="Tutup form buat akun"
          >
            <IkonTutup size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="tombol tombol-utama tamu-tombol"
            onClick={() => setTerbuka(true)}
          >
            Buat akun
          </button>
        )}
      </div>

      {terbuka && (
        <form className="tamu-form" onSubmit={kirim} noValidate>
          <p className="bidang-bantuan">
            Tambahkan email dan kata sandi. Komentar, profil, dan foto yang sudah
            ada tetap milik akun yang sama.
          </p>

          <label className="bidang">
            <span className="bidang-label">Email</span>
            <input
              className="bidang-masukan"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </label>

          <label className="bidang">
            <span className="bidang-label">Kata sandi</span>
            <span className="bidang-awalan">
              <input
                className="bidang-masukan"
                type={lihat ? "text" : "password"}
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="bidang-ikon"
                onClick={() => setLihat((s) => !s)}
                aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                <IkonMata size={19} tertutup={lihat} />
              </button>
            </span>
            <p className="bidang-bantuan">Minimal {PANJANG_SANDI} karakter.</p>
          </label>

          {galat && (
            <p className="gerbang-galat" role="alert">
              <IkonPeringatan size={18} />
              <span>{galat}</span>
            </p>
          )}

          <button type="submit" className="tombol tombol-utama" disabled={sibuk}>
            {sibuk ? "Menyimpan…" : "Jadikan permanen"}
          </button>
        </form>
      )}
    </section>
  );
}
