export default function Logo({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="28" height="28" rx="8" fill="#0b0b0c" />
      <circle
        cx="14"
        cy="14"
        r="6"
        fill="none"
        stroke="#ff4d1a"
        strokeWidth="3"
      />
    </svg>
  );
}
