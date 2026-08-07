"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Avatar from "./Avatar";
import { IkonKalender, IkonKamera, IkonLokasi, IkonTerverifikasi } from "./Icons";
import { GalatFoto, siapkanFotoProfil } from "@/lib/image";
import { angkaPenuh, ringkasAngka } from "@/lib/time";
import type { User } from "@/lib/types";

const BATAS_BIO = 160;

type Props = {
  pengguna: User;
  jumlahKomentar: number;
  jumlahSukaDiterima: number;
  onSimpan: (
    perubahan: Pick<User, "name" | "bio" | "location" | "avatar">,
  ) => void;
};

export default function ProfileHeader({
  pengguna,
  jumlahKomentar,
  jumlahSukaDiterima,
  onSimpan,
}: Props) {
  const [menyunting, setMenyunting] = useState(false);
  const [nama, setNama] = useState(pengguna.name);
  const [bio, setBio] = useState(pengguna.bio);
  const [lokasi, setLokasi] = useState(pengguna.location);
  const [foto, setFoto] = useState(pengguna.avatar);
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);

  const berkasRef = useRef<HTMLInputElement>(null);

  /* Saat menyunting, avatar menampilkan pratinjau foto yang belum disimpan. */
  const pratinjau: User = menyunting ? { ...pengguna, avatar: foto } : pengguna;

  function buka() {
    setNama(pengguna.name);
    setBio(pengguna.bio);
    setLokasi(pengguna.location);
    setFoto(pengguna.avatar);
    setGalat(null);
    setMenyunting(true);
  }

  function tutup() {
    setGalat(null);
    setMenyunting(false);
  }

  async function pilihFoto(e: ChangeEvent<HTMLInputElement>) {
    const berkas = e.target.files?.[0];
    // Kosongkan nilainya agar memilih berkas yang sama dua kali tetap memicu onChange.
    e.target.value = "";
    if (!berkas) return;

    setGalat(null);
    setMemuat(true);
    try {
      setFoto(await siapkanFotoProfil(berkas));
    } catch (kesalahan) {
      setGalat(
        kesalahan instanceof GalatFoto
          ? kesalahan.message
          : "Foto gagal diproses. Coba gambar lain.",
      );
    } finally {
      setMemuat(false);
    }
  }

  function simpan() {
    const namaBersih = nama.trim();
    if (!namaBersih) return;
    onSimpan({
      name: namaBersih,
      bio: bio.trim(),
      location: lokasi.trim(),
      avatar: foto,
    });
    setMenyunting(false);
  }

  return (
    <section className="profil" aria-label="Profil">
      <div className="profil-sampul" />

      <div className="profil-atas">
        <div className="profil-avatar">
          <Avatar pengguna={pratinjau} ukuran={128} />

          {menyunting && (
            <>
              <input
                ref={berkasRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={pilihFoto}
              />
              <button
                type="button"
                className="foto-lapis"
                onClick={() => berkasRef.current?.click()}
                disabled={memuat}
                aria-label={
                  foto ? "Ganti foto profil" : "Unggah foto profil"
                }
              >
                <span className="foto-bulat">
                  <IkonKamera size={22} />
                </span>
              </button>
            </>
          )}
        </div>

        {menyunting ? (
          <div className="profil-tombol">
            <button type="button" className="tombol tombol-garis" onClick={tutup}>
              Batal
            </button>
            <button
              type="button"
              className="tombol tombol-utama"
              onClick={simpan}
              disabled={
                memuat || nama.trim().length === 0 || bio.length > BATAS_BIO
              }
            >
              Simpan
            </button>
          </div>
        ) : (
          <div className="profil-tombol">
            <button type="button" className="tombol tombol-garis" onClick={buka}>
              Edit profil
            </button>
          </div>
        )}
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
                onClick={() => berkasRef.current?.click()}
                disabled={memuat}
              >
                {memuat ? "Memproses…" : foto ? "Ganti foto" : "Unggah foto"}
              </button>
              {foto && (
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => {
                    setFoto(null);
                    setGalat(null);
                  }}
                  disabled={memuat}
                >
                  Hapus foto
                </button>
              )}
            </div>
            <p className="bidang-bantuan">
              JPG, PNG, atau WebP hingga 8 MB. Gambar dipangkas persegi dari bagian
              tengah.
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
              <span className={`bidang-sisa${bio.length > BATAS_BIO ? " bidang-sisa-lebih" : ""}`}>
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
              <span>Bergabung {pengguna.joinedAt}</span>
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
