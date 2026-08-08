"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import Avatar from "./Avatar";
import KelolaLencana from "./KelolaLencana";
import Lencana from "./Lencana";
import {
  IkonGambar,
  IkonKalender,
  IkonKamera,
  IkonLokasi,
  IkonTutup,
  IkonX,
} from "./Icons";
import type { JenisKabar } from "./Kabar";
import { useBahasa } from "@/lib/i18n/konteks";
import { klienPeramban } from "@/lib/supabase/client";
import { hapusMedia, simpanProfil, unggahMedia } from "@/lib/api";
import {
  GalatFoto,
  bebaskanPratinjau,
  siapkanGambar,
  type Gambar,
  type JenisMedia,
} from "@/lib/image";
import type { KodeLencana } from "@/lib/lencana";
import { bacaProfilX, tautanProfilX } from "@/lib/tautan";
import { angkaPenuh, angkaSosial, bulanTahun } from "@/lib/time";
import type { User } from "@/lib/types";

const BATAS_BIO = 160;

/** Media yang menunggu disimpan: berkas baru, dihapus, atau tidak diubah. */
type Tertunda = { gambar: Gambar } | { hapus: true } | null;

type Props = {
  pengguna: User;
  /** profil sendiri boleh disunting; profil orang lain hanya bisa diikuti */
  milikSaya: boolean;
  /** yang sedang masuk adalah admin; panel lencana hanya tampil untuknya */
  adminSaya: boolean;
  mengikuti: boolean;
  menungguIkut: boolean;
  jumlahKomentar: number;
  jumlahSukaDiterima: number;
  onIkuti: () => void;
  onSimpan: (pengguna: User) => void;
  onLencana: (daftar: KodeLencana[]) => void;
  onKabar: (pesan: string, jenis?: JenisKabar) => void;
};

