import { ArrowLeft, Check, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { LiquidProgressBar } from '../components/LiquidProgressBar';
import { RippleButton } from '../components/RippleButton';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { APP_CONFIG, findTokenByAddress, getExplorerAddressUrl, getExplorerTxUrl } from '../config/arc';
import {
  usePoseidonTx,
  useSplitDetail,
  useTokenDetails,
} from '../hooks/usePoseidonContract';
import {
  basisPointsToPercent,
  formatPercentFromBps,
  formatTokenAmount,
  percentToBasisPoints,
  shortenAddress,
  validateShareUpdate,
} from '../lib/splitMath';

export function SplitDetailPage() {
  const { splitId } = useParams<{ splitId: string }>();
  const { address, isConnected } = useAccount();
  const { split, payments, isLoading, error, refetch } = useSplitDetail(splitId);
  const tokenInfo = useTokenDetails(split?.token);
  const knownToken = findTokenByAddress(split?.token);

  const symbol = tokenInfo.symbol ?? knownToken?.symbol ?? 'TOKEN';
  const decimals = tokenInfo.decimals ?? 6;

  const [editingShares, setEditingShares] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [submittedEdit, setSubmittedEdit] = useState(false);

  const { txState, updateShares, resetTx } = usePoseidonTx(() => {
    refetch();
  });

  useEffect(() => {
    if (split) {
      setEditingShares(split.sharesBps.map((bps) => String(basisPointsToPercent(bps))));
    }
  }, [split]);

  const isOwner = Boolean(
    isConnected && address && split && address.toLowerCase() === split.owner.toLowerCase()
  );

  const editValidation = validateShareUpdate(editingShares);

  function copyPayLink() {
    if (!split) return;
    navigator.clipboard.writeText(`${window.location.origin}/pay/${split.id.toString()}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleUpdateShares(e: FormEvent) {
    e.preventDefault();
    setSubmittedEdit(true);
    if (!split || !editValidation.valid) return;
    const nextBps = editingShares.map((pct) => BigInt(percentToBasisPoints(pct)));
    await updateShares(split.id, nextBps);
  }

  return (
    <section className="bg-[#FFFDF8] py-12 sm:py-16 min-h-[75vh]">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="mb-8">
          <Link
            to="/splits"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B7480] hover:text-[#0B4F5C] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Splits</span>
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
            Split Ledger
          </p>
          <h1 className="text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] font-bold tracking-[-0.025em] text-[#0B4F5C]">
            Split breakdown and history
          </h1>
        </div>

        {!APP_CONFIG.contractAddress ? (
          <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center">
            <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
              Contract address not configured
            </h2>
            <p className="text-sm text-[#5B7480]">
              Configure <code className="font-mono">VITE_CONTRACT_ADDRESS</code> to load split
              details and payment history from Arc.
            </p>
          </div>
        ) : isLoading ? (
          <div className="treasury-card bg-[#F6E9D2]/60 border border-[#5B7480]/15 p-10 h-80 animate-pulse" />
        ) : error || !split ? (
          <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-10 text-center">
            <h2 className="text-xl font-semibold text-[#0B4F5C] mb-2">
              Split #{splitId} was not found
            </h2>
            <p className="text-sm text-[#5B7480]">
              Verify the split ID on Arc or return to your splits list.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Header Card */}
            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#5B7480]/20">
                <div>
                  <p className="text-xs font-semibold text-[#5B7480] tabular-nums">
                    Split #{split.id.toString()} · {symbol} ({decimals} decimals) · Owner{' '}
                    <a
                      href={getExplorerAddressUrl(split.owner)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono underline underline-offset-2 text-[#0B4F5C]"
                    >
                      {shortenAddress(split.owner)}
                    </a>
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0B4F5C] mt-1">
                    {split.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <RippleButton variant="secondary" onClick={copyPayLink}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Pay Link' : 'Copy Pay Link'}</span>
                  </RippleButton>
                  <Link to={`/pay/${split.id.toString()}`}>
                    <RippleButton variant="primary">Pay This Split</RippleButton>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                    Total Settled
                  </p>
                  <p className="text-2xl font-bold text-[#0B4F5C] tabular-nums mt-1">
                    {formatTokenAmount(split.totalPaid, decimals)} {symbol}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                    Payments Count
                  </p>
                  <p className="text-2xl font-bold text-[#0B4F5C] tabular-nums mt-1">
                    {payments.length > 0 ? payments.length : split.paymentCount.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                    Recipients
                  </p>
                  <p className="text-2xl font-bold text-[#0B4F5C] tabular-nums mt-1">
                    {split.recipients.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient Shares + Owner-only Update Shares */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div
                className={`${
                  isOwner ? 'lg:col-span-6' : 'lg:col-span-12'
                } treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 space-y-4`}
              >
                <h3 className="text-xl font-bold text-[#0B4F5C]">Current Recipient Shares</h3>
                {split.recipients.map((recipient, idx) => {
                  const bps = split.sharesBps[idx] ?? 0n;
                  const pct = Number(bps) / 100;
                  return (
                    <div
                      key={`${recipient}-${idx}`}
                      className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={getExplorerAddressUrl(recipient)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-[#0B4F5C] hover:underline"
                        >
                          <span>{shortenAddress(recipient, 8, 6)}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#5B7480]" />
                        </a>
                        <span className="text-xs text-[#5B7480] tabular-nums">
                          {bps.toString()} bps
                        </span>
                      </div>
                      <LiquidProgressBar percent={pct} sublabel={formatPercentFromBps(bps)} />
                    </div>
                  );
                })}
              </div>

              {isOwner && (
                <form
                  onSubmit={handleUpdateShares}
                  noValidate
                  className="lg:col-span-6 treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8 space-y-5"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                      Owner Controls
                    </p>
                    <h3 className="text-xl font-bold text-[#0B4F5C] mt-1">Update Shares</h3>
                  </div>

                  <div className="space-y-3">
                    {split.recipients.map((recipient, idx) => {
                      const pctVal = editingShares[idx] ?? '';
                      const bpsVal = percentToBasisPoints(pctVal);
                      return (
                        <div
                          key={`edit-${recipient}-${idx}`}
                          className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-4"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <label
                              htmlFor={`edit-share-${idx}`}
                              className="text-xs font-mono font-medium text-[#0B4F5C]"
                            >
                              {shortenAddress(recipient, 8, 6)}
                            </label>
                            <span className="text-xs text-[#5B7480] tabular-nums">
                              {bpsVal} bps
                            </span>
                          </div>
                          <input
                            id={`edit-share-${idx}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={pctVal}
                            onChange={(e) => {
                              resetTx();
                              setEditingShares((prev) =>
                                prev.map((v, i) => (i === idx ? e.target.value : v))
                              );
                            }}
                            className="poseidon-input w-full px-3.5 py-2 text-sm tabular-nums"
                          />
                          {submittedEdit && editValidation.rowErrors[idx] && (
                            <p className="text-xs font-medium text-[#BA1A1A] mt-1">
                              {editValidation.rowErrors[idx]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-4">
                    <LiquidProgressBar
                      percent={basisPointsToPercent(editValidation.totalBps)}
                      label="Updated Total"
                      sublabel={`${basisPointsToPercent(editValidation.totalBps)}% (${editValidation.totalBps} / 10000 bps)`}
                      overAllocated={editValidation.totalBps > 10000}
                    />
                    {editValidation.totalError && (
                      <p className="text-xs font-semibold text-[#0B4F5C] mt-2">
                        {editValidation.totalError}
                      </p>
                    )}
                  </div>

                  <TxStatusBanner
                    txState={txState}
                    pendingText="Confirm share update in your wallet"
                    confirmingText="Updating shares on Arc"
                    confirmedText="Recipient shares updated on Arc"
                  />

                  <RippleButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={txState.status === 'pending' || txState.status === 'confirming'}
                  >
                    {txState.status === 'pending'
                      ? 'Waiting for Wallet'
                      : txState.status === 'confirming'
                        ? 'Updating Shares...'
                        : 'Save Updated Shares'}
                  </RippleButton>
                </form>
              )}
            </div>

            {/* Payment History */}
            <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-[#0B4F5C] mb-5">Payment History</h3>

              {payments.length === 0 ? (
                <div className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/15 p-8 text-center">
                  <p className="text-base font-semibold text-[#0B4F5C] mb-1">
                    No payments recorded yet
                  </p>
                  <p className="text-sm text-[#5B7480] mb-5">
                    Share the payment link to start routing {symbol} directly to recipients.
                  </p>
                  <Link to={`/pay/${split.id.toString()}`}>
                    <RippleButton variant="secondary" className="!px-5 !py-2.5 text-sm">
                      Open Payment Link
                    </RippleButton>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto treasury-well bg-[#FFFDF8] border border-[#5B7480]/15">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#5B7480]/15 text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480]">
                        <th className="py-3.5 px-5">Payer</th>
                        <th className="py-3.5 px-5 text-right">Amount</th>
                        <th className="py-3.5 px-5 text-right">Timestamp</th>
                        <th className="py-3.5 px-5 text-right">Explorer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#5B7480]/10 text-sm">
                      {payments.map((payment, idx) => (
                        <tr key={`${payment.payer}-${idx}`} className="hover:bg-[#F6E9D2]/40">
                          <td className="py-3.5 px-5 font-mono text-[#0B4F5C]">
                            {shortenAddress(payment.payer)}
                          </td>
                          <td className="py-3.5 px-5 text-right font-semibold text-[#0B4F5C] tabular-nums">
                            {formatTokenAmount(payment.amount, decimals)} {symbol}
                          </td>
                          <td className="py-3.5 px-5 text-right text-[#5B7480] tabular-nums">
                            {payment.timestamp > 0n
                              ? new Date(Number(payment.timestamp) * 1000).toLocaleString()
                              : 'On chain'}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {payment.txHash ? (
                              <a
                                href={getExplorerTxUrl(payment.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#0B4F5C] hover:underline"
                              >
                                <span>Arcscan</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <a
                                href={getExplorerAddressUrl(payment.payer)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#0B4F5C] hover:underline"
                              >
                                <span>Sender</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
