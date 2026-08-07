"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Brand from "./Brand";
import { IkonMata, IkonPeringatan, IkonTamu } from "./Icons";
import { klienPeramban } from "@/lib/supabase/client";

type Mode = "masuk" | "daftar" | "lupa";

const POLA_HANDLE = /^[A-Za-z0-9_]{3,15}$/;
const PANJANG_SANDI = 8;

const JUDUL: Record<Mode, string> = {
  masuk: "Masuk ke akunmu",
  daftar: "Buat akun baru",
  lupa: "Atur ulang kata sandi",
};

/** Menerjemahkan pesan galat Supabase yang berbahasa Inggris. */
function terjemahkan(pesan: string) {
  const p = pesan.toLowerCase();
  if (p.includes("invalid login credentials")) {
    return "Email atau kata sandi salah.";
  }
  if (p.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Buka tautan yang kami kirim ke kotak masukmu.";
  }
  if (p.includes("user already registered") || p.includes("already been registered")) {
    return "Email ini sudah terdaftar. Coba masuk saja.";
  }
  if (p.includes("password should be at least")) {
    return `Kata sandi minimal ${PANJANG_SANDI} karakter.`;
  }
  if (p.includes("unable to validate email") || p.includes("invalid email")) {
    return "Format email tidak dikenali.";
  }
  if (p.includes("rate limit") || p.includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }
  if (p.includes("anonymous sign-ins are disabled") || p.includes("anonymous_provider_disabled")) {
    return "Masuk sebagai tamu belum diaktifkan. Nyalakan Anonymous Sign-Ins di Supabase Dashboard → Authentication → Sign In / Providers.";
  }
  if (p.includes("failed to fetch") || p.includes("networkerror")) {
    return "Tidak bisa menghubungi server. Periksa koneksi dan alamat Supabase.";
  }
  return pesan;
}

export default function AuthScreen() {
  const router = useRouter();
  const supabase = klienPeramban();

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
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { name: `Tamu ${nomor}`, handle: `tamu${nomor}` } },
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
        setGalat("Nama tampilan wajib diisi.");
        return;
      }
      if (!POLA_HANDLE.test(handle.trim())) {
        setGalat("Handle hanya boleh huruf, angka, dan garis bawah (3–15 karakter).");
        return;
      }
      if (statusHandle === "terpakai") {
        setGalat("Handle itu sudah dipakai orang lain.");
        return;
      }
      if (sandi.length < PANJANG_SANDI) {
        setGalat(`Kata sandi minimal ${PANJANG_SANDI} karakter.`);
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
        setKabar(
          "Kalau email itu terdaftar, tautan penggantian kata sandi sudah dikirim.",
        );
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
        setKabar(
          "Akun dibuat. Buka tautan konfirmasi yang kami kirim ke emailmu untuk mulai memakai akun.",
        );
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
    kosong: "3–15 karakter: huruf, angka, atau garis bawah.",
    salah: "Hanya huruf, angka, dan garis bawah, 3–15 karakter.",
    memeriksa: "Memeriksa ketersediaan…",
    "kosong-tersedia": `@${handle.trim()} masih tersedia.`,
    terpakai: `@${handle.trim()} sudah dipakai.`,
  };

  return (
    <div className="gerbang">
      <main className="gerbang-kartu">
        <div className="gerbang-merek">
          <Brand size={40} />
          <span className="gerbang-merek-teks">Twitter Mini</span>
        </div>

        <h1 className="gerbang-judul">{JUDUL[mode]}</h1>
        <p className="gerbang-sub">
          {mode === "lupa"
            ? "Masukkan email akunmu. Kami kirimkan tautan untuk membuat kata sandi baru."
            : "Komentar, balasan, dan profilmu tersimpan di akun ini."}
        </p>

        <form className="gerbang-form" onSubmit={kirim} noValidate>
          {mode === "daftar" && (
            <>
              <label className="bidang">
                <span className="bidang-label">Nama tampilan</span>
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
                <span className="bidang-label">Handle</span>
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
            <span className="bidang-label">Email</span>
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
              <span className="bidang-label">Kata sandi</span>
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
                  aria-label={
                    lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                  }
                >
                  <IkonMata size={19} tertutup={lihatSandi} />
                </button>
              </span>
              {mode === "daftar" && (
                <p className="bidang-bantuan">
                  Minimal {PANJANG_SANDI} karakter.
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
            {sibuk
              ? "Memproses…"
              : mode === "masuk"
                ? "Masuk"
                : mode === "daftar"
                  ? "Daftar"
                  : "Kirim tautan"}
          </button>
        </form>

        {mode !== "lupa" && (
          <>
            <div className="gerbang-pisah">
              <span>atau</span>
            </div>

            <button
              type="button"
              className="tombol tombol-garis tombol-lebar"
              onClick={masukTamu}
              disabled={sibuk}
            >
              <IkonTamu size={19} />
              <span>Masuk sebagai tamu</span>
            </button>
            <p className="gerbang-catatan">
              Tanpa email dan kata sandi. Kamu bisa langsung menulis komentar, dan
              akun tamu bisa diubah jadi permanen kapan saja dari dalam aplikasi.
            </p>
          </>
        )}

        <div className="gerbang-kaki">
          {mode === "masuk" && (
            <>
              <button type="button" className="tautan" onClick={() => gantiMode("lupa")}>
                Lupa kata sandi?
              </button>
              <p>
                Belum punya akun?{" "}
                <button type="button" className="tautan" onClick={() => gantiMode("daftar")}>
                  Daftar
                </button>
              </p>
            </>
          )}

          {mode === "daftar" && (
            <p>
              Sudah punya akun?{" "}
              <button type="button" className="tautan" onClick={() => gantiMode("masuk")}>
                Masuk
              </button>
            </p>
          )}

          {mode === "lupa" && (
            <button type="button" className="tautan" onClick={() => gantiMode("masuk")}>
              Kembali ke halaman masuk
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
