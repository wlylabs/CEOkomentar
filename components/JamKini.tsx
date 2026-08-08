"use client";

import { useBahasa } from "@/lib/i18n/konteks";
import type { KunciTeks } from "@/lib/i18n/kamus";
import { DETIK, ZONA, bagianZona, useDetak } from "@/lib/jam";
import { jamPenuh, tanggalZona } from "@/lib/time";

const KATA_HARI: KunciTeks[] = [
  "hari.0",
  "hari.1",
  "hari.2",
  "hari.3",
  "hari.4",
  "hari.5",
  "hari.6",
];

/**
 * Jam sungguhan: WIB dan UTC, berdetak tiap detik.
 *
 * Punya detaknya sendiri, bukan `sekarang` yang diedarkan aplikasi. Jam
 * aplikasi berdetak tiap menit karena yang dihitungnya umur komentar dan
 * potensi jangkauan — dua hal yang tidak berubah dalam sedetik — sedangkan
 * sebuah jam yang berhenti selama satu menit tidak terlihat seperti jam.
 * Memisahkannya berarti hanya baris ini yang digambar ulang tiap detik,
 * bukan seluruh linimasa di sebelahnya.
 *
 * Keduanya dipasang berdampingan dengan sengaja: seluruh angka jam emas
 * memakai WIB, sedangkan UTC yang membuatnya bisa dicocokkan oleh siapa pun
 * yang sedang tidak duduk di zona itu.
 */
export default function JamKini({
  varian = "kartu",
}: {
  varian?: "kartu" | "ringkas";
}) {
  const { bahasa, t } = useBahasa();

  const sekarang = useDetak(DETIK);
  const daftar = ZONA.map((zona) => ({
    zona,
    waktu: bagianZona(sekarang, zona.offset),
  }));

  /* Bentuk ringkasnya tanpa label tambahan: "WIB 14.32.05 · UTC 07.32.05"
     sudah kalimat yang utuh bagi pembaca layar, dan <p> tidak menerima
     aria-label. */
  if (varian === "ringkas") {
    return (
      <p className="jam-kini-ringkas">
        {daftar.map(({ zona, waktu }, urutan) => (
          <span className="jam-kini-pasang" key={zona.kunci}>
            {urutan > 0 && (
              <span className="jam-kini-pisah" aria-hidden="true">
                ·
              </span>
            )}
            <span className="jam-kini-label">{zona.label}</span>
            {/* Yang berbeda antara server dan peramban hanya angkanya, jadi
                itu pula satu-satunya yang perlu didiamkan. */}
            <span className="jam-kini-angka" suppressHydrationWarning>
              {jamPenuh(waktu, bahasa)}
            </span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className="jam-kini" role="group" aria-label={t("jam.kiniLabel")}>
      {daftar.map(({ zona, waktu }) => (
        <div className={`jam-kini-zona jam-kini-${zona.kunci}`} key={zona.kunci}>
          <span className="jam-kini-label">{zona.label}</span>
          <time
            className="jam-kini-angka"
            dateTime={new Date(sekarang).toISOString()}
            suppressHydrationWarning
          >
            {jamPenuh(waktu, bahasa)}
          </time>
          <span className="jam-kini-tanggal" suppressHydrationWarning>
            {t(KATA_HARI[waktu.hari])}, {tanggalZona(waktu, bahasa)}
          </span>
        </div>
      ))}
    </div>
  );
}
