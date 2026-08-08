/**
 * Percakapan dengan X (dulu Twitter): OAuth 2.0 dengan PKCE, lalu satu
 * pertanyaan — benarkah akun ini mengikuti @CEOkomentar.
 *
 * Yang dipegang aplikasi setelah alurnya selesai hanyalah id dan username X.
 * Token aksesnya dicabut kembali sebelum jawaban dikirim ke peramban, dan tidak
 * pernah disimpan di mana pun: sekali dipakai untuk satu pertanyaan, selesai.
 *
 * Seluruh berkas ini hanya boleh dipanggil dari server. Client secret dibaca
 * dari process.env tanpa awalan NEXT_PUBLIC_, jadi Next.js akan menolak
 * menyisipkannya ke berkas yang berakhir di peramban.
 */

const OTORISASI = "https://x.com/i/oauth2/authorize";
const TOKEN = "https://api.x.com/2/oauth2/token";
const CABUT = "https://api.x.com/2/oauth2/revoke";
const API = "https://api.x.com/2";

/**
 * `users.read` untuk mengenali akun yang masuk, `tweet.read` karena X
 * mensyaratkannya bersama users.read, dan `follows.read` untuk membaca daftar
 * yang diikutinya. Tidak ada `offline.access`: kami tidak meminta izin yang
 * masih berlaku setelah pemeriksaan ini selesai.
 */
const CAKUPAN = "users.read tweet.read follows.read";

/** Jawaban X dinanti secukupnya; lebih lama dari ini pemakai sudah menyerah. */
const TENGGANG = 8_000;

/**
 * Batas halaman daftar "mengikuti" yang ditelusuri.
 *
 * X tidak punya titik akhir "apakah A mengikuti B", jadi jawabannya dicari di
 * dalam daftar yang dipulangkan seribu-seribu. Lima belas halaman berarti akun
 * yang mengikuti sampai 15.000 akun lain masih terperiksa dengan benar; di atas
 * itu pemeriksaannya menyerah dan berkata "tidak yakin" alih-alih "tidak".
 */
const MAKS_HALAMAN = 15;

export const X_CLIENT_ID = process.env.X_CLIENT_ID ?? "";
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET ?? "";

export const xSiap = Boolean(X_CLIENT_ID);

/* ============================================================
   PKCE
   ============================================================ */

