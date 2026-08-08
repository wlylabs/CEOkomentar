"use client";

import { useEffect, useState } from "react";
import JamEmas from "./JamEmas";
import {
  IkonBuka,
  IkonCentang,
  IkonGembok,
  IkonInfo,
  IkonJam,
  IkonPeringatan,
  IkonX,
} from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import {
  BERKAS_BOBOT,
  BOBOT,
  REPO_ALGORITMA,
  REPO_ALGORITMA_ML,
  SARING,
  SUMBER,
  TAHAP,
  panjangBobot,
  setaraSuka,
} from "@/lib/algoritmaArsip";
import {
  AKSI,
  AKSI_RUGI,
  AKSI_UNTUNG,
  BERKAS_GROX,
  BERKAS_PERINGKAT,
  BERKAS_PHOENIX,
  GROX,
  KEBIJAKAN_AMAN,
  KOMIT_KINI,
  LANGKAH,
  MEKANIK,
  REPO_KINI,
  SUMBER_KINI,
  TAHAP_KINI,
  TAK_TERBIT,
  TANGGAL_KINI,
} from "@/lib/algoritmaKini";
import { isyaratJamEmas, tanggalWIB } from "@/lib/jamEmas";
import {
  DIPERIKSA,
  LARANGAN,
  PROGRAM,
  STUDIO,
  SYARAT,
  TAUTAN_STANDAR,
} from "@/lib/kreator";
import {
  RENCANA,
  bacaRencana,
  simpanRencana,
  type KodeLangkah,
} from "@/lib/rencana";
import { TULIS_DI_X, tautanProfilX } from "@/lib/tautan";
import { angkaDesimal, angkaPenuh, bulanTahun } from "@/lib/time";

type Props = {
  /** epoch ms dari jam aplikasi; kartu jam emas dan rencana ikut berdetak */
  sekarang: number;
  /** handle X pemilik akun tanpa @; null berarti belum diisi di sunting profil */
  akunX: string | null;
  /** membuka halaman profil, tempat akun X diisi */
  onProfil: () => void;
};

/**
 * Panduan mengembangkan akun X lewat Twitter Mini.
 *
 * Tiga bahan yang sudah dimiliki aplikasi ini disatukan menjadi satu halaman
 * yang bisa dikerjakan: jam emas audiens Indonesia yang sudah dihitung
 * `lib/jamEmas.ts`, bacaan atas kode perekomendasi X yang dibuka Twitter di
 * `lib/algoritma.ts`, dan kebijakan Creator Studio di `lib/kreator.ts`.
 *
 * Urutannya bukan urutan kepentingan melainkan urutan waktu: apa yang bisa
 * dilakukan sekarang lebih dulu (jam emas dan rencana hari ini), baru
 * penjelasan mengapa (bagaimana linimasa memilih), lalu pagar yang membatasi
 * seluruhnya (kebijakan monetisasi). Yang membaca dari atas mendapat pekerjaan
 * di menit pertama; yang ingin memeriksa dasarnya tinggal menggulir.
 */
