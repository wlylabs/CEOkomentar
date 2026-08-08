"use client";

import JamKini from "./JamKini";
import { IkonJam } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import {
  JENDELA,
  isyaratJamEmas,
  peringkatHari,
  tingkatDari,
  type KunciJendela,
  type PeringkatHari,
  type Tingkat,
} from "@/lib/jamEmas";
import { useAgregatJamEmas } from "@/lib/jamEmasKonteks";
import { angkaPenuh, durasiSingkat, jamMenit } from "@/lib/time";

const NAMA: Record<KunciJendela, KunciTeks> = {
  pagi: "jam.jendela.pagi",
  siang: "jam.jendela.siang",
  malam: "jam.jendela.malam",
};

const CATATAN: Record<KunciJendela, KunciTeks> = {
  pagi: "jam.catatan.pagi",
  siang: "jam.catatan.siang",
  malam: "jam.catatan.malam",
};

const TINGKAT: Record<Tingkat, KunciTeks> = {
  puncak: "jam.tingkat.puncak",
  tinggi: "jam.tingkat.tinggi",
  bagus: "jam.tingkat.bagus",
  sedang: "jam.tingkat.sedang",
  sepi: "jam.tingkat.sepi",
};

const KATA_HARI: KunciTeks[] = [
  "hari.0",
  "hari.1",
  "hari.2",
  "hari.3",
  "hari.4",
  "hari.5",
  "hari.6",
];

const KABAR_HARI: Record<PeringkatHari, KunciTeks> = {
  terbaik: "jam.hari.terbaik",
  biasa: "jam.hari.biasa",
  lemah: "jam.hari.lemah",
};

/* Pekan Indonesia dimulai Senin, sedangkan getDay() memulainya dari Minggu. */
const URUTAN_PEKAN = [1, 2, 3, 4, 5, 6, 0];

/**
 * Kapan sebuah komentar paling mungkin terbaca banyak orang.
 *
 * Angka jam emasnya tinggal di `lib/jamEmas.ts`; di sini hanya dibacakan —
 * seberapa besar potensinya sekarang, jendela mana yang sedang berlangsung
 * atau menyusul, dan bagaimana bentuk harinya dari tengah malam ke tengah
 * malam. Semuanya waktu WIB, karena yang dihitung kebiasaan audiens Indonesia,
 * bukan zona waktu perangkat yang sedang dipakai menulis.
 *
 * `sekarang` datang dari luar — jam aplikasi yang sudah berdetak tiap menit —
 * supaya kartu ini ikut merangkak tanpa penghitung waktunya sendiri.
 *
 * Angka terukur datang dari konteks, bukan prop: hasilnya sama untuk semua yang
 * membacanya, dan tiga tempat kartu ini muncul berada di kedalaman yang
 * berbeda-beda.
 *
 * Bentuk `ringkas` adalah satu baris untuk layar sempit, tempat panel kanan
 * tidak pernah muncul.
 */