function keBase64Url(data: ArrayBuffer | Uint8Array): string {
  const bita = data instanceof Uint8Array ? data : new Uint8Array(data);
  let biner = "";
  for (const angka of bita) biner += String.fromCharCode(angka);
  return btoa(biner).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Deret acak aman untuk state dan code verifier. */
export function acak(bita = 32): string {
  return keBase64Url(crypto.getRandomValues(new Uint8Array(bita)));
}

export async function tantangan(verifier: string): Promise<string> {
  const cerna = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return keBase64Url(cerna);
}

/**
 * Membandingkan dua penanda tanpa membocorkan di karakter ke berapa keduanya
 * berbeda. Berlebihan untuk state OAuth yang berumur sepuluh menit, tetapi
 * perbandingan penanda memang tidak pantas ditulis dengan `===`.
 */
export function samaAman(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let beda = 0;
  for (let i = 0; i < a.length; i += 1) {
    beda |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return beda === 0;
}

/* ============================================================
   Alur izin
   ============================================================ */

export function alamatIzin(opsi: {
  kembali: string;
  state: string;
  tantangan: string;
}): string {
  const alamat = new URL(OTORISASI);
  alamat.searchParams.set("response_type", "code");
  alamat.searchParams.set("client_id", X_CLIENT_ID);
  alamat.searchParams.set("redirect_uri", opsi.kembali);
  alamat.searchParams.set("scope", CAKUPAN);
  alamat.searchParams.set("state", opsi.state);
  alamat.searchParams.set("code_challenge", opsi.tantangan);
  alamat.searchParams.set("code_challenge_method", "S256");
  return alamat.toString();
}

function kepalaKlien(): Record<string, string> {
  /* Aplikasi X bertipe "confidential" mengirim rahasianya lewat Basic auth;
     yang bertipe "public" cukup dengan client_id di badan permintaan. */
  if (!X_CLIENT_SECRET) return {};
  const sandi = btoa(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`);
  return { Authorization: `Basic ${sandi}` };
}

export async function tukarKode(
  kode: string,
  verifier: string,
  kembali: string,
): Promise<string | null> {
  const badan = new URLSearchParams({
    grant_type: "authorization_code",
    code: kode,
    redirect_uri: kembali,
    code_verifier: verifier,
    client_id: X_CLIENT_ID,
  });

  try {
    const jawaban = await fetch(TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...kepalaKlien(),
      },
      body: badan,
      cache: "no-store",
      signal: AbortSignal.timeout(TENGGANG),
    });

    if (!jawaban.ok) return null;
    const isi = (await jawaban.json()) as { access_token?: string };
    return isi.access_token ?? null;
  } catch {
    return null;
  }
}

/** Mencabut token begitu pertanyaannya terjawab; tidak ada yang perlu disimpan. */
export async function cabutToken(token: string): Promise<void> {
  try {
    await fetch(CABUT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...kepalaKlien(),
      },
      body: new URLSearchParams({
        token,
        token_type_hint: "access_token",
        client_id: X_CLIENT_ID,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TENGGANG),
    });
  } catch {
    /* Token ini berumur pendek; gagal mencabut bukan alasan menggagalkan misi. */
  }
}

/* ============================================================
   Pertanyaan ke API
   ============================================================ */

async function ambil<T>(jalur: string, token: string): Promise<T | null> {
  try {
    const jawaban = await fetch(`${API}${jalur}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TENGGANG),
    });
    if (!jawaban.ok) return null;
    return (await jawaban.json()) as T;
  } catch {
    return null;
  }
}

export type AkunX = { id: string; username: string };

type JawabanPengguna = { data?: { id?: string; username?: string } };

export async function akunSaya(token: string): Promise<AkunX | null> {
  const isi = await ambil<JawabanPengguna>("/users/me", token);
  const id = isi?.data?.id;
  const username = isi?.data?.username;
  return id && username ? { id, username } : null;
}

export async function akunLewatUsername(
  token: string,
  username: string,
): Promise<AkunX | null> {
  /* Username sudah dibatasi bentuknya oleh katalog misi, tetapi jalur URL tetap
     dirakit lewat encodeURIComponent supaya tidak ada bentuk lain yang lolos. */
  const isi = await ambil<JawabanPengguna>(
    `/users/by/username/${encodeURIComponent(username)}`,
    token,
  );
  const id = isi?.data?.id;
  const nama = isi?.data?.username;
  return id && nama ? { id, username: nama } : null;
}

type JawabanMengikuti = {
  data?: { id?: string }[];
  meta?: { next_token?: string };
};

/**
 * Apakah `idSaya` mengikuti `idTarget`.
 *
 * `null` berarti pertanyaannya tidak terjawab — X menolak, jaringannya putus,
 * atau daftarnya terlalu panjang untuk ditelusuri. Bedanya dengan `false`
 * penting: yang satu berarti "belum mengikuti", yang lain berarti "kami tidak
 * tahu", dan hanya yang pertama pantas dikatakan kepada pemakai.
 */
export async function apakahMengikutiX(
  token: string,
  idSaya: string,
  idTarget: string,
): Promise<boolean | null> {
  let penanda: string | undefined;

  for (let halaman = 0; halaman < MAKS_HALAMAN; halaman += 1) {
    const kueri = new URLSearchParams({ max_results: "1000" });
    if (penanda) kueri.set("pagination_token", penanda);

    const isi = await ambil<JawabanMengikuti>(
      `/users/${encodeURIComponent(idSaya)}/following?${kueri}`,
      token,
    );
    if (!isi) return null;

    if ((isi.data ?? []).some((akun) => akun.id === idTarget)) return true;

    penanda = isi.meta?.next_token;
    if (!penanda) return false;
  }

  return null;
}
