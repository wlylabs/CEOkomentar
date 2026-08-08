"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Merek from "./Merek";
import PemilihBahasa from "./PemilihBahasa";
import { IkonMata, IkonPeringatan } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import { klienPeramban } from "@/lib/supabase/client";

const PANJANG_SANDI = 8;

export default function SandiBaru() {
  const router = useRouter();
  const supabase = klienPeramban();
  const { t } = useBahasa();

  const [sandi, setSandi] = useState("");
  const [ulang, setUlang] = useState("");
  const [lihat, setLihat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [siap, setSiap] = useState<boolean | null>(null);

  /* Halaman ini hanya berguna bila tautan pemulihan sudah membuat sesi. */
  useEffect(() => {
    let hidup = true;
    supabase.auth.getUser().then(({ data }) => {
      if (hidup) setSiap(Boolean(data.user));
    });
    return () => {
      hidup = false;
    };
  }, [supabase]);

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;

    if (sandi.length < PANJANG_SANDI) {
      setGalat(t("galatAuth.sandiPendek", { jumlah: PANJANG_SANDI }));
      return;
    }
    if (sandi !== ulang) {
      setGalat(t("sandi.belumSama"));
      return;
    }

    setGalat(null);
    setSibuk(true);
    const { error } = await supabase.auth.updateUser({ password: sandi });
    setSibuk(false);

    if (error) {
      setGalat(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="gerbang">
      <main className="gerbang-kartu">
        <div className="gerbang-merek">
          <Merek />
          <PemilihBahasa varian="gerbang" />
        </div>

        <h1 className="gerbang-judul">{t("sandi.judul")}</h1>

        {siap === false ? (
          <>
            <p className="gerbang-sub">{t("sandi.kedaluwarsa")}</p>
            <button
              type="button"
              className="tombol tombol-utama tombol-lebar"
              onClick={() => router.replace("/")}
            >
              {t("gerbang.kembaliMasuk")}
            </button>
          </>
        ) : (
          <>
            <p className="gerbang-sub">{t("sandi.sub")}</p>

            <form className="gerbang-form" onSubmit={kirim} noValidate>
              <label className="bidang">
                <span className="bidang-label">{t("sandi.baru")}</span>
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

              <label className="bidang">
                <span className="bidang-label">{t("sandi.ulangi")}</span>
                <input
                  className="bidang-masukan"
                  type={lihat ? "text" : "password"}
                  value={ulang}
                  onChange={(e) => setUlang(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              {galat && (
                <p className="gerbang-galat" role="alert">
                  <IkonPeringatan size={18} />
                  <span>{galat}</span>
                </p>
              )}

              <button
                type="submit"
                className="tombol tombol-utama tombol-lebar"
                disabled={sibuk || siap === null}
              >
                {t(sibuk ? "umum.menyimpan" : "sandi.simpan")}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
