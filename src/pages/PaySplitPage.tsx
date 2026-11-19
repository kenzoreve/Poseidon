import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ArrowRight, ExternalLink, Search, Wallet } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccount, useSwitchChain } from 'wagmi';
import { LiquidProgressBar } from '../components/LiquidProgressBar';
import { RippleButton } from '../components/RippleButton';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { APP_CONFIG, arcChain, findTokenByAddress, getExplorerAddressUrl } from '../config/arc';
import {
  usePoseidonTx,
  useSplitDetail,
  useTokenDetails,
} from '../hooks/usePoseidonContract';
import {
  calculatePayoutBreakdown,
  formatPercentFromBps,
  formatTokenAmount,
  parseTokenAmount,
  shortenAddress,
} from '../lib/splitMath';

export function PaySplitPage() {
  const { splitId } = useParams<{ splitId?: string }>();
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState(splitId ?? '');
  const [amountInput, setAmountInput] = useState('');
  const [actionMode, setActionMode] = useState<'approve' | 'pay' | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const { split, isLoading, error, refetch } = useSplitDetail(splitId);
  const tokenInfo = useTokenDetails(split?.token, address);
  const knownToken = findTokenByAddress(split?.token);

  const symbol = tokenInfo.symbol ?? knownToken?.symbol ?? 'TOKEN';
  const decimals = tokenInfo.decimals ?? 6;
  const amountRaw = parseTokenAmount(amountInput, decimals) ?? 0n;

  const { txState, approveErc20, paySplit, resetTx } = usePoseidonTx(() => {
    tokenInfo.refetch();
    refetch();
  });

  const needsAllowance =
    isConnected &&
    amountRaw > 0n &&
    tokenInfo.allowance !== undefined &&
    tokenInfo.allowance < amountRaw;

  const insufficientBalance =
    isConnected &&
    amountRaw > 0n &&
    tokenInfo.balance !== undefined &&
    tokenInfo.balance < amountRaw;

  const payoutPreview =
    split && amountRaw > 0n ? calculatePayoutBreakdown(amountRaw, split.sharesBps) : [];

  function handleLookupSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = lookupId.trim();
    if (/^\d+$/.test(cleaned)) {
      navigate(`/pay/${cleaned}`);
    }
  }

  async function handleApprove() {
    if (!split || amountRaw <= 0n) return;
    setActionMode('approve');
    await approveErc20(split.token, amountRaw);
  }

  async function handlePay() {
    if (!split || amountRaw <= 0n) return;
    setActionMode('pay');
    await paySplit(split.id, amountRaw);
  }

  return (
    <section className="bg-[#FFFDF8] py-12 sm:py-16 min-h-[75vh]">
      <div className="max-w-[1040px] mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
            Public Payment Link
          </p>
          <h1 className="text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] font-bold tracking-[-0.025em] text-[#0B4F5C]">
            Pay a split directly
          </h1>
          <p className="text-base text-[#5B7480] mt-2">
            Inspect every recipient share publicly before connecting a wallet to pay.
          </p>
        </div>

        {/* Lookup bar when visiting /pay or switching split */}
        <form
          onSubmit={handleLookupSubmit}
          className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <label htmlFor="split-lookup-id" className="sr-only">
            Split ID
          </label>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5B7480] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="split-lookup-id"
              type="text"
              inputMode="numeric"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Enter a Split ID (for example 1)"
              className="poseidon-input w-full pl-11 pr-4 py-3 text-sm tabular-nums"
            />
          </div>
          <RippleButton type="submit" variant="secondary" disabled={!/^\d+$/.test(lookupId.trim())}>
            <span>Open Split</span>
            <ArrowRight className="w-4 h-4" />
          </RippleButton>
        </form>

        {!splitId ? (
          <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center">
            <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
              Enter a Split ID above or open a shared link
            </h2>
            <p className="text-sm text-[#5B7480] max-w-md mx-auto">
              Every split has a public payment URL at <code className="font-mono">/pay/&lt;id&gt;</code>{' '}
              that anyone can inspect before sending tokens.
            </p>
          </div>
        ) : !APP_CONFIG.contractAddress ? (
          <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center">
            <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
              Contract address not configured
            </h2>
            <p className="text-sm text-[#5B7480]">
              Configure <code className="font-mono">VITE_CONTRACT_ADDRESS</code> to load split #
              {splitId} from Arc.
            </p>
          </div>
        ) : isLoading ? (
          <div className="treasury-card bg-[#F6E9D2]/60 border border-[#5B7480]/15 p-10 h-72 animate-pulse" />
        ) : error || !split ? (
          <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center">
            <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
              Split #{splitId} was not found
            </h2>
            <p className="text-sm text-[#5B7480]">
              Confirm the split ID exists on the deployed Poseidon contract.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Public Split Breakdown */}
            <div className="lg:col-span-7 treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#5B7480]/20">
                <div>
                  <p className="text-xs font-semibold text-[#5B7480] tabular-nums">
                    Split #{split.id.toString()} · {symbol} ({decimals} decimals)
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0B4F5C] mt-1">
                    {split.name}
                  </h2>
                </div>
                <Link
                  to={`/split/${split.id.toString()}`}
                  className="text-sm font-semibold text-[#0B4F5C] underline underline-offset-4 hover:text-[#5B7480]"
                >
                  View History
                </Link>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                  Recipient Allocation
                </p>
                {split.recipients.map((recipient, idx) => {
                  const bps = split.sharesBps[idx] ?? 0n;
                  const pct = Number(bps) / 100;
                  const est = payoutPreview[idx];
                  return (
                    <div
                      key={`${recipient}-${idx}`}
                      className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <a
                          href={getExplorerAddressUrl(recipient)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-mono font-medium text-[#0B4F5C] hover:underline"
                        >
                          <span>{shortenAddress(recipient, 8, 6)}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#5B7480]" />
                        </a>
                        {est !== undefined && amountRaw > 0n && (
                          <span className="text-sm font-bold text-[#0B4F5C] tabular-nums">
                            {formatTokenAmount(est, decimals)} {symbol}
                          </span>
                        )}
                      </div>
                      <LiquidProgressBar
                        percent={pct}
                        sublabel={`${formatPercentFromBps(bps)} (${bps.toString()} bps)`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Execution Panel */}
            <div className="lg:col-span-5 treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-1">
                  Instant Settlement
                </p>
                <h3 className="text-xl font-bold text-[#0B4F5C]">Send {symbol}</h3>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <label htmlFor="pay-amount" className="text-sm font-semibold text-[#0B4F5C]">
                    Amount ({symbol})
                  </label>
                  {isConnected && tokenInfo.balance !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        resetTx();
                        setAmountInput(formatTokenAmount(tokenInfo.balance!, decimals, decimals));
                      }}
                      className="text-xs font-semibold text-[#0B4F5C] hover:underline tabular-nums cursor-pointer"
                    >
                      Balance: {formatTokenAmount(tokenInfo.balance, decimals)} {symbol}
                    </button>
                  )}
                </div>
                <input
                  id="pay-amount"
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(e) => {
                    resetTx();
                    setAmountInput(e.target.value);
                  }}
                  placeholder={`0.00 ${symbol}`}
                  className="poseidon-input w-full px-4 py-3.5 text-lg font-semibold tabular-nums"
                />
                {insufficientBalance && (
                  <p className="text-xs font-semibold text-[#BA1A1A] mt-2">
                    Amount exceeds your connected {symbol} balance
                  </p>
                )}
              </div>

              {isConnected && tokenInfo.allowance !== undefined && amountRaw > 0n && (
                <div className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-3.5 flex items-center justify-between text-xs">
                  <span className="text-[#5B7480]">Current {symbol} allowance</span>
                  <span className="font-bold text-[#0B4F5C] tabular-nums">
                    {formatTokenAmount(tokenInfo.allowance, decimals)} {symbol}
                  </span>
                </div>
              )}

              <TxStatusBanner
                txState={txState}
                pendingText={
                  actionMode === 'approve'
                    ? `Confirm ${symbol} approval in your wallet`
                    : 'Confirm split payment in your wallet'
                }
                confirmingText={
                  actionMode === 'approve'
                    ? `Confirming ${symbol} approval on Arc`
                    : 'Dividing payment across recipients on Arc'
                }
                confirmedText={
                  actionMode === 'approve'
                    ? `${symbol} approved — you can now pay the split`
                    : 'Payment settled across all recipients'
                }
              />

              {!isConnected ? (
                <div className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/20 p-5 text-center space-y-3">
                  <Wallet className="w-6 h-6 text-[#0B4F5C] mx-auto" />
                  <p className="text-sm text-[#5B7480]">
                    Connect your wallet when you are ready to approve and pay.
                  </p>
                  <RippleButton
                    variant="primary"
                    className="w-full"
                    onClick={() => openConnectModal?.()}
                  >
                    Connect Wallet to Pay
                  </RippleButton>
                </div>
              ) : chainId !== arcChain.id ? (
                <RippleButton
                  variant="primary"
                  className="w-full"
                  disabled={isSwitching}
                  onClick={() => switchChain({ chainId: arcChain.id })}
                >
                  {isSwitching ? 'Switching to Arc...' : 'Switch Network to Arc'}
                </RippleButton>
              ) : needsAllowance ? (
                <RippleButton
                  variant="primary"
                  className="w-full"
                  disabled={
                    amountRaw <= 0n ||
                    insufficientBalance ||
                    txState.status === 'pending' ||
                    txState.status === 'confirming'
                  }
                  onClick={handleApprove}
                >
                  {txState.status === 'pending'
                    ? 'Waiting for Wallet'
                    : txState.status === 'confirming'
                      ? `Approving ${symbol}...`
                      : `Approve ${symbol}`}
                </RippleButton>
              ) : (
                <RippleButton
                  variant="primary"
                  className="w-full"
                  disabled={
                    amountRaw <= 0n ||
                    insufficientBalance ||
                    txState.status === 'pending' ||
                    txState.status === 'confirming'
                  }
                  onClick={handlePay}
                >
                  {txState.status === 'pending'
                    ? 'Waiting for Wallet'
                    : txState.status === 'confirming'
                      ? 'Settling Payment...'
                      : `Pay Split`}
                </RippleButton>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
