"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Avatar from "./Avatar";
import {
  IkonGambar,
  IkonKalender,
  IkonKamera,
  IkonLokasi,
  IkonTerverifikasi,
  IkonTutup,
} from "./Icons";
import { klienPeramban } from "@/lib/supabase/client";
import { hapusMedia, simpanProfil, unggahMedia } from "@/lib/api";
import {
  GalatFoto,
  bebaskanPratinjau,
  siapkanGambar,
  type Gambar,
  type JenisMedia,
} from "@/lib/image";
import { angkaPenuh, bulanTahun, ringkasAngka } from "@/lib/time";
import type { User } from "@/lib/types";

const BATAS_BIO = 160;

/** Media yang menunggu disimpan: berkas baru, dihapus, atau tidak diubah. */
type Tertunda = { gambar: Gambar } | { hapus: true } | null;

type Props = {
  pengguna: User;
  jumlahKomentar: number;
  jumlahSukaDiterima: number;
  onSimpan: (pengguna: User) => void;
  onKabar: (pesan: string) => void;
};

export default function ProfileHeader({
  pengguna,
  jumlahKomentar,
  jumlahSukaDiterima,
  onSimpan,
  onKabar,
}: Props) {
  const supabase = klienPeramban();

  const [menyunting, setMenyunting] = useState(false);
  const [nama, setNama] = useState(pengguna.name);
  const [bio, setBio] = useState(pengguna.bio);
  const [lokasi, setLokasi] = useState(pengguna.location);

  const [avatarTertunda, setAvatarTertunda] = useState<Tertunda>(null);
  const [sampulTertunda, setSampulTertunda] = useState<Tertunda>(null);

  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState<JenisMedia | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const sampulRef = useRef<HTMLInputElement>(null);

  function nilaiTertunda(tertunda: Tertunda, asli: string | null) {
    if (!tertunda) return asli;
    return "hapus" in tertunda ? null : tertunda.gambar.pratinjau;
  }

  const avatarTampil = menyunting
    ? nilaiTertunda(avatarTertunda, pengguna.avatar)
    : pengguna.avatar;
  const sampulTampil = menyunting
    ? nilaiTertunda(sampulTertunda, pengguna.banner)
    : pengguna.banner;

  /* Object URL pratinjau dilepas begitu digantikan atau saat form ditinggalkan.
     Dua efek terpisah supaya mengganti sampul tidak ikut membatalkan pratinjau
     avatar yang masih dipakai. */
  const pratinjauAvatar =
    avatarTertunda && "gambar" in avatarTertunda ? avatarTertunda.gambar.pratinjau : null;
  const pratinjauSampul =
    sampulTertunda && "gambar" in sampulTertunda ? sampulTertunda.gambar.pratinjau : null;

  useEffect(() => () => bebaskanPratinjau(pratinjauAvatar), [pratinjauAvatar]);
  useEffect(() => () => bebaskanPratinjau(pratinjauSampul), [pratinjauSampul]);

  const pratinjauAkun: User = { ...pengguna, avatar: avatarTampil };

  function buka() {
    setNama(pengguna.name);
    setBio(pengguna.bio);
    setLokasi(pengguna.location);
    setAvatarTertunda(null);
    setSampulTertunda(null);
    setGalat(null);
    setMenyunting(true);
  }

  function tutup() {
    setAvatarTertunda(null);
    setSampulTertunda(null);
    setGalat(null);
    setMenyunting(false);
  }

  async function pilihBerkas(e: ChangeEvent<HTMLInputElement>, jenis: JenisMedia) {
    const berkas = e.target.files?.[0];
    // Kosongkan nilainya agar memilih berkas yang sama dua kali tetap memicu onChange.
    e.target.value = "";
    if (!berkas) return;

    setGalat(null);
    setMemuat(jenis);
    try {
      const gambar = await siapkanGambar(berkas, jenis);
      const setter = jenis === "avatar" ? setAvatarTertunda : setSampulTertunda;
      setter({ gambar });
    } catch (kesalahan) {
      setGalat(
        kesalahan instanceof GalatFoto
          ? kesalahan.message
          : "Gambar gagal diproses. Coba berkas lain.",
      );
    } finally {
      setMemuat(null);
    }
  }

  function hapusTertunda(jenis: JenisMedia) {
    const setter = jenis === "avatar" ? setAvatarTertunda : setSampulTertunda;
    setter({ hapus: true });
    setGalat(null);
  }

  async function simpan() {
    const namaBersih = nama.trim();
    if (!namaBersih || bio.length > BATAS_BIO || menyimpan) return;

    setGalat(null);
    setMenyimpan(true);

    /* Berkas yang sudah diunggah dicatat supaya bisa dibersihkan bila
       penyimpanan profil gagal di langkah berikutnya. */
    const baruDiunggah: { jenis: JenisMedia; alamat: string }[] = [];

    try {
      let alamatAvatar = pengguna.avatar;
      let alamatSampul = pengguna.banner;

      if (avatarTertunda) {
        alamatAvatar =
          "hapus" in avatarTertunda
            ? null
            : await unggahMedia(supabase, pengguna.id, "avatar", avatarTertunda.gambar);
        if (alamatAvatar) baruDiunggah.push({ jenis: "avatar", alamat: alamatAvatar });
      }

      if (sampulTertunda) {
        alamatSampul =
          "hapus" in sampulTertunda
            ? null
            : await unggahMedia(supabase, pengguna.id, "sampul", sampulTertunda.gambar);
        if (alamatSampul) baruDiunggah.push({ jenis: "sampul", alamat: alamatSampul });
      }

      const tersimpan = await simpanProfil(supabase, pengguna.id, {
        name: namaBersih,
        bio: bio.trim(),
        location: lokasi.trim(),
        avatar_url: alamatAvatar,
        banner_url: alamatSampul,
      });

      /* Berkas lama baru dibuang setelah baris profil benar-benar tersimpan.
         Kegagalan di sini hanya menyisakan berkas yatim, bukan alasan untuk
         menganggap penyuntingan gagal. */
      if (avatarTertunda && pengguna.avatar && pengguna.avatar !== alamatAvatar) {
        await hapusMedia(supabase, "avatar", pengguna.avatar).catch(() => {});
      }
      if (sampulTertunda && pengguna.banner && pengguna.banner !== alamatSampul) {
        await hapusMedia(supabase, "sampul", pengguna.banner).catch(() => {});
      }

      setAvatarTertunda(null);
      setSampulTertunda(null);
      setMenyunting(false);
      onSimpan(tersimpan);
    } catch (kesalahan) {
      for (const { jenis, alamat } of baruDiunggah) {
        await hapusMedia(supabase, jenis, alamat).catch(() => {});
      }
      const pesan =
        kesalahan && typeof kesalahan === "object" && "message" in kesalahan
          ? String((kesalahan as { message: unknown }).message)
          : "Profil gagal disimpan.";
      setGalat(
        pesan.includes("row-level security")
          ? "Tidak punya izin menyimpan perubahan ini."
          : pesan,
      );
      onKabar("Profil gagal disimpan");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <section className="profil" aria-label="Profil">
      <div
        className={`profil-sampul${sampulTampil ? " profil-sampul-foto" : ""}`}
        style={sampulTampil ? { backgroundImage: `url("${sampulTampil}")` } : undefined}
      >
        {menyunting && (
          <>
            <input
              ref={sampulRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pilihBerkas(e, "sampul")}
            />
            <div className="sampul-aksi">
              <button
                type="button"
                className="sampul-tombol"
                onClick={() => sampulRef.current?.click()}
                disabled={memuat !== null || menyimpan}
                aria-label={sampulTampil ? "Ganti sampul" : "Unggah sampul"}
              >
                <IkonGambar size={20} />
              </button>
              {sampulTampil && (
                <button
                  type="button"
                  className="sampul-tombol"
                  onClick={() => hapusTertunda("sampul")}
                  disabled={memuat !== null || menyimpan}
                  aria-label="Hapus sampul"
                >
                  <IkonTutup size={20} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="profil-atas">
        <div className="profil-avatar">
          <Avatar pengguna={pratinjauAkun} ukuran={128} />

          {menyunting && (
            <>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => pilihBerkas(e, "avatar")}
              />
              <button
                type="button"
                className="foto-lapis"
                onClick={() => avatarRef.current?.click()}
                disabled={memuat !== null || menyimpan}
                aria-label={avatarTampil ? "Ganti foto profil" : "Unggah foto profil"}
              >
                <span className="foto-bulat">
                  <IkonKamera size={22} />
                </span>
              </button>
            </>
          )}
        </div>

        <div className="profil-tombol">
          {menyunting ? (
            <>
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={tutup}
                disabled={menyimpan}
              >
                Batal
              </button>
              <button
                type="button"
                className="tombol tombol-utama"
                onClick={simpan}
                disabled={
                  menyimpan ||
                  memuat !== null ||
                  nama.trim().length === 0 ||
                  bio.length > BATAS_BIO
                }
              >
                {menyimpan ? "Menyimpan…" : "Simpan"}
              </button>
            </>
          ) : (
            <button type="button" className="tombol tombol-garis" onClick={buka}>
              Edit profil
            </button>
          )}
        </div>
      </div>

      {menyunting ? (
        <form
          className="profil-form"
          onSubmit={(e) => {
            e.preventDefault();
            simpan();
          }}
        >
          <div className="bidang">
            <span className="bidang-label">Foto profil</span>
            <div className="foto-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => avatarRef.current?.click()}
                disabled={memuat !== null || menyimpan}
              >
                {memuat === "avatar" ? "Memproses…" : avatarTampil ? "Ganti foto" : "Unggah foto"}
              </button>
              {avatarTampil && (
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => hapusTertunda("avatar")}
                  disabled={memuat !== null || menyimpan}
                >
                  Hapus foto
                </button>
              )}
            </div>
            <p className="bidang-bantuan">
              Dipangkas persegi dari bagian tengah, lalu dikecilkan ke 400 px.
            </p>
          </div>

          <div className="bidang">
            <span className="bidang-label">Sampul</span>
            <div className="foto-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => sampulRef.current?.click()}
                disabled={memuat !== null || menyimpan}
              >
                {memuat === "sampul" ? "Memproses…" : sampulTampil ? "Ganti sampul" : "Unggah sampul"}
              </button>
              {sampulTampil && (
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => hapusTertunda("sampul")}
                  disabled={memuat !== null || menyimpan}
                >
                  Hapus sampul
                </button>
              )}
            </div>
            <p className="bidang-bantuan">
              JPG, PNG, atau WebP hingga 8 MB. Dipangkas 3:1 lalu dikecilkan ke
              1500 × 500 px.
            </p>
            {galat && (
              <p className="bidang-galat" role="alert">
                {galat}
              </p>
            )}
          </div>

          <label className="bidang">
            <span className="bidang-label">Nama</span>
            <input
              className="bidang-masukan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </label>

          <label className="bidang">
            <span className="bidang-label">
              Bio
              <span
                className={`bidang-sisa${bio.length > BATAS_BIO ? " bidang-sisa-lebih" : ""}`}
              >
                {BATAS_BIO - bio.length}
              </span>
            </span>
            <textarea
              className="bidang-masukan bidang-area"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </label>

          <label className="bidang">
            <span className="bidang-label">Lokasi</span>
            <input
              className="bidang-masukan"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              maxLength={40}
            />
          </label>
        </form>
      ) : (
        <div className="profil-detail">
          <h1 className="profil-nama">
            {pengguna.name}
            {pengguna.verified && <IkonTerverifikasi className="lencana" size={20} />}
          </h1>
          <p className="profil-handle">@{pengguna.handle}</p>

          {pengguna.bio && <p className="profil-bio">{pengguna.bio}</p>}

          <ul className="profil-meta">
            {pengguna.location && (
              <li>
                <IkonLokasi size={17} />
                <span>{pengguna.location}</span>
              </li>
            )}
            <li>
              <IkonKalender size={17} />
              <span>Bergabung {bulanTahun(pengguna.joinedAt)}</span>
            </li>
          </ul>

          <ul className="profil-angka">
            <li>
              <strong>{angkaPenuh(pengguna.following)}</strong> Mengikuti
            </li>
            <li>
              <strong>{angkaPenuh(pengguna.followers)}</strong> Pengikut
            </li>
          </ul>

          <ul className="profil-statistik">
            <li>
              <strong>{angkaPenuh(jumlahKomentar)}</strong>
              <span>Komentar</span>
            </li>
            <li>
              <strong>{ringkasAngka(jumlahSukaDiterima)}</strong>
              <span>Suka diterima</span>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
