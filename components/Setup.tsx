import Brand from "./Brand";
import { IkonPeringatan } from "./Icons";

/** Ditampilkan bila kredensial Supabase belum ada, menggantikan layar kosong. */
export default function Setup() {
  return (
    <div className="gerbang">
      <main className="gerbang-kartu">
        <div className="gerbang-merek">
          <Brand size={40} />
          <span className="gerbang-merek-teks">Twitter Mini</span>
        </div>

        <h1 className="gerbang-judul">Supabase belum terhubung</h1>
        <p className="gerbang-sub">
          Aplikasi ini menyimpan akun, komentar, dan foto profil di Supabase.
          Salin <code>.env.example</code> menjadi <code>.env.local</code>, isi dua
          nilai di bawah, lalu jalankan ulang server pengembangan.
        </p>

        <pre className="gerbang-kode">
          <code>
            {"NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n"}
            {"NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi..."}
          </code>
        </pre>

        <p className="gerbang-galat">
          <IkonPeringatan size={18} />
          <span>
            Jangan lupa menjalankan berkas SQL di{" "}
            <code>supabase/migrations/</code> lewat SQL Editor agar tabel, izin,
            dan bucket penyimpanannya terbentuk.
          </span>
        </p>
      </main>
    </div>
  );
}
