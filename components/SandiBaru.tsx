"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Brand from "./Brand";
import { IkonMata, IkonPeringatan } from "./Icons";
import { klienPeramban } from "@/lib/supabase/client";

const PANJANG_SANDI = 8;

export default function SandiBaru() {
  const router = useRouter();
  const supabase = klienPeramban();

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
      setGalat(`Kata sandi minimal ${PANJANG_SANDI} karakter.`);
      return;
    }
    if (sandi !== ulang) {
      setGalat("Dua isian kata sandi belum sama.");
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
          <Brand size={40} />
          <span className="gerbang-merek-teks">Twitter Mini</span>
        </div>

        <h1 className="gerbang-judul">Buat kata sandi baru</h1>

        {siap === false ? (
          <>
            <p className="gerbang-sub">
              Tautan pemulihan sudah kedaluwarsa atau belum dibuka dari email.
              Minta tautan baru dari halaman masuk.
            </p>
            <button
              type="button"
              className="tombol tombol-utama tombol-lebar"
              onClick={() => router.replace("/")}
            >
              Kembali ke halaman masuk
            </button>
          </>
        ) : (
          <>
            <p className="gerbang-sub">
              Kata sandi baru langsung berlaku untuk seluruh perangkat.
            </p>

            <form className="gerbang-form" onSubmit={kirim} noValidate>
              <label className="bidang">
                <span className="bidang-label">Kata sandi baru</span>
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

              <label className="bidang">
                <span className="bidang-label">Ulangi kata sandi</span>
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
                {sibuk ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
