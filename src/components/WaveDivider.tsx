type SurfaceTone = 'pearl' | 'sand' | 'teal';

const TONE_HEX: Record<SurfaceTone, string> = {
  pearl: '#FFFDF8',
  sand: '#F6E9D2',
  teal: '#0B4F5C',
};

interface WaveDividerProps {
  from: SurfaceTone;
  to: SurfaceTone;
  flip?: boolean;
}

export function WaveDivider({ from, to, flip = false }: WaveDividerProps) {
  return (
    <div
      className="w-full overflow-hidden leading-none select-none"
      style={{ backgroundColor: TONE_HEX[from] }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className={`block w-full h-10 sm:h-14 ${flip ? 'scale-x-[-1]' : ''}`}
      >
        <path
          d="M0,24 C240,68 480,0 720,34 C960,68 1200,14 1440,36 L1440,72 L0,72 Z"
          fill={TONE_HEX[to]}
        />
      </svg>
    </div>
  );
}