export default function ProfileHeader({
  pengguna,
  milikSaya,
  adminSaya,
  mengikuti,
  menungguIkut,
  jumlahKomentar,
  jumlahSukaDiterima,
  onIkuti,
  onSimpan,
  onLencana,
  onKabar,
}: Props) {
  const { bahasa, t } = useBahasa();
  const supabase = klienPeramban();

  const [menyunting, setMenyunting] = useState(false);
  const [nama, setNama] = useState(pengguna.name);
  const [bio, setBio] = useState(pengguna.bio);
  const [lokasi, setLokasi] = useState(pengguna.location);
  const [akunX, setAkunX] = useState(pengguna.xUsername ?? "");

  const [avatarTertunda, setAvatarTertunda] = useState<Tertunda>(null);
  const [sampulTertunda, setSampulTertunda] = useState<Tertunda>(null);

  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState<JenisMedia | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const sampulRef = useRef<HTMLInputElement>(null);

  const idAkunX = useId();

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

  /* Isian akun X dibaca selapang kotak pengajuan misi: tautan penuh, tautan
     tanpa protokol, @nama, atau nama polos — semuanya berakhir sebagai handle
     bersih. Kosong berarti tautannya dilepas. */
  const handleX = bacaProfilX(akunX);
  const akunXKosong = akunX.trim().length === 0;
  const akunXSalah = !akunXKosong && !handleX;

  function buka() {
    setNama(pengguna.name);
    setBio(pengguna.bio);
    setLokasi(pengguna.location);
    setAkunX(pengguna.xUsername ?? "");
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
        t(kesalahan instanceof GalatFoto ? kesalahan.kunci : "foto.gagalProses"),
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
    if (!namaBersih || bio.length > BATAS_BIO || akunXSalah || menyimpan) return;

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
        x_username: handleX,
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
          : t("profil.galatSimpan");
      setGalat(
        pesan.includes("row-level security") ? t("profil.galatIzin") : pesan,
      );
      onKabar(t("pesan.profilGagal"), "galat");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <section className="profil" aria-label={t("profil.label")}>
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
                aria-label={t(sampulTampil ? "profil.gantiSampul" : "profil.unggahSampul")}
              >
                <IkonGambar size={20} />
              </button>
              {sampulTampil && (
                <button
                  type="button"
                  className="sampul-tombol"
                  onClick={() => hapusTertunda("sampul")}
                  disabled={memuat !== null || menyimpan}
                  aria-label={t("profil.hapusSampul")}
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
                aria-label={t(avatarTampil ? "profil.gantiFoto" : "profil.unggahFoto")}
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
                {t("umum.batal")}
              </button>
              <button
                type="button"
                className="tombol tombol-utama"
                onClick={simpan}
                disabled={
                  menyimpan ||
                  memuat !== null ||
                  nama.trim().length === 0 ||
                  bio.length > BATAS_BIO ||
                  akunXSalah
                }
              >
                {t(menyimpan ? "umum.menyimpan" : "umum.simpan")}
              </button>
            </>
          ) : milikSaya ? (
            <button type="button" className="tombol tombol-garis" onClick={buka}>
              {t("profil.edit")}
            </button>
          ) : (
            /* Label berganti saat kursor menyentuhnya — sama seperti di Twitter,
               "Mengikuti" berubah menjadi "Berhenti mengikuti" tepat sebelum
               ditekan, jadi tidak ada yang batal mengikuti tanpa sadar. */
            <button
              type="button"
              className={`tombol tombol-ikut${mengikuti ? " tombol-garis tombol-ikut-aktif" : " tombol-utama"}`}
              onClick={onIkuti}
              disabled={menungguIkut}
              aria-pressed={mengikuti}
            >
              {mengikuti ? (
                <>
                  <span className="ikut-tetap">{t("profil.sedangMengikuti")}</span>
                  <span className="ikut-ganti">{t("profil.berhentiIkuti")}</span>
                </>
              ) : (
                t("profil.ikuti")
              )}
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
            <span className="bidang-label">{t("profil.fotoProfil")}</span>
            <div className="foto-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => avatarRef.current?.click()}
                disabled={memuat !== null || menyimpan}
              >
                {memuat === "avatar"
                  ? t("umum.memproses")
                  : t(avatarTampil ? "profil.gantiFotoSingkat" : "profil.unggahFotoSingkat")}
              </button>
              {avatarTampil && (
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => hapusTertunda("avatar")}
                  disabled={memuat !== null || menyimpan}
                >
                  {t("profil.hapusFoto")}
                </button>
              )}
            </div>
            <p className="bidang-bantuan">{t("profil.bantuanFoto")}</p>
          </div>

          <div className="bidang">
            <span className="bidang-label">{t("profil.sampul")}</span>
            <div className="foto-aksi">
              <button
                type="button"
                className="tombol tombol-garis"
                onClick={() => sampulRef.current?.click()}
                disabled={memuat !== null || menyimpan}
              >
                {memuat === "sampul"
                  ? t("umum.memproses")
                  : t(sampulTampil ? "profil.gantiSampul" : "profil.unggahSampul")}
              </button>
              {sampulTampil && (
                <button
                  type="button"
                  className="tombol tombol-sunyi"
                  onClick={() => hapusTertunda("sampul")}
                  disabled={memuat !== null || menyimpan}
                >
                  {t("profil.hapusSampul")}
                </button>
              )}
            </div>
            <p className="bidang-bantuan">{t("profil.bantuanSampul")}</p>
            {galat && (
              <p className="bidang-galat" role="alert">
                {galat}
              </p>
            )}
          </div>

          {/* Tanpa autoFocus. Di ponsel, menyorot kotak ini otomatis membuka
              papan tik seketika — separuh layar tertutup sebelum sempat
              melihat foto, sampul, dan bio yang justru lebih sering diubah.
              Papan tik baru naik ketika kotaknya benar-benar disentuh. */}
          <label className="bidang">
            <span className="bidang-label">{t("profil.nama")}</span>
            <input
              className="bidang-masukan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              maxLength={50}
            />
          </label>

          <label className="bidang">
            <span className="bidang-label">
              {t("profil.bio")}
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
            <span className="bidang-label">{t("profil.lokasi")}</span>
            <input
              className="bidang-masukan"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              maxLength={40}
            />
          </label>

          {/* Sebuah <div>, bukan <label> yang membungkus semuanya: keterangan
              dan galatnya paragraf, dan paragraf tidak boleh tinggal di dalam
              label. Kotaknya tetap terhubung lewat htmlFor, seperti bidang foto
              di atas. */}
          <div className="bidang">
            <label className="bidang-label" htmlFor={idAkunX}>
              {t("profil.akunX")}
            </label>
            <input
              id={idAkunX}
              className="bidang-masukan"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder={t("profil.akunXBayangan")}
              value={akunX}
              onChange={(e) => setAkunX(e.target.value)}
              maxLength={60}
            />
            {akunXSalah ? (
              <p className="bidang-galat" role="alert">
                {t("profil.akunXSalah")}
              </p>
            ) : (
              <p className="bidang-bantuan">{t("profil.akunXBantuan")}</p>
            )}
          </div>
        </form>
      ) : (
        <div className="profil-detail">
          <h1 className="profil-nama">
            {pengguna.name}
            <Lencana pengguna={pengguna} size={21} />
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

            {/* Satu-satunya butir meta yang bisa ditekan, dan ia sengaja tidak
                digambar seperti tautan: warna, ukuran, dan jaraknya sama persis
                dengan lokasi di sebelahnya. Yang menyatakan ia bisa ditekan
                cukup lambang X-nya, lalu kursor dan garis bawah yang muncul
                saat disentuh. */}
            {pengguna.xUsername && (
              <li>
                <a
                  className="profil-x"
                  href={tautanProfilX(pengguna.xUsername)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  title={t("profil.akunXBuka", { akun: pengguna.xUsername })}
                >
                  <IkonX size={15} />
                  <span>@{pengguna.xUsername}</span>
                </a>
              </li>
            )}

            <li>
              <IkonKalender size={17} />
              <span>{t("profil.bergabung", { waktu: bulanTahun(pengguna.joinedAt, bahasa) })}</span>
            </li>
          </ul>

          {/* Angka ringkas seperti di Twitter, angka penuhnya tetap terbaca
              lewat judul saat kursor berhenti di atasnya. */}
          <ul className="profil-angka">
            <li title={angkaPenuh(pengguna.following, bahasa)}>
              <strong>{angkaSosial(pengguna.following, bahasa)}</strong>{" "}
              {t("profil.mengikuti")}
            </li>
            <li title={angkaPenuh(pengguna.followers, bahasa)}>
              <strong>{angkaSosial(pengguna.followers, bahasa)}</strong>{" "}
              {t("profil.pengikut")}
            </li>
          </ul>

          <ul className="profil-statistik">
            <li title={angkaPenuh(jumlahKomentar, bahasa)}>
              <strong>{angkaSosial(jumlahKomentar, bahasa)}</strong>
              <span>{t("profil.komentar")}</span>
            </li>
            <li title={angkaPenuh(jumlahSukaDiterima, bahasa)}>
              <strong>{angkaSosial(jumlahSukaDiterima, bahasa)}</strong>
              <span>{t("profil.sukaDiterima")}</span>
            </li>
          </ul>

          {/* Satu-satunya jalan sebuah lencana berpindah tangan, dan ia hanya
              ada di profil orang lain: lencana sendiri tidak diberikan sendiri,
              sekalipun oleh admin. */}
          {adminSaya && !milikSaya && (
            <KelolaLencana
              pengguna={pengguna}
              onUbah={onLencana}
              onKabar={onKabar}
            />
          )}
        </div>
      )}
    </section>
  );
}
