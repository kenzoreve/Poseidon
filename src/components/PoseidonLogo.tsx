interface PoseidonLogoProps {
  className?: string;
}

export function PoseidonLogo({ className = 'w-9 h-9' }: PoseidonLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="18" fill="#0B4F5C" />
      <path
        d="M32 13V47M20 20V26C20 31.5228 24.4772 36 30 36H34C39.5228 36 44 31.5228 44 26V20"
        stroke="#6FD6B5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 13L27.5 18M32 13L36.5 18M20 18L16.5 22M20 18L23.5 22M44 18L40.5 22M44 18L47.5 22"
        stroke="#FFFDF8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 48C19 44.5 24 44.5 29 48C34 51.5 39 51.5 44 48C46.5 46.2 48.5 45.6 50 45.8"
        stroke="#6FD6B5"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
