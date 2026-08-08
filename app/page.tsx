import App from "@/components/App";
import AuthScreen from "@/components/AuthScreen";
import Setup from "@/components/Setup";
import { akunSekarang } from "@/lib/akun";
import { ambilAgregatJamEmas } from "@/lib/api";
import { PenyediaJamEmas } from "@/lib/jamEmasKonteks";
import { klienServer } from "@/lib/supabase/server";
import { supabaseSiap } from "@/lib/supabase/env";

/* Sesi ada di kuki, jadi halaman ini tidak boleh di-cache. */
export const dynamic = "force-dynamic";

export default async function Halaman() {
  if (!supabaseSiap) return <Setup />;

  const sesi = await akunSekarang();
  if (!sesi) return <AuthScreen />;

  /* Diambil di server supaya kartu jam emas sudah benar di HTML pertama. Isinya
     berubah paling cepat sepuluh menit sekali — seiring penyapu kedaluwarsa —
     jadi satu kali per muat halaman sudah jauh lebih sering daripada perlu. */
  const agregat = await ambilAgregatJamEmas(await klienServer());

  return (
    <PenyediaJamEmas baris={agregat}>
      <App akunAwal={sesi.akun} tamu={sesi.tamu} />
    </PenyediaJamEmas>
  );
}
