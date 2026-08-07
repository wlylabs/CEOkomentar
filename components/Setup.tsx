"use client";

import Brand from "./Brand";
import PemilihBahasa from "./PemilihBahasa";
import { IkonPeringatan } from "./Icons";
import { useBahasa } from "@/lib/i18n/konteks";

/** Ditampilkan bila kredensial Supabase belum ada, menggantikan layar kosong. */
export default function Setup() {
  const { t, tk } = useBahasa();

  return (
    <div className="gerbang">
      <main className="gerbang-kartu">
        <div className="gerbang-merek">
          <Brand size={40} />
          <span className="gerbang-merek-teks">{t("umum.merek")}</span>
          <PemilihBahasa varian="gerbang" />
        </div>

        <h1 className="gerbang-judul">{t("setup.judul")}</h1>
        <p className="gerbang-sub">{tk("setup.sub")}</p>

        <pre className="gerbang-kode">
          <code>
            {"NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n"}
            {"NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi..."}
          </code>
        </pre>

        <p className="gerbang-galat">
          <IkonPeringatan size={18} />
          <span>{tk("setup.galat")}</span>
        </p>
      </main>
    </div>
  );
}
