import { Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Address } from 'viem';
import { LiquidProgressBar } from '../components/LiquidProgressBar';
import { RippleButton } from '../components/RippleButton';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';
import { APP_CONFIG, SUPPORTED_TOKENS } from '../config/arc';
import { usePoseidonTx, useTokenDetails } from '../hooks/usePoseidonContract';
import {
  basisPointsToPercent,
  distributeEvenlyBasisPoints,
  percentToBasisPoints,
  validateSplitDraft,
  type RecipientDraft,
} from '../lib/splitMath';

export function CreateSplitPage() {
  const [name, setName] = useState('');
  const [token, setToken] = useState<string>(SUPPORTED_TOKENS[0].address);
  const [recipients, setRecipients] = useState<RecipientDraft[]>([
    { address: '', percent: '50' },
    { address: '', percent: '50' },
  ]);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  const selectedToken = useTokenDetails(token as Address);
  const { txState, createSplit, resetTx } = usePoseidonTx();

  const validation = validateSplitDraft({ name, token, recipients });
  const allocatedPercent = basisPointsToPercent(validation.totalBps);
  const contractMissing = !APP_CONFIG.contractAddress;

  function addRecipient() {
    resetTx();
    setRecipients((prev) => [...prev, { address: '', percent: '' }]);
  }

  function removeRecipient(idx: number) {
    if (recipients.length <= 1) return;
    resetTx();
    setRecipients((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRecipient(idx: number, field: keyof RecipientDraft, value: string) {
    resetTx();
    setRecipients((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function handleDistributeEvenly() {
    resetTx();
    const bpsList = distributeEvenlyBasisPoints(recipients.length);
    setRecipients((prev) =>
      prev.map((row, i) => ({
        ...row,
        percent: String(basisPointsToPercent(bpsList[i])),
      }))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmittedAttempt(true);
    if (!validation.valid) return;

    const cleanRecipients = recipients.map((r) => r.address.trim() as Address);
    const sharesBps = recipients.map((r) => BigInt(percentToBasisPoints(r.percent)));
    await createSplit(name.trim(), token as Address, cleanRecipients, sharesBps);
  }

  return (
    <section className="bg-[#FFFDF8] py-12 sm:py-16 min-h-[75vh]">
      <div className="max-w-[920px] mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#5B7480] mb-2">
            Available on Arc
          </p>
          <h1 className="text-[32px] leading-[40px] sm:text-[42px] sm:leading-[50px] font-bold tracking-[-0.025em] text-[#0B4F5C]">
            Create a new split
          </h1>
          <p className="text-base text-[#5B7480] mt-2">
            Set the split name, settlement token, and recipient shares totaling 100%.
          </p>
        </div>

        <WalletGate
          title="Connect wallet to create a split"
          description="Connect your Arc wallet to deploy a new split configuration directly on chain."
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-6 sm:p-10 space-y-8"
          >
            {contractMissing && (
              <div className="treasury-well bg-[#FFFDF8] border border-[#0B4F5C]/20 p-4 text-sm text-[#0B4F5C]">
                Deployed contract address is not configured yet. Set{' '}
                <code className="font-mono text-xs bg-[#F6E9D2] px-1.5 py-0.5 rounded">
                  VITE_CONTRACT_ADDRESS
                </code>{' '}
                to submit transactions.
              </div>
            )}

            {/* Split Name */}
            <div>
              <label htmlFor="split-name" className="block text-sm font-semibold text-[#0B4F5C] mb-2">
                Split Name
              </label>
              <input
                id="split-name"
                type="text"
                value={name}
                onChange={(e) => {
                  resetTx();
                  setName(e.target.value);
                }}
                placeholder="Design Retainer or Studio Revenue"
                className="poseidon-input w-full px-4 py-3 text-[15px]"
              />
              {submittedAttempt && validation.errors.name && (
                <p className="text-xs font-medium text-[#BA1A1A] mt-1.5">{validation.errors.name}</p>
              )}
            </div>

            {/* Token Selector */}
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-[#0B4F5C]">Settlement Token</span>
                <span className="text-xs text-[#5B7480] tabular-nums">
                  {selectedToken.decimals !== undefined
                    ? `${selectedToken.symbol ?? 'Token'} · ${selectedToken.decimals} decimals read from Arc`
                    : 'Reading token metadata'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Settlement Token">
                {SUPPORTED_TOKENS.map((t) => {
                  const active = token.toLowerCase() === t.address.toLowerCase();
                  return (
                    <button
                      key={t.address}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        resetTx();
                        setToken(t.address);
                      }}
                      className={`rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0B4F5C] text-[#FFFDF8] border-[#0B4F5C]'
                          : 'bg-[#FFFDF8] text-[#0B4F5C] border-[#5B7480]/25 hover:border-[#0B4F5C]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-base">{t.symbol}</span>
                        <span
                          className={`text-xs ${active ? 'text-[#6FD6B5]' : 'text-[#5B7480]'}`}
                        >
                          {t.name}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-mono mt-1 truncate ${
                          active ? 'text-[#F6E9D2]/80' : 'text-[#5B7480]'
                        }`}
                      >
                        {t.address}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipients */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0B4F5C]">
                    Recipients and Shares
                  </h2>
                  <p className="text-xs text-[#5B7480]">
                    Entered percentages convert to on-chain basis points (1% = 100 bps)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RippleButton
                    variant="ghost"
                    onClick={handleDistributeEvenly}
                    className="!px-3.5 !py-2 text-xs bg-[#FFFDF8]/70"
                  >
                    Split Evenly
                  </RippleButton>
                  <RippleButton
                    variant="secondary"
                    onClick={addRecipient}
                    className="!px-3.5 !py-2 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Recipient</span>
                  </RippleButton>
                </div>
              </div>

              <div className="space-y-3">
                {recipients.map((row, idx) => {
                  const rowErr = submittedAttempt ? validation.errors.recipients[idx] : undefined;
                  const rowBps = percentToBasisPoints(row.percent);
                  return (
                    <div
                      key={idx}
                      className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/20 p-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        <div className="sm:col-span-7">
                          <label
                            htmlFor={`recipient-addr-${idx}`}
                            className="block text-xs font-semibold text-[#5B7480] mb-1"
                          >
                            Recipient {idx + 1} Address
                          </label>
                          <input
                            id={`recipient-addr-${idx}`}
                            type="text"
                            value={row.address}
                            onChange={(e) => updateRecipient(idx, 'address', e.target.value)}
                            placeholder="0x..."
                            className="poseidon-input w-full px-3.5 py-2.5 text-sm font-mono"
                          />
                          {rowErr?.address && (
                            <p className="text-xs font-medium text-[#BA1A1A] mt-1">
                              {rowErr.address}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <label
                            htmlFor={`recipient-pct-${idx}`}
                            className="block text-xs font-semibold text-[#5B7480] mb-1"
                          >
                            Share (%)
                          </label>
                          <div className="relative">
                            <input
                              id={`recipient-pct-${idx}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={row.percent}
                              onChange={(e) => updateRecipient(idx, 'percent', e.target.value)}
                              placeholder="50"
                              className="poseidon-input w-full pl-3.5 pr-16 py-2.5 text-sm tabular-nums"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5B7480] tabular-nums">
                              {rowBps} bps
                            </span>
                          </div>
                          {rowErr?.share && (
                            <p className="text-xs font-medium text-[#BA1A1A] mt-1">
                              {rowErr.share}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-1 flex sm:justify-end sm:pt-6">
                          <button
                            type="button"
                            onClick={() => removeRecipient(idx)}
                            disabled={recipients.length <= 1}
                            aria-label={`Remove recipient ${idx + 1}`}
                            className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#5B7480] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Liquid Allocation Progress */}
              <div className="treasury-well bg-[#FFFDF8] border border-[#5B7480]/20 p-5 mt-4">
                <LiquidProgressBar
                  percent={allocatedPercent}
                  label="Total Allocated"
                  sublabel={`${allocatedPercent}% (${validation.totalBps} / 10000 bps)`}
                  overAllocated={validation.totalBps > 10000}
                />
                {validation.errors.total && (
                  <p className="text-xs font-semibold text-[#0B4F5C] mt-2.5">
                    {validation.errors.total}
                  </p>
                )}
              </div>
            </div>

            <TxStatusBanner
              txState={txState}
              pendingText="Confirm split creation in your wallet"
              confirmingText="Deploying your split on Arc"
              confirmedText="Split created on Arc"
            />

            {txState.status === 'confirmed' && (
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/splits">
                  <RippleButton variant="secondary">View My Splits</RippleButton>
                </Link>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
              <RippleButton
                type="submit"
                variant="primary"
                disabled={
                  contractMissing ||
                  txState.status === 'pending' ||
                  txState.status === 'confirming'
                }
              >
                {txState.status === 'pending'
                  ? 'Waiting for Wallet'
                  : txState.status === 'confirming'
                    ? 'Confirming on Arc'
                    : 'Create Split'}
              </RippleButton>
            </div>
          </form>
        </WalletGate>
      </div>
    </section>
  );
}