export default function Panduan({ sekarang, akunX, onProfil }: Props) {
  const { bahasa, t } = useBahasa();

  const isyarat = isyaratJamEmas(sekarang);
  const diJamEmas = isyarat.jendela !== null;

  return (
    <div className="panduan">
      {/* ----------------------------------------------------------------
          Kapan menulis
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">
          <IkonJam size={17} />
          {t("panduan.kapan")}
        </h2>
        <p className="pan-sub">{t("panduan.kapanSub")}</p>

        <JamEmas sekarang={sekarang} />

        <TombolTulis akunX={akunX} diJamEmas={diJamEmas} onProfil={onProfil} />
      </section>

      {/* ----------------------------------------------------------------
          Rencana hari ini
          ---------------------------------------------------------------- */}
      <Rencana sekarang={sekarang} />

      {/* ----------------------------------------------------------------
          Mesin yang berjalan sekarang — rilis xai-org 2026
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">
          <IkonInfo size={17} />
          {t("panduan.kini")}
        </h2>
        <p className="pan-sub">{t("panduan.kiniSub")}</p>

        <p className="pan-kutip">{t("panduan.kiniKutip")}</p>

        <h3 className="pan-tajuk">{t("panduan.kiniSumber")}</h3>
        <ul className="pan-daftar">
          {SUMBER_KINI.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.kiniTahap")}</h3>
        <ol className="pan-tahap">
          {TAHAP_KINI.map((tahap, nomor) => (
            <li key={tahap.kode}>
              <span className="pan-tahap-nomor" aria-hidden="true">
                {nomor + 1}
              </span>
              <span className="pan-tahap-teks">
                <strong>{t(tahap.nama)}</strong>
                <span>{t(tahap.teks)}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* Dua puluh dua nama tanpa satu pun angka. Kepingan, bukan daftar
            berketerangan: yang perlu terbaca di sini panjang daftarnya dan di
            sisi mana tiap namanya berdiri, bukan penjelasan satu per satu. */}
        <h3 className="pan-tajuk">{t("panduan.kiniAksi")}</h3>
        <p className="pan-baris-teks">
          {t("panduan.kiniAksiTeks", {
            jumlah: AKSI.length,
            untung: AKSI_UNTUNG,
            rugi: AKSI_RUGI,
          })}
        </p>
        <ul className="pan-aksi-daftar">
          {AKSI.map((aksi) => (
            <li
              key={aksi.medan}
              className={`pan-aksi-keping${aksi.rugi ? " pan-aksi-rugi" : ""}`}
              title={aksi.medan}
            >
              {t(aksi.nama)}
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.kiniMekanik")}</h3>
        <ul className="pan-daftar">
          {MEKANIK.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <code className="pan-rumus">{butir.rumus}</code>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.kiniGrox")}</h3>
        <ul className="pan-daftar">
          {GROX.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <ul className="pan-aksi-daftar">
          {KEBIJAKAN_AMAN.map((kunci) => (
            <li className="pan-aksi-keping pan-aksi-rugi" key={kunci}>
              {t(kunci)}
            </li>
          ))}
        </ul>

        {/* Batas rilisnya, dan alasan blok arsip di bawah masih berdiri. */}
        <h3 className="pan-tajuk">{t("panduan.kiniTakTerbit")}</h3>
        <ul className="pan-daftar">
          {TAK_TERBIT.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <p className="pan-catatan">
          {t("panduan.kiniCatatan", { komit: KOMIT_KINI, tanggal: TANGGAL_KINI })}
        </p>
      </section>

      {/* ----------------------------------------------------------------
          Arsip 2023 — satu-satunya angka yang pernah diterbitkan
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">{t("panduan.arsip")}</h2>
        <p className="pan-sub">{t("panduan.arsipSub")}</p>

        <ol className="pan-tahap">
          {TAHAP.map((tahap, nomor) => (
            <li key={tahap.kode}>
              <span className="pan-tahap-nomor" aria-hidden="true">
                {nomor + 1}
              </span>
              <span className="pan-tahap-teks">
                <strong>{t(tahap.nama)}</strong>
                <span>{t(tahap.teks)}</span>
              </span>
            </li>
          ))}
        </ol>

        <h3 className="pan-tajuk">{t("panduan.sumber")}</h3>
        <ul className="pan-daftar">
          {SUMBER.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
                {butir.tanda && (
                  <span className="pan-keping">{t(butir.tanda)}</span>
                )}
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.saring")}</h3>
        <ul className="pan-daftar">
          {SARING.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------
          Bobot sinyal
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">{t("panduan.bobot")}</h2>
        <p className="pan-sub">{t("panduan.bobotSub")}</p>

        <ul className="pan-bobot">
          {BOBOT.map((butir) => {
            const rugi = butir.nilai < 0;
            return (
              <li
                className={`pan-bobot-butir${rugi ? " pan-bobot-rugi" : ""}`}
                key={butir.kode}
              >
                <span className="pan-bobot-kepala">
                  <strong>{t(butir.nama)}</strong>
                  <span className="pan-bobot-angka">
                    {angkaDesimal(butir.nilai, bahasa)}
                  </span>
                </span>

                <span className="pan-bobot-meter" aria-hidden="true">
                  <span style={{ width: `${panjangBobot(butir.nilai)}%` }} />
                </span>

                <span className="pan-bobot-arti">{t(butir.arti)}</span>
                <span className="pan-bobot-setara">
                  {t(rugi ? "panduan.setaraRugi" : "panduan.setaraUntung", {
                    jumlah: angkaPenuh(setaraSuka(butir.nilai), bahasa),
                  })}
                </span>
                <code className="pan-parameter">{butir.parameter}</code>
              </li>
            );
          })}
        </ul>

        <p className="pan-catatan">{t("panduan.bobotCatatan")}</p>
      </section>

      {/* ----------------------------------------------------------------
          Turunannya untuk penulis
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">{t("panduan.langkah")}</h2>
        <p className="pan-sub">{t("panduan.langkahSub")}</p>

        <ul className="pan-daftar">
          {LANGKAH.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-teks pan-baris-utama">
                {t(butir.teks)}
              </span>
              <span className="pan-dasar">{t(butir.dasar)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------
          Creator Studio
          ---------------------------------------------------------------- */}
      <section className="pan-blok">
        <h2 className="pan-judul">
          <IkonX size={15} />
          {t("panduan.kreator")}
        </h2>
        <p className="pan-sub">{t("panduan.kreatorSub")}</p>

        <ul className="pan-daftar">
          {PROGRAM.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
                <a
                  className="pan-tautan"
                  href={butir.tautan}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("panduan.bacaAturan")}
                  <IkonBuka size={13} />
                </a>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.syarat")}</h3>
        <ul className="pan-daftar">
          {SYARAT.map((butir) => (
            <li key={butir.kode}>
              <span className="pan-baris-kepala">
                <strong>{t(butir.nama)}</strong>
              </span>
              <span className="pan-baris-teks">{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <h3 className="pan-tajuk">{t("panduan.larangan")}</h3>
        <ul className="pan-larangan">
          {LARANGAN.map((butir) => (
            <li key={butir.kode}>
              <IkonPeringatan size={15} />
              <span>{t(butir.teks)}</span>
            </li>
          ))}
        </ul>

        <div className="pan-aksi">
          <a
            className="tombol tombol-garis"
            href={STUDIO}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IkonX size={15} />
            <span>{t("panduan.bukaStudio")}</span>
          </a>
          <a
            className="tombol tombol-garis"
            href={TAUTAN_STANDAR}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IkonBuka size={15} />
            <span>{t("panduan.bukaStandar")}</span>
          </a>
        </div>

        <p className="pan-catatan">
          {t("panduan.kreatorCatatan", {
            waktu: bulanTahun(DIPERIKSA, bahasa),
          })}
        </p>
      </section>

      {/* ----------------------------------------------------------------
          Dari mana angkanya
          ---------------------------------------------------------------- */}
      <section className="pan-blok pan-blok-sumber">
        <h2 className="pan-judul">{t("panduan.rujukan")}</h2>
        <ul className="pan-rujukan">
          <li>
            <a href={REPO_KINI} target="_blank" rel="noopener noreferrer">
              xai-org/x-algorithm
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanKini")}</span>
          </li>
          <li>
            <a href={BERKAS_PERINGKAT} target="_blank" rel="noopener noreferrer">
              home-mixer/scorers/ranking_scorer.rs
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanPeringkat")}</span>
          </li>
          <li>
            <a href={BERKAS_PHOENIX} target="_blank" rel="noopener noreferrer">
              phoenix/README.md
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanPhoenix")}</span>
          </li>
          <li>
            <a href={BERKAS_GROX} target="_blank" rel="noopener noreferrer">
              grox/
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanGrox")}</span>
          </li>
          <li>
            <a href={REPO_ALGORITMA} target="_blank" rel="noopener noreferrer">
              twitter/the-algorithm
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanRepo")}</span>
          </li>
          <li>
            <a href={REPO_ALGORITMA_ML} target="_blank" rel="noopener noreferrer">
              twitter/the-algorithm-ml
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanMl")}</span>
          </li>
          <li>
            <a href={BERKAS_BOBOT} target="_blank" rel="noopener noreferrer">
              projects/home/recap/README.md
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanBobot")}</span>
          </li>
          <li>
            <a href={TAUTAN_STANDAR} target="_blank" rel="noopener noreferrer">
              help.x.com
              <IkonBuka size={13} />
            </a>
            <span>{t("panduan.rujukanX")}</span>
          </li>
        </ul>
        <p className="pan-catatan">{t("panduan.rujukanCatatan")}</p>
      </section>
    </div>
  );
}

/**
 * Tombol yang menyeberang ke X.
 *
 * Seluruh panduan ini tentang akun X sungguhan, jadi ajakan menulisnya pun
 * bermuara di sana, bukan di kotak tulis aplikasi ini — yang itu tetap ada satu
 * sentuhan jauhnya lewat tombol melayang dan navigasi bawah.
 *
 * Kuncinya bukan pagar keamanan melainkan urutan kerja: tanpa akun X yang
 * tertulis di profil, aplikasi tidak tahu akun mana yang sedang dikembangkan,
 * dan tombol yang tetap terbuka hanya akan melemparkan pemakai ke halaman X
 * yang tidak ada hubungannya dengan panduan yang baru saja dibacanya. Karena
 * itu keadaan terkuncinya tidak berhenti pada "tidak bisa": ia menyebutkan apa
 * yang kurang sekaligus membukakan jalan ke tempat mengisinya.
 */
function TombolTulis({
  akunX,
  diJamEmas,
  onProfil,
}: {
  akunX: string | null;
  diJamEmas: boolean;
  onProfil: () => void;
}) {
  const { t } = useBahasa();

  if (!akunX) {
    return (
      <div className="pan-kunci">
        <button
          type="button"
          className="tombol tombol-lebar tombol-garis"
          title={t("panduan.tulisKunciTeks")}
          disabled
        >
          <IkonGembok size={17} />
          <span>{t("panduan.tulisKunci")}</span>
        </button>
        <p className="pan-kunci-teks">{t("panduan.tulisKunciTeks")}</p>
        <button
          type="button"
          className="tombol tombol-kecil tombol-garis"
          onClick={onProfil}
        >
          {t("panduan.tulisKunciAksi")}
        </button>
      </div>
    );
  }

  return (
    <div className="pan-kunci">
      <a
        className={`tombol tombol-lebar${diJamEmas ? " tombol-utama" : " tombol-garis"}`}
        href={TULIS_DI_X}
        target="_blank"
        rel="noopener noreferrer"
      >
        <IkonX size={15} />
        <span>{t(diJamEmas ? "panduan.tulisXKini" : "panduan.tulisX")}</span>
        <IkonBuka size={14} />
      </a>

      {/* Akun mana yang sedang dikembangkan, sekaligus jalan memeriksanya:
          menekan namanya membuka profil X-nya sendiri, bukan kotak tulis. */}
      <p className="pan-kunci-teks">
        {t("panduan.tulisXSebagai")}{" "}
        <a
          className="pan-tautan"
          href={tautanProfilX(akunX)}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          @{akunX}
          <IkonBuka size={13} />
        </a>
      </p>
    </div>
  );
}

/**
 * Daftar kerja hari ini.
 *
 * Centangnya hidup di penyimpanan lokal, dan kunci hariannya tanggal WIB —
 * sama dengan jam emasnya, jadi daftarnya berganti bersama audiens yang
 * dilayaninya. Pembacaan pertama sengaja ditaruh di efek, bukan di nilai awal
 * `useState`: server tidak punya penyimpanan lokal, dan menebaknya di sana
 * berarti tampilan pertama berbeda dari hasil hidrasi.
 */
function Rencana({ sekarang }: { sekarang: number }) {
  const { t } = useBahasa();

  const tanggal = tanggalWIB(sekarang);
  const [selesai, setSelesai] = useState<KodeLangkah[]>([]);

  useEffect(() => {
    setSelesai(bacaRencana(tanggal));
  }, [tanggal]);

  function alihkan(kode: KodeLangkah) {
    setSelesai((sebelum) => {
      const berikut = sebelum.includes(kode)
        ? sebelum.filter((satu) => satu !== kode)
        : [...sebelum, kode];
      simpanRencana(tanggal, berikut);
      return berikut;
    });
  }

  const jumlah = selesai.length;
  const total = RENCANA.length;
  const tuntas = jumlah === total;

  return (
    <section className="pan-blok">
      <h2 className="pan-judul">
        <IkonCentang size={17} />
        {t("panduan.rencana")}
      </h2>
      <p className="pan-sub">{t("panduan.rencanaSub")}</p>

      <div className="pan-maju">
        <span className="pan-maju-meter" aria-hidden="true">
          <span style={{ width: `${(jumlah / total) * 100}%` }} />
        </span>
        <span className="pan-maju-teks" suppressHydrationWarning>
          {t("panduan.rencanaMaju", { selesai: jumlah, total })}
        </span>
      </div>

      <ul className="pan-rencana">
        {RENCANA.map((butir) => {
          const dicentang = selesai.includes(butir.kode);
          return (
            <li key={butir.kode}>
              <label
                className={`pan-rencana-butir${dicentang ? " pan-rencana-selesai" : ""}`}
              >
                <input
                  type="checkbox"
                  className="pan-rencana-kotak"
                  checked={dicentang}
                  onChange={() => alihkan(butir.kode)}
                />
                <span className="pan-rencana-teks">
                  <span className="pan-rencana-kalimat">{t(butir.teks)}</span>
                  <span className="pan-dasar">{t(butir.dasar)}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {tuntas && (
        <p className="pan-tuntas" suppressHydrationWarning>
          {t("panduan.rencanaTuntas")}
        </p>
      )}
    </section>
  );
}
