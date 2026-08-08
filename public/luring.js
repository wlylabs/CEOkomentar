/*
 * Skrip halaman luring.
 *
 * Berkas terpisah, bukan skrip sebaris, karena Content Security Policy aplikasi
 * ini menolak skrip sebaris tanpa nonce — dan berkas statis di public/ tidak
 * melewati perenderan yang bisa menyisipkan nonce. Isinya kembaran SKRIP_TEMA
 * di lib/tema.ts; keduanya harus ikut berubah bila salah satu diubah.
 */
(function () {
  try {
    var t = localStorage.getItem("tm-tema");
    if (t !== "terang" && t !== "gelap") {
      t = matchMedia("(prefers-color-scheme: light)").matches ? "terang" : "gelap";
    }
    document.documentElement.dataset.tema = t;
    var m = document.createElement("meta");
    m.name = "theme-color";
    m.content = t === "terang" ? "#ffffff" : "#000000";
    document.head.appendChild(m);
  } catch (e) {
    /* Tanpa localStorage halaman ini tetap terbaca lewat @media. */
  }

  document.addEventListener("DOMContentLoaded", function () {
    var tombol = document.getElementById("muat-ulang");
    if (tombol) tombol.addEventListener("click", function () {
      location.reload();
    });
  });
})();
