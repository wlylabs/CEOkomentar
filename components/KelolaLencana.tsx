"use client";

import { useState } from "react";
import { IkonCentang, IkonTerverifikasi, IkonTutup } from "./Icons";
import type { JenisKabar } from "./Kabar";
import { useBahasa } from "@/lib/i18n/konteks";
import { aturLencana, kunciGalat } from "@/lib/api";
import { TAGAR_KLAIM } from "@/lib/misi";
import {
  URUTAN,
  dapatDiatur,
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
 * Satu baris per lencana di katalog, dengan satu tombol yang menyatakan
 * keadaannya sekaligus cara mengubahnya. Yang tidak bisa diubah — centang emas,
 * yang mengikuti peran admin — tetap ditampilkan sebagai baris terkunci beserta
 * alasannya, bukan disembunyikan: yang mencarinya berhak tahu ke mana harus
 * pergi, dan jawabannya bukan halaman ini.
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
      <h2 className="kelola-judul">{t("kelola.judul")}</h2>
      <p className="kelola-sub">
        {t("kelola.sub", { handle: pengguna.handle, tagar: TAGAR_KLAIM })}
      </p>

      <ul className="kelola-daftar">
        {URUTAN.map((kode) => {
          const dimiliki = punya.has(kode);
          const terkunci = !dapatDiatur(kode);

          return (
            <li className="kelola-baris" key={kode}>
              <span className={`kelola-lencana lencana-${kode}`} aria-hidden="true">
                <IkonTerverifikasi size={20} />
              </span>

              <span className="kelola-teks">
                <span className="kelola-nama">{t(namaLencana(kode))}</span>
                <span className="kelola-arti">
                  {t(terkunci ? "kelola.peran" : judulLencana(kode))}
                </span>
              </span>

              {terkunci ? (
                <span className="kelola-keadaan">
                  {t(dimiliki ? "kelola.ada" : "kelola.tiada")}
                </span>
              ) : (
                <button
                  type="button"
                  className={`tombol tombol-kecil ${
                    dimiliki ? "tombol-garis" : "tombol-utama"
                  }`}
                  onClick={() => alihkan(kode)}
                  disabled={sibuk !== null}
                  aria-pressed={dimiliki}
                >
                  {sibuk === kode ? (
                    t("umum.memproses")
                  ) : (
                    <>
                      {dimiliki ? <IkonTutup size={14} /> : <IkonCentang size={14} />}
                      <span>{t(dimiliki ? "kelola.cabut" : "kelola.beri")}</span>
                    </>
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
