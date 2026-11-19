import { CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { getExplorerTxUrl } from '../config/arc';
import type { TxLifecycleState } from '../hooks/usePoseidonContract';

interface TxStatusBannerProps {
  txState: TxLifecycleState;
  pendingText?: string;
  confirmingText?: string;
  confirmedText?: string;
}

export function TxStatusBanner({
  txState,
  pendingText = 'Confirm the transaction in your wallet',
  confirmingText = 'Transaction submitted and confirming on Arc',
  confirmedText = 'Transaction confirmed on Arc',
}: TxStatusBannerProps) {
  if (txState.status === 'idle') return null;

  if (txState.status === 'pending') {
    return (
      <div
        role="status"
        className="treasury-well bg-[#F6E9D2] border border-[#0B4F5C]/20 p-4 flex items-center gap-3 text-sm text-[#0B4F5C]"
      >
        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#0B4F5C]" />
        <span className="font-medium">{pendingText}</span>
      </div>
    );
  }

  if (txState.status === 'confirming') {
    return (
      <div
        role="status"
        className="treasury-well bg-[#F6E9D2] border border-[#0B4F5C]/25 p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#0B4F5C]"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#0B4F5C]" />
          <span className="font-medium">{confirmingText}</span>
        </div>
        {txState.hash && (
          <a
            href={getExplorerTxUrl(txState.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 hover:text-[#5B7480]"
          >
            <span>View on Arcscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  if (txState.status === 'confirmed') {
    return (
      <div
        role="status"
        className="treasury-well bg-[#6FD6B5]/25 border border-[#0B4F5C]/25 p-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#0B4F5C]"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0B4F5C]" />
          <span className="font-semibold">{confirmedText}</span>
        </div>
        {txState.hash && (
          <a
            href={getExplorerTxUrl(txState.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 hover:text-[#5B7480]"
          >
            <span>View on Arcscan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="treasury-well bg-[#FFDAD6] border border-[#BA1A1A]/30 p-4 flex items-start gap-3 text-sm text-[#93000A]"
    >
      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="font-medium">{txState.error || 'Transaction failed'}</span>
    </div>
  );
}
