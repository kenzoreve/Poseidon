import { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG, getExplorerAddressUrl } from '../config/arc';
import { shortenAddress } from '../lib/splitMath';
import { PoseidonLogo } from './PoseidonLogo';

export function Footer() {
  const [rippleKey, setRippleKey] = useState(0);

  return (
    <footer className="bg-[#0B4F5C] text-[#FFFDF8] border-t border-[#5B7480]/25">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#5B7480]/30">
          <div className="flex items-center gap-3.5">
            <PoseidonLogo className="w-10 h-10 shrink-0" />
            <div>
              <p className="text-lg font-bold tracking-tight text-[#FFFDF8]">Poseidon</p>
              <p className="text-sm text-[#F6E9D2]/85">
                Poseidon is an independent project built on Arc.
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-[#F6E9D2]" aria-label="Footer navigation">
            <Link to="/" className="hover:text-[#6FD6B5] transition-colors whitespace-nowrap">
              Home
            </Link>
            <Link to="/create" className="hover:text-[#6FD6B5] transition-colors whitespace-nowrap">
              Create Split
            </Link>
            <Link to="/splits" className="hover:text-[#6FD6B5] transition-colors whitespace-nowrap">
              My Splits
            </Link>
            <Link to="/pay" className="hover:text-[#6FD6B5] transition-colors whitespace-nowrap">
              Pay Split
            </Link>
            {APP_CONFIG.contractAddress && (
              <a
                href={getExplorerAddressUrl(APP_CONFIG.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#6FD6B5] transition-colors font-mono text-xs whitespace-nowrap"
              >
                Contract {shortenAddress(APP_CONFIG.contractAddress)}
              </a>
            )}
          </nav>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div
            onMouseEnter={() => setRippleKey((k) => k + 1)}
            onFocus={() => setRippleKey((k) => k + 1)}
            tabIndex={0}
            className="group relative overflow-hidden inline-flex items-center gap-2.5 rounded-full border border-[#6FD6B5]/40 bg-[#073842] px-5 py-2 text-sm font-semibold text-[#FFFDF8] cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD6B5]"
          >
            {rippleKey > 0 && (
              <span
                key={rippleKey}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 w-28 h-28 rounded-full bg-[#6FD6B5]/35 kenzo-ripple-ring"
              />
            )}
            <span className="relative z-10">Built by Kenzo</span>
          </div>

          <p className="text-xs text-[#F6E9D2]/75">
            Available on Arc
          </p>
        </div>
      </div>
    </footer>
  );
}
