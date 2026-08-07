"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import Avatar from "./Avatar";
import type { User } from "@/lib/types";

const BATAS = 280;

type Props = {
  pengguna: User;
  placeholder?: string;
  labelTombol?: string;
  kompak?: boolean;
  fokusOtomatis?: boolean;
  onKirim: (teks: string) => void;
  onBatal?: () => void;
};

export default function Composer({
  pengguna,
  placeholder = "Apa komentarmu?",
  labelTombol = "Kirim",
  kompak = false,
  fokusOtomatis = false,
  onKirim,
  onBatal,
}: Props) {
  const [teks, setTeks] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const idArea = useId();

  const sisa = BATAS - teks.length;
  const kosong = teks.trim().length === 0;
  const lewatBatas = sisa < 0;
  const bisaKirim = !kosong && !lewatBatas;

  const sesuaikanTinggi = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (fokusOtomatis) areaRef.current?.focus();
  }, [fokusOtomatis]);

  function ubah(e: ChangeEvent<HTMLTextAreaElement>) {
    setTeks(e.target.value);
    sesuaikanTinggi();
  }

  function kirim() {
    if (!bisaKirim) return;
    onKirim(teks.trim());
    setTeks("");
    requestAnimationFrame(sesuaikanTinggi);
  }

  function tombol(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      kirim();
    }
    if (e.key === "Escape" && onBatal) onBatal();
  }

  const rasio = Math.min(teks.length / BATAS, 1);
  const keliling = 2 * Math.PI * 9;

  return (
    <form
      className={`komposer${kompak ? " komposer-kompak" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        kirim();
      }}
    >
      <Avatar pengguna={pengguna} ukuran={kompak ? 36 : 44} />

      <div className="komposer-badan">
        <label className="sr-only" htmlFor={idArea}>
          {placeholder}
        </label>
        <textarea
          id={idArea}
          ref={areaRef}
          className="komposer-area"
          value={teks}
          onChange={ubah}
          onKeyDown={tombol}
          placeholder={placeholder}
          rows={kompak ? 1 : 2}
          maxLength={BATAS + 40}
        />

        <div className="komposer-kaki">
          <p className="komposer-petunjuk">
            Tekan <kbd>Ctrl</kbd> + <kbd>Enter</kbd> untuk mengirim
          </p>

          <div className="komposer-kanan">
            {teks.length > 0 && (
              <span
                className={`hitungan${lewatBatas ? " hitungan-lebih" : ""}`}
                aria-live="polite"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="var(--garis)"
                    strokeWidth="2.2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray={keliling}
                    strokeDashoffset={keliling * (1 - rasio)}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                {sisa <= 20 && (
                  <span className="hitungan-angka">{sisa}</span>
                )}
                <span className="sr-only">{sisa} karakter tersisa</span>
              </span>
            )}

            {onBatal && (
              <button type="button" className="tombol tombol-sunyi" onClick={onBatal}>
                Batal
              </button>
            )}

            <button type="submit" className="tombol tombol-utama" disabled={!bisaKirim}>
              {labelTombol}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
