import { ArrowRight, Check, Copy, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LiquidProgressBar } from '../components/LiquidProgressBar';
import { RippleButton } from '../components/RippleButton';
import { WalletGate } from '../components/WalletGate';
import { APP_CONFIG, findTokenByAddress } from '../config/arc';
import { useOwnerSplits, useTokenDetails, type SplitData } from '../hooks/usePoseidonContract';
import { formatPercentFromBps, formatTokenAmount, shortenAddress } from '../lib/splitMath';

function SplitSummaryCard({ split }: { split: SplitData }) {
  const [copied, setCopied] = useState(false);
  const tokenInfo = useTokenDetails(split.token);
  const knownToken = findTokenByAddress(split.token);
  const symbol = tokenInfo.symbol ?? knownToken?.symbol ?? 'TOKEN';
  const decimals = tokenInfo.decimals ?? 6;
  const splitIdStr = split.id.toString();

  function copyPayLink() {
    const url = `${window.location.origin}/pay/${splitIdStr}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="treasury-card treasury-card-hover bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 flex flex-col justify-between gap-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-[#5B7480] tabular-nums">
              Split #{splitIdStr} · {symbol}
            </p>
            <h2 className="text-2xl font-bold text-[#0B4F5C] mt-1">{split.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
              Total Settled
            </p>
            <p className="text-xl font-bold text-[#0B4F5C] tabular-nums">
              {formatTokenAmount(split.totalPaid, decimals)} {symbol}
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          {split.recipients.map((recipient, idx) => {
            const bps = split.sharesBps[idx] ?? 0n;
            const pct = Number(bps) / 100;
            return (
              <div key={`${recipient}-${idx}`} className="treasury-well bg-[#FFFDF8] p-3.5">
                <LiquidProgressBar
                  percent={pct}
                  label={shortenAddress(recipient)}
                  sublabel={formatPercentFromBps(bps)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#5B7480]/20 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={copyPayLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B4F5C] hover:text-[#5B7480] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Pay link copied' : 'Copy Pay Link'}</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Link to={`/pay/${splitIdStr}`}>
            <RippleButton variant="secondary" className="!px-4 !py-2 text-xs">
              Pay Link
            </RippleButton>
          </Link>
          <Link to={`/split/${splitIdStr}`}>
            <RippleButton variant="primary" className="!px-4 !py-2 text-xs">
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </RippleButton>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MySplitsPage() {
  const { address } = useAccount();
  const { data: splits, isLoading, error } = useOwnerSplits(address);
  const contractMissing = !APP_CONFIG.contractAddress;

  return (
    <section className="bg-[#FFFDF8] py-12 sm:py-16 min-h-[75vh]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
              Connected Wallet Splits
            </p>
            <h1 className="text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] font-bold tracking-[-0.025em] text-[#0B4F5C]">
              Your active splits
            </h1>
          </div>

          {address && (
            <Link to="/create">
              <RippleButton variant="primary">
                <Plus className="w-4 h-4" />
                <span>Create a Split</span>
              </RippleButton>
            </Link>
          )}
        </div>

        <WalletGate
          title="Connect wallet to view your splits"
          description="Only splits owned by your connected Arc wallet are displayed here."
        >
          {contractMissing ? (
            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center max-w-xl mx-auto">
              <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
                Contract address not configured
              </h2>
              <p className="text-sm text-[#5B7480]">
                Configure <code className="font-mono">VITE_CONTRACT_ADDRESS</code> to read splits
                owned by {shortenAddress(address || '')}.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((n) => (
                <div
                  key={n}
                  className="treasury-card bg-[#F6E9D2]/60 border border-[#5B7480]/15 p-8 h-64 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="treasury-card bg-[#FFDAD6] border border-[#BA1A1A]/30 p-8 text-center max-w-xl mx-auto">
              <h2 className="text-lg font-semibold text-[#93000A] mb-2">
                Unable to load splits from Arc
              </h2>
              <p className="text-sm text-[#93000A]/80">
                Verify the deployed contract address and network connection.
              </p>
            </div>
          ) : !splits || splits.length === 0 ? (
            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 sm:p-14 text-center max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#0B4F5C] mb-3">
                No splits found for this wallet
              </h2>
              <p className="text-[15px] text-[#5B7480] mb-7 leading-relaxed">
                Splits you create with {shortenAddress(address || '')} appear here automatically.
              </p>
              <Link to="/create">
                <RippleButton variant="primary">Create Your First Split</RippleButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {splits.map((split) => (
                <SplitSummaryCard key={split.id.toString()} split={split} />
              ))}
            </div>
          )}
        </WalletGate>
      </div>
    </section>
  );
}
