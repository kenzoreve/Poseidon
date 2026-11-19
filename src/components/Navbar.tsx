import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PoseidonLogo } from './PoseidonLogo';
import { RippleButton } from './RippleButton';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/create', label: 'Create Split' },
  { to: '/splits', label: 'My Splits' },
  { to: '/pay', label: 'Pay Split' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#5B7480]/15">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-18 flex items-center justify-between gap-3 md:gap-8">
        {/* Zone 1: Brand mark + wordmark */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-[#0B4F5C] font-bold text-xl tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F5C] rounded-lg"
          onClick={() => setMobileOpen(false)}
        >
          <PoseidonLogo className="w-9 h-9 shrink-0" />
          <span>Poseidon</span>
        </Link>

        {/* Zone 2: Single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative py-1 text-[15px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#0B4F5C]'
                    : 'text-[#5B7480] hover:text-[#0B4F5C]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full transition-opacity duration-150 ${
                      isActive ? 'bg-[#6FD6B5] opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary action (Wallet Connect) + Mobile drawer toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              if (!ready) {
                return (
                  <div className="h-10 w-36 rounded-full bg-[#F6E9D2]" aria-hidden="true" />
                );
              }

              if (!connected) {
                return (
                  <RippleButton
                    variant="primary"
                    onClick={openConnectModal}
                    className="!px-5 !py-2.5 text-sm"
                  >
                    Connect Wallet
                  </RippleButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <RippleButton
                    variant="secondary"
                    onClick={openChainModal}
                    className="!px-4 !py-2 text-sm border-[#BA1A1A] text-[#BA1A1A]"
                  >
                    Switch to Arc
                  </RippleButton>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F6E9D2] hover:bg-[#ead9bc] text-[#0B4F5C] px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <span>{chain.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0B4F5C] hover:bg-[#073842] text-[#FFFDF8] px-4 py-2 text-sm font-semibold tabular-nums whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <span>{account.displayName}</span>
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#0B4F5C] hover:bg-[#F6E9D2] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-[#FFFDF8] border-t border-[#5B7480]/15 px-5 py-4 flex flex-col gap-2"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#F6E9D2] text-[#0B4F5C]'
                    : 'text-[#5B7480] hover:bg-[#F6E9D2]/50 hover:text-[#0B4F5C]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
