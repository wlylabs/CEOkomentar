"use client";

import { useState, type FormEvent } from "react";
import { IkonMata, IkonPeringatan, IkonTamu, IkonTutup } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
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
  const { t, tk } = useBahasa();
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
      setGalat(t("tamu.emailSalah"));
      return;
    }
    if (sandi.length < PANJANG_SANDI) {
      setGalat(t("galatAuth.sandiPendek", { jumlah: PANJANG_SANDI }));
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
          ? t("tamu.emailDipakai")
          : error.message,
      );
      return;
    }

    /* Bila konfirmasi email menyala, akun baru jadi permanen setelah tautannya
       dibuka; sampai saat itu sesinya masih sesi tamu. */
    if (data.user?.new_email) {
      setTerbuka(false);
      onKabar(t("tamu.cekEmail"));
      return;
    }

    onKabar(t("tamu.berhasil"));
    onSelesai();
  }

  return (
    <section className="tamu" aria-label={t("tamu.label")}>
      <div className="tamu-kepala">
        <IkonTamu size={20} className="tamu-ikon" />
        <p className="tamu-teks">{tk("tamu.teks")}</p>
        {terbuka ? (
          <button
            type="button"
            className="bulat"
            onClick={() => setTerbuka(false)}
            aria-label={t("tamu.tutupForm")}
          >
            <IkonTutup size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="tombol tombol-utama tamu-tombol"
            onClick={() => setTerbuka(true)}
          >
            {t("tamu.buatAkun")}
          </button>
        )}
      </div>

      {terbuka && (
        <form className="tamu-form" onSubmit={kirim} noValidate>
          <p className="bidang-bantuan">{t("tamu.bantuan")}</p>

          <label className="bidang">
            <span className="bidang-label">{t("gerbang.email")}</span>
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
            <span className="bidang-label">{t("gerbang.sandi")}</span>
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
                aria-label={t(lihat ? "gerbang.sembunyikanSandi" : "gerbang.lihatSandi")}
              >
                <IkonMata size={19} tertutup={lihat} />
              </button>
            </span>
            <p className="bidang-bantuan">
              {t("gerbang.sandiMinimal", { jumlah: PANJANG_SANDI })}
            </p>
          </label>

          {galat && (
            <p className="gerbang-galat" role="alert">
              <IkonPeringatan size={18} />
              <span>{galat}</span>
            </p>
          )}

          <button type="submit" className="tombol tombol-utama" disabled={sibuk}>
            {t(sibuk ? "umum.menyimpan" : "tamu.jadikan")}
          </button>
        </form>
      )}
    </section>
  );
}
