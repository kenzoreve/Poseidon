import { motion } from 'framer-motion';

const CHANNEL_SLOTS = [
  { label: 'Recipient A', sub: 'Basis points', y: 58 },
  { label: 'Recipient B', sub: 'Basis points', y: 150 },
  { label: 'Recipient C', sub: 'Basis points', y: 242 },
];

export function FlowingMoneyDiagram() {
  return (
    <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 relative overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
            Single Transaction Routing
          </p>
          <p className="text-lg font-semibold text-[#0B4F5C] mt-0.5">
            Instant basis point settlement
          </p>
        </div>
        <p className="text-xs font-semibold text-[#5B7480]">
          Direct flow · Zero escrow
        </p>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 520 300"
          className="w-full h-auto block"
          role="img"
          aria-label="Diagram illustrating one incoming payment dividing instantly into recipient shares with no escrow"
        >
          {/* Underlying quiet tracks */}
          {CHANNEL_SLOTS.map((ch) => (
            <path
              key={`track-${ch.label}`}
              d={`M 136 150 C 235 150, 245 ${ch.y}, 344 ${ch.y}`}
              fill="none"
              stroke="rgba(91, 116, 128, 0.22)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {/* Animated Seafoam flowing current lines */}
          {CHANNEL_SLOTS.map((ch, i) => (
            <path
              key={`flow-${ch.label}`}
              d={`M 136 150 C 235 150, 245 ${ch.y}, 344 ${ch.y}`}
              fill="none"
              stroke="#6FD6B5"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-flow-current"
              style={{ animationDelay: `${i * 0.28}s` }}
            />
          ))}

          {/* Source node */}
          <g transform="translate(12, 108)">
            <rect width="126" height="84" rx="18" fill="#0B4F5C" />
            <text
              x="16"
              y="33"
              fill="#F6E9D2"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.06em"
            >
              INCOMING
            </text>
            <text x="16" y="57" fill="#FFFDF8" fontSize="16" fontWeight="700">
              USDC / EURC
            </text>
          </g>

          {/* Center splitter prism badge */}
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="222" cy="150" r="22" fill="#FFFDF8" stroke="#0B4F5C" strokeWidth="2.5" />
            <path
              d="M214 150 H230 M224 144 L230 150 L224 156"
              fill="none"
              stroke="#0B4F5C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* Destination recipient nodes */}
          {CHANNEL_SLOTS.map((ch) => (
            <g key={`node-${ch.label}`} transform={`translate(344, ${ch.y - 30})`}>
              <rect
                width="164"
                height="60"
                rx="16"
                fill="#FFFDF8"
                stroke="rgba(91, 116, 128, 0.25)"
                strokeWidth="1.2"
              />
              <text x="14" y="25" fill="#5B7480" fontSize="11" fontWeight="600">
                {ch.label}
              </text>
              <text x="14" y="45" fill="#0B4F5C" fontSize="14" fontWeight="700">
                {ch.sub}
              </text>
              <circle cx="144" cy="30" r="6" fill="#6FD6B5" />
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-5 pt-4 border-t border-[#5B7480]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B7480]">
        <span>Atomic execution in one transaction</span>
        <span className="font-medium text-[#0B4F5C]">Funds never rest in the contract</span>
      </div>
    </div>
  );
}
