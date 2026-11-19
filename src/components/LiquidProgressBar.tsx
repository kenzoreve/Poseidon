interface LiquidProgressBarProps {
  percent: number;
  label?: string;
  sublabel?: string;
  overAllocated?: boolean;
}

export function LiquidProgressBar({
  percent,
  label,
  sublabel,
  overAllocated = false,
}: LiquidProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full">
      {(label || sublabel) && (
        <div className="flex items-baseline justify-between gap-3 mb-2">
          {label && <span className="text-sm font-semibold text-[#0B4F5C] truncate">{label}</span>}
          {sublabel && (
            <span
              className={`text-sm font-bold tabular-nums shrink-0 ${
                overAllocated ? 'text-[#BA1A1A]' : 'text-[#0B4F5C]'
              }`}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
      <div
        className="relative h-3.5 w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(91, 116, 128, 0.14)' }}
        role="progressbar"
        aria-valuenow={Math.round(clamped * 100) / 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`relative h-full rounded-full transition-all duration-300 ease-out ${
            overAllocated ? 'bg-[#BA1A1A]' : 'bg-[#6FD6B5]'
          }`}
          style={{ width: `${clamped}%` }}
        >
          {!overAllocated && clamped > 3 && (
            <svg
              viewBox="0 0 16 14"
              className="absolute right-0 top-0 h-full w-3 text-[#FFFDF8]/40 animate-wave-crest"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M16 0 C8 3, 12 11, 16 14 L16 0 Z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
