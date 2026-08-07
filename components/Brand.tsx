type Props = { size?: number; className?: string };

/** Tanda visual aplikasi: gelembung komentar dengan sudut yang dipangkas. */
export default function Brand({ size = 30, className }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Twitter Mini"
    >
      <path
        fill="currentColor"
        d="M16 3.2c7.1 0 12.8 4.6 12.8 10.6 0 6-5.7 10.6-12.8 10.6-1.2 0-2.3-.12-3.4-.36l-6.5 4.36 1.9-5.9C4.6 20.4 3.2 17.4 3.2 13.8 3.2 7.8 8.9 3.2 16 3.2Z"
      />
      <path
        fill="var(--tanda-dalam)"
        d="M10.4 11.6h11.2v2.1H10.4zm0 4.3h7.6V18h-7.6z"
      />
    </svg>
  );
}
