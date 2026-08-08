"use client";

import { useState } from "react";
import { IkonCentang, IkonTerverifikasi, IkonTutup } from "./Icons";
import type { JenisKabar } from "./Kabar";
import { useBahasa } from "@/lib/i18n/konteks";
import { aturLencana, kunciGalat } from "@/lib/api";
import { TAGAR_KLAIM } from "@/lib/misi";
import {
  DIATUR,
  judulLencana,
  namaLencana,
  type KodeLencana,
} from "@/lib/lencana";
import type { User } from "@/lib/types";

type Props = {
  /** pemilik profil yang sedang dibuka; bukan yang sedang masuk */
  pengguna: User;
  onUbah: (lencana: KodeLencana[]) => void;
  onKabar: (pesan: string, jenis?: JenisKabar) => void;
};

/**
 * Panel lencana milik admin, tampil di kartu profil orang lain.
 *
 * Yang ditampilkan hanya lencana yang benar-benar bisa diberikan dan dicabut
 * dari sini — hari ini tepat centang biru. Centang emas mengikuti peran admin
 * dan diputuskan pemicu basis data, jadi ia tidak lagi dipajang sebagai baris
 * terkunci: sebuah baris yang tak pernah bisa ditekan cuma menambah barang di
 * layar tanpa menambah yang bisa dikerjakan.
 *
 * Keputusannya dikirim ke `/api/admin/lencana`; keadminan pemanggilnya
 * ditanyakan di sana kepada basis data, jadi panel ini boleh sepenuhnya
 * berbicara soal tampilan.
 */
export default function KelolaLencana({ pengguna, onUbah, onKabar }: Props) {
  const { t } = useBahasa();
  const [sibuk, setSibuk] = useState<KodeLencana | null>(null);

  const punya = new Set(pengguna.lencana);

  async function alihkan(kode: KodeLencana) {
    if (sibuk) return;
    const beri = !punya.has(kode);

    setSibuk(kode);
    try {
      const daftar = await aturLencana(pengguna.id, kode, beri);
      onUbah(daftar);
      onKabar(
        t(beri ? "kelola.diberikan" : "kelola.dicabut", {
          lencana: t(namaLencana(kode)),
          handle: pengguna.handle,
        }),
        "berhasil",
      );
    } catch (kesalahan) {
      const kunci = kunciGalat(kesalahan);
      onKabar(t(kunci ?? "galat.lencana"), "galat");
    } finally {
      setSibuk(null);
    }
  }

  return (
    <section className="kelola" aria-label={t("kelola.label")}>
      <header className="kelola-kepala">
        <h2 className="kelola-judul">{t("kelola.judul")}</h2>
        <p className="kelola-sub">
          {t("kelola.sub", { handle: pengguna.handle, tagar: TAGAR_KLAIM })}
        </p>
      </header>

      <ul className="kelola-daftar">
        {DIATUR.map((kode) => {
          const dimiliki = punya.has(kode);
          const memproses = sibuk === kode;

          return (
            <li
              className={`kelola-baris${dimiliki ? " kelola-baris-ada" : ""}`}
              key={kode}
            >
              <span className={`kelola-lencana lencana-${kode}`} aria-hidden="true">
                <IkonTerverifikasi size={20} />
              </span>

              <span className="kelola-teks">
                <span className="kelola-nama">
                  {t(namaLencana(kode))}
                  {dimiliki && (
                    <span className="kelola-keadaan">{t("kelola.ada")}</span>
                  )}
                </span>
                <span className="kelola-arti">{t(judulLencana(kode))}</span>
              </span>

              <button
                type="button"
                className={`tombol tombol-kecil ${
                  dimiliki ? "tombol-garis" : "tombol-utama"
                }`}
                onClick={() => alihkan(kode)}
                disabled={sibuk !== null}
                aria-pressed={dimiliki}
              >
                {memproses ? (
                  t("umum.memproses")
                ) : (
                  <>
                    {dimiliki ? <IkonTutup size={14} /> : <IkonCentang size={14} />}
                    <span>{t(dimiliki ? "kelola.cabut" : "kelola.beri")}</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
