"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Merek from "./Merek";
import PemilihBahasa from "./PemilihBahasa";
import { IkonMata, IkonPeringatan, IkonTamu } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { klienPeramban } from "@/lib/supabase/client";

type Mode = "masuk" | "daftar" | "lupa";

const POLA_HANDLE = /^[A-Za-z0-9_]{3,15}$/;
const PANJANG_SANDI = 8;

const JUDUL: Record<Mode, KunciTeks> = {
  masuk: "gerbang.judulMasuk",
  daftar: "gerbang.judulDaftar",
  lupa: "gerbang.judulLupa",
};

/**
 * Galat Supabase selalu berbahasa Inggris. Yang sering ditemui pemakai
 * dipetakan ke kalimat kita sendiri; sisanya diteruskan apa adanya karena
 * kalimat aslinya lebih tepat daripada tebakan yang terlalu umum.
 */
const GALAT_SUPABASE: { tanda: string[]; kunci: KunciTeks }[] = [
  { tanda: ["invalid login credentials"], kunci: "galatAuth.kredensial" },
  { tanda: ["email not confirmed"], kunci: "galatAuth.belumKonfirmasi" },
  {
    tanda: ["user already registered", "already been registered"],
    kunci: "galatAuth.sudahTerdaftar",
  },
  { tanda: ["password should be at least"], kunci: "galatAuth.sandiPendek" },
  {
    tanda: ["unable to validate email", "invalid email"],
    kunci: "galatAuth.emailSalah",
  },
  { tanda: ["rate limit", "too many requests"], kunci: "galatAuth.batasan" },
  {
    tanda: ["anonymous sign-ins are disabled", "anonymous_provider_disabled"],
    kunci: "galatAuth.tamuMati",
  },
  { tanda: ["failed to fetch", "networkerror"], kunci: "galatAuth.jaringan" },
];

