type Props = { size?: number; className?: string };

/** Tanda visual aplikasi: siluet kucing gemuk yang sedang duduk. */
export default function Brand({ size = 30, className }: Props) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Twitter Mini"
    >
      {/* Ekor menyapu ke atas dan meruncing, meniru bulu ekor burung lawas. */}
      <path
        fill="currentColor"
        d="M384 424C442 400 470 342 464 280c-3-34-11-60-17-68-9 14-15 38-17 68-4 48-22 82-60 106Z"
      />
      {/* Kepala, telinga, dan badan gempal digambar sebagai satu siluet. */}
      <path
        fill="currentColor"
        d="M142 104c18-12 58 14 86 50 20-9 36-9 56 0 28-36 68-62 86-50 18 12 2 54-20 88 24 32 28 70 6 98 40 22 48 60 48 96 0 42-64 68-148 68s-148-26-148-68c0-36 8-74 48-96-22-28-18-66 6-98-22-34-38-76-20-88Z"
      />
    </svg>
  );
}
