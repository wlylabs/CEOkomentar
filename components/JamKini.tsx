"use client";

import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { ZONA, bagianHari, bagianZona, type KunciBagianHari } from "@/lib/jam";
import { jamZona, tanggalZona } from "@/lib/time";

const KATA_HARI: KunciTeks[] = [
  "hari.0",
  "hari.1",
  "hari.2",
  "hari.3",
  "hari.4",
  "hari.5",
  "hari.6",
];

const KATA_BAGIAN: Record<KunciBagianHari, KunciTeks> = {
  dini: "jam.bagian.dini",
  pagi: "jam.bagian.pagi",
  siang: "jam.bagian.siang",
  sore: "jam.bagian.sore",
  malam: "jam.bagian.malam",
};

/**
 * Jam dinding sungguhan: WIB dan UTC berdampingan.
 *
 * Keduanya dipasang bersama dengan sengaja: seluruh angka jam emas memakai WIB,
 * sedangkan UTC yang membuatnya bisa dicocokkan oleh siapa pun yang sedang tidak
 * duduk di zona itu. Tiap zona membawa bagian harinya sendiri — pagi, siang,
 * sore, malam — karena angka saja belum menjawab pertanyaan yang sebenarnya
 * ditanyakan orang pada sebuah jam zona lain: sekarang di sana pagi atau malam.
 *
 * `sekarang` datang dari luar, dari jam aplikasi yang berdetak tiap menit penuh.
 * Dulu jam ini punya detaknya sendiri karena detiknya ikut ditulis; setelah
 * detiknya pergi, menit adalah satu-satunya satuan yang berganti di sini, dan
 * itu satuan yang sudah didetakkan aplikasi.
 */
export default function JamKini({
  sekarang,
  varian = "kartu",
}: {
  sekarang: number;
  varian?: "kartu" | "ringkas";
}) {
  const { bahasa, t } = useBahasa();

  const daftar = ZONA.map((zona) => {
    const waktu = bagianZona(sekarang, zona.offset);
    return {
      zona,
      waktu,
      jam: jamZona(waktu, bahasa, zona.jam12),
      bagian: t(KATA_BAGIAN[bagianHari(waktu.jam)]),
    };
  });

  /* Bentuk ringkasnya tanpa label tambahan: "WIB 14.32 siang · UTC 7.32 am
     morning" sudah kalimat yang utuh bagi pembaca layar, dan <p> tidak
     menerima aria-label. */
  if (varian === "ringkas") {
    return (
      <p className="jam-kini-ringkas">
        {daftar.map(({ zona, jam, bagian }, urutan) => (
          <span className="jam-kini-pasang" key={zona.kunci}>
            {urutan > 0 && (
              <span className="jam-kini-pisah" aria-hidden="true">
                ·
              </span>
            )}
            <span className="jam-kini-label">{zona.label}</span>
            {/* Yang berbeda antara server dan peramban hanya waktunya, jadi
                itu pula satu-satunya yang perlu didiamkan — dan tiap simpul
                sendiri-sendiri, karena suppressHydrationWarning hanya
                menjangkau anak langsungnya. */}
            <span className="jam-kini-angka" suppressHydrationWarning>
              {jam.angka}
            </span>
            {jam.tanda && (
              <span className="jam-kini-tanda" suppressHydrationWarning>
                {jam.tanda}
              </span>
            )}
            <span className="jam-kini-bagian" suppressHydrationWarning>
              {bagian}
            </span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className="jam-kini" role="group" aria-label={t("jam.kiniLabel")}>
      {daftar.map(({ zona, waktu, jam, bagian }) => (
        <div className={`jam-kini-zona jam-kini-${zona.kunci}`} key={zona.kunci}>
          <span className="jam-kini-kepala">
            <span className="jam-kini-label">{zona.label}</span>
            <span className="jam-kini-bagian" suppressHydrationWarning>
              {bagian}
            </span>
          </span>
          <span className="jam-kini-baris">
            <time
              className="jam-kini-angka"
              dateTime={new Date(sekarang).toISOString()}
              suppressHydrationWarning
            >
              {jam.angka}
            </time>
            {jam.tanda && (
              <span className="jam-kini-tanda" suppressHydrationWarning>
                {jam.tanda}
              </span>
            )}
          </span>
          <span className="jam-kini-tanggal" suppressHydrationWarning>
            {t(KATA_HARI[waktu.hari])}, {tanggalZona(waktu, bahasa)}
          </span>
        </div>
      ))}
    </div>
  );
}