export default function JamEmas({
  sekarang,
  varian = "kartu",
}: {
  sekarang: number;
  varian?: "kartu" | "ringkas";
}) {
  const { bahasa, t } = useBahasa();
  const agregat = useAgregatJamEmas();

  const isyarat = isyaratJamEmas(sekarang, agregat);
  const { jendela, berikut, skor, tingkat, waktu } = isyarat;

  const namaBerikut = t(NAMA[berikut.kunci]);

  const keadaan = jendela
    ? t("jam.berlangsung", { jendela: t(NAMA[jendela.kunci]) })
    : t(isyarat.hariBerikut === waktu.hari ? "jam.berikut" : "jam.berikutBesok", {
        jendela: namaBerikut,
        waktu: jamMenit(berikut.mulai, bahasa),
      });

  const jarak =
    jendela && isyarat.sisa !== null
      ? t("jam.sisa", {
          waktu: jamMenit(jendela.selesai, bahasa),
          sisa: durasiSingkat(isyarat.sisa, bahasa),
        })
      : t("jam.jarak", { sisa: durasiSingkat(isyarat.jarakBerikut, bahasa) });

  const saran =
    tingkat === "puncak" || tingkat === "tinggi"
      ? t("jam.saran.kirim")
      : tingkat === "bagus"
        ? t("jam.saran.layak")
        : t("jam.saran.tunda", { jendela: namaBerikut });

  if (varian === "ringkas") {
    /* Satu baris di layar sempit: seberapa besar potensinya, lalu jendela mana
       yang sedang berjalan — atau menyusul — beserta jaraknya. */
    const ringkas =
      jendela && isyarat.sisa !== null
        ? t("jam.ringkas.kini", {
            jendela: t(NAMA[jendela.kunci]),
            waktu: jamMenit(jendela.selesai, bahasa),
            sisa: durasiSingkat(isyarat.sisa, bahasa),
          })
        : t("jam.ringkas.nanti", {
            jendela: namaBerikut,
            waktu: jamMenit(berikut.mulai, bahasa),
            sisa: durasiSingkat(isyarat.jarakBerikut, bahasa),
          });

    return (
      <div className={`jam-ringkas jam-nada-${tingkat}`}>
        <div className="jam-ringkas-baris">
          <span className="jam-titik" aria-hidden="true" />
          <span className="jam-ringkas-teks" suppressHydrationWarning>
            <strong>{t(TINGKAT[tingkat])}</strong>
            <span className="jam-ringkas-pisah" aria-hidden="true">
              ·
            </span>
            {ringkas}
          </span>
          <span
            className="jam-ringkas-skor"
            title={t("jam.potensi")}
            suppressHydrationWarning
          >
            {skor}
          </span>
        </div>

        {/* Jam sungguhannya ikut turun ke sini: di layar sempit baris inilah
            satu-satunya tempat keputusan "kirim sekarang atau nanti" bertemu
            dengan waktu yang dipakai menghitungnya. */}
        <JamKini sekarang={sekarang} varian="ringkas" />
      </div>
    );
  }

  return (
    <section className={`kartu jam-kartu jam-nada-${tingkat}`}>
      <h2 className="kartu-judul">
        <IkonJam size={16} />
        {t("jam.judul")}
      </h2>

      {/* Jam sungguhan mendahului seluruh angka di bawahnya: semuanya —
          potensi, sisa jendela, jarak ke jendela berikutnya — dibaca dari
          detik yang sedang berjalan ini. */}
      <JamKini sekarang={sekarang} />

      <div className="jam-kepala">
        <span className="jam-label">{t("jam.potensi")}</span>
        <span className="jam-angka" suppressHydrationWarning>
          {skor}
          <span className="jam-dari">{t("jam.dari")}</span>
        </span>
      </div>

      <div className="jam-meter">
        <span
          className="jam-meter-isi"
          style={{ width: `${skor}%` }}
          suppressHydrationWarning
        />
      </div>

      <p className="jam-keadaan" suppressHydrationWarning>
        <span className="jam-titik" aria-hidden="true" />
        <strong>{t(TINGKAT[tingkat])}</strong> — {keadaan}
      </p>
      <p className="jam-jarak" suppressHydrationWarning>
        {jarak}
        {isyarat.inti && ` · ${t("jam.inti")}`}
      </p>
      <p className="jam-saran" suppressHydrationWarning>
        {saran}
      </p>

      {/* Bentuk hari ini dari tengah malam ke tengah malam. Isinya sama dengan
          daftar jendela di bawahnya, hanya digambar — jadi pembaca layar cukup
          membaca daftarnya. */}
      <ul className="jam-kurva" aria-hidden="true">
        {isyarat.kurva.map((nilai, jam) => (
          <li
            key={jam}
            className={`jam-batang jam-nada-${tingkatDari(nilai)}${
              jam === Math.floor(waktu.menit / 60) ? " jam-batang-kini" : ""
            }`}
            title={t("jam.kurvaJam", {
              waktu: jamMenit(jam * 60, bahasa),
              skor: nilai,
            })}
          >
            <span style={{ height: `${Math.max(8, nilai)}%` }} />
          </li>
        ))}
      </ul>

      {/* Lima penanda untuk dua puluh empat batang: yang terakhir menutup
          sumbunya di tengah malam berikutnya, jadi jarak antar penanda tetap
          enam jam dan tidak melenceng dari batang di bawahnya. */}
      <div className="jam-sumbu" aria-hidden="true">
        {[0, 6, 12, 18, 24].map((jam) => (
          <span key={jam}>{jamMenit(jam * 60, bahasa)}</span>
        ))}
      </div>

      <ul className="jam-jendela">
        {JENDELA.map((butir) => (
          <li
            key={butir.kunci}
            className={butir.kunci === jendela?.kunci ? "jam-jendela-kini" : undefined}
          >
            <span className="jam-jendela-kepala">
              <strong>{t(NAMA[butir.kunci])}</strong>
              <span className="jam-rentang">
                {jamMenit(butir.mulai, bahasa)}–{jamMenit(butir.selesai, bahasa)}
              </span>
            </span>
            <span className="jam-catatan">
              {t(CATATAN[butir.kunci], {
                inti: butir.inti
                  ? `${jamMenit(butir.inti[0], bahasa)}–${jamMenit(butir.inti[1], bahasa)}`
                  : "",
              })}
            </span>
          </li>
        ))}
      </ul>

      <ul className="jam-pekan" aria-label={t("jam.hariLabel")}>
        {URUTAN_PEKAN.map((hari) => {
          const kini = hari === waktu.hari;
          return (
            <li
              key={hari}
              className={`jam-hari jam-hari-${peringkatHari(hari)}${
                kini ? " jam-hari-kini" : ""
              }`}
              suppressHydrationWarning
            >
              {t(KATA_HARI[hari])}
              {kini && <span className="sr-only"> ({t("jam.hariIniLabel")})</span>}
            </li>
          );
        })}
      </ul>

      <p className="jam-pekan-teks" suppressHydrationWarning>
        {t("jam.hariTerbaik")} · {t(KABAR_HARI[isyarat.peringkat])}
      </p>

      {/* Dari mana angka di atas berasal. Selama sebuah potongan jam belum
          punya komentar terukur, skornya murni tebakan — dan kartu yang
          menuliskan "88 dari 100" tanpa menyebut itu terbaca seperti hasil
          pengukuran. */}
      <p className="kartu-kaki" suppressHydrationWarning>
        {isyarat.sampel > 0
          ? t("jam.sumber.data", { jumlah: angkaPenuh(isyarat.sampel, bahasa) })
          : t("jam.sumber.pola")}
      </p>

      <p className="kartu-kaki">{t("jam.zona")}</p>
    </section>
  );
}