export default function AuthScreen() {
  const router = useRouter();
  const supabase = klienPeramban();
  const { t } = useBahasa();

  const terjemahkan = (pesan: string) => {
    const p = pesan.toLowerCase();
    const cocok = GALAT_SUPABASE.find((g) => g.tanda.some((tanda) => p.includes(tanda)));
    return cocok ? t(cocok.kunci, { jumlah: PANJANG_SANDI }) : pesan;
  };

  const [mode, setMode] = useState<Mode>("masuk");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [nama, setNama] = useState("");
  const [handle, setHandle] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);

  const [galat, setGalat] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [statusHandle, setStatusHandle] = useState<
    "kosong" | "salah" | "memeriksa" | "kosong-tersedia" | "terpakai"
  >("kosong");

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  /* Periksa ketersediaan handle sambil mengetik, ditunda agar tidak boros. */
  useEffect(() => {
    if (mode !== "daftar") return;
    const nilai = handle.trim();

    if (!nilai) {
      setStatusHandle("kosong");
      return;
    }
    if (!POLA_HANDLE.test(nilai)) {
      setStatusHandle("salah");
      return;
    }

    setStatusHandle("memeriksa");
    let dibatalkan = false;
    const id = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc("handle_tersedia", {
        handle_baru: nilai,
      });
      if (dibatalkan) return;
      if (error) {
        setStatusHandle("kosong");
        return;
      }
      setStatusHandle(data ? "kosong-tersedia" : "terpakai");
    }, 450);

    return () => {
      dibatalkan = true;
      window.clearTimeout(id);
    };
  }, [handle, mode, supabase]);

  function gantiMode(berikut: Mode) {
    setMode(berikut);
    setGalat(null);
    setKabar(null);
    setSandi("");
  }

  /**
   * Masuk sebagai tamu memakai Anonymous sign-in Supabase: akunnya nyata di
   * auth.users, jadi pemicu profil dan seluruh kebijakan RLS berlaku sama
   * seperti akun biasa. Nama dan handle diacak agar tiap tamu tetap dikenali.
   */
  async function masukTamu() {
    if (sibuk) return;
    setGalat(null);
    setKabar(null);
    setSibuk(true);

    const nomor = String(Math.floor(1000 + Math.random() * 9000));
    /* Nama tampilan mengikuti bahasa yang sedang dipakai, sedangkan handle
       tetap `tamu…` karena ia pengenal yang tersimpan permanen. */
    const { error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          name: t("gerbang.namaTamu", { nomor }),
          handle: `tamu${nomor}`,
        },
      },
    });
    setSibuk(false);

    if (error) {
      setGalat(terjemahkan(error.message));
      return;
    }
    router.refresh();
  }

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (sibuk) return;

    setGalat(null);
    setKabar(null);

    const alamat = email.trim().toLowerCase();

    if (mode === "daftar") {
      if (!nama.trim()) {
        setGalat(t("gerbang.namaWajib"));
        return;
      }
      if (!POLA_HANDLE.test(handle.trim())) {
        setGalat(t("gerbang.handleSalah"));
        return;
      }
      if (statusHandle === "terpakai") {
        setGalat(t("gerbang.handleTerpakai"));
        return;
      }
      if (sandi.length < PANJANG_SANDI) {
        setGalat(t("galatAuth.sandiPendek", { jumlah: PANJANG_SANDI }));
        return;
      }
    }

    setSibuk(true);
    try {
      if (mode === "lupa") {
        const { error } = await supabase.auth.resetPasswordForEmail(alamat, {
          redirectTo: `${window.location.origin}/auth/callback?berikutnya=/sandi-baru`,
        });
        if (error) throw error;
        setKabar(t("gerbang.kabarLupa"));
        return;
      }

      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({
          email: alamat,
          password: sandi,
        });
        if (error) throw error;
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: alamat,
        password: sandi,
        options: {
          data: { name: nama.trim(), handle: handle.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      if (data.session) {
        router.refresh();
      } else {
        setKabar(t("gerbang.kabarDaftar"));
        setMode("masuk");
        setSandi("");
      }
    } catch (kesalahan) {
      setGalat(
        terjemahkan(
          kesalahan instanceof Error ? kesalahan.message : String(kesalahan),
        ),
      );
    } finally {
      setSibuk(false);
    }
  }

  const catatanHandle: Record<typeof statusHandle, string> = {
    kosong: t("handle.kosong"),
    salah: t("handle.salah"),
    memeriksa: t("handle.memeriksa"),
    "kosong-tersedia": t("handle.tersedia", { handle: handle.trim() }),
    terpakai: t("handle.terpakai", { handle: handle.trim() }),
  };

  return (
    <div className="gerbang">
      <main className="gerbang-kartu">
        <div className="gerbang-merek">
          <Merek />
          <PemilihBahasa varian="gerbang" />
        </div>

        <h1 className="gerbang-judul">{t(JUDUL[mode])}</h1>
        <p className="gerbang-sub">
          {t(mode === "lupa" ? "gerbang.subLupa" : "gerbang.sub")}
        </p>

        <form className="gerbang-form" onSubmit={kirim} noValidate>
          {mode === "daftar" && (
            <>
              <label className="bidang">
                <span className="bidang-label">{t("gerbang.nama")}</span>
                <input
                  className="bidang-masukan"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  maxLength={50}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="bidang">
                <span className="bidang-label">{t("gerbang.handle")}</span>
                <span className="bidang-awalan">
                  <span aria-hidden="true">@</span>
                  <input
                    className="bidang-masukan"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/\s/g, ""))}
                    maxLength={15}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                </span>
                <p
                  className={`bidang-bantuan${
                    statusHandle === "terpakai" || statusHandle === "salah"
                      ? " bidang-galat"
                      : statusHandle === "kosong-tersedia"
                        ? " bidang-baik"
                        : ""
                  }`}
                >
                  {catatanHandle[statusHandle]}
                </p>
              </label>
            </>
          )}

          <label className="bidang">
            <span className="bidang-label">{t("gerbang.email")}</span>
            <input
              ref={emailRef}
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

          {mode !== "lupa" && (
            <label className="bidang">
              <span className="bidang-label">{t("gerbang.sandi")}</span>
              <span className="bidang-awalan">
                <input
                  className="bidang-masukan"
                  type={lihatSandi ? "text" : "password"}
                  value={sandi}
                  onChange={(e) => setSandi(e.target.value)}
                  autoComplete={
                    mode === "daftar" ? "new-password" : "current-password"
                  }
                  minLength={mode === "daftar" ? PANJANG_SANDI : undefined}
                  required
                />
                <button
                  type="button"
                  className="bidang-ikon"
                  onClick={() => setLihatSandi((s) => !s)}
                  aria-label={t(
                    lihatSandi ? "gerbang.sembunyikanSandi" : "gerbang.lihatSandi",
                  )}
                >
                  <IkonMata size={19} tertutup={lihatSandi} />
                </button>
              </span>
              {mode === "daftar" && (
                <p className="bidang-bantuan">
                  {t("gerbang.sandiMinimal", { jumlah: PANJANG_SANDI })}
                </p>
              )}
            </label>
          )}

          {galat && (
            <p className="gerbang-galat" role="alert">
              <IkonPeringatan size={18} />
              <span>{galat}</span>
            </p>
          )}

          {kabar && (
            <p className="gerbang-kabar" role="status">
              {kabar}
            </p>
          )}

          <button
            type="submit"
            className="tombol tombol-utama tombol-lebar"
            disabled={sibuk}
          >
            {t(
              sibuk
                ? "umum.memproses"
                : mode === "masuk"
                  ? "gerbang.tombolMasuk"
                  : mode === "daftar"
                    ? "gerbang.tombolDaftar"
                    : "gerbang.tombolTautan",
            )}
          </button>
        </form>

        {mode !== "lupa" && (
          <>
            <div className="gerbang-pisah">
              <span>{t("gerbang.atau")}</span>
            </div>

            <button
              type="button"
              className="tombol tombol-garis tombol-lebar"
              onClick={masukTamu}
              disabled={sibuk}
            >
              <IkonTamu size={19} />
              <span>{t("gerbang.tamu")}</span>
            </button>
            <p className="gerbang-catatan">{t("gerbang.catatanTamu")}</p>
          </>
        )}

        <div className="gerbang-kaki">
          {mode === "masuk" && (
            <>
              <button type="button" className="tautan" onClick={() => gantiMode("lupa")}>
                {t("gerbang.lupaSandi")}
              </button>
              <p>
                {t("gerbang.belumPunya")}{" "}
                <button type="button" className="tautan" onClick={() => gantiMode("daftar")}>
                  {t("gerbang.tombolDaftar")}
                </button>
              </p>
            </>
          )}

          {mode === "daftar" && (
            <p>
              {t("gerbang.sudahPunya")}{" "}
              <button type="button" className="tautan" onClick={() => gantiMode("masuk")}>
                {t("gerbang.tombolMasuk")}
              </button>
            </p>
          )}

          {mode === "lupa" && (
            <button type="button" className="tautan" onClick={() => gantiMode("masuk")}>
              {t("gerbang.kembaliMasuk")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
