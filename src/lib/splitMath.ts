export const TOTAL_BASIS_POINTS = 10000;
export const TOTAL_BASIS_POINTS_BIGINT = 10000n;

export interface RecipientDraft {
  address: string;
  percent: string;
}

export interface SplitDraft {
  name: string;
  token: string;
  recipients: RecipientDraft[];
}

export interface SplitValidationResult {
  valid: boolean;
  totalBps: number;
  remainingBps: number;
  errors: {
    name?: string;
    token?: string;
    total?: string;
    recipients: Record<number, { address?: string; share?: string }>;
  };
}

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isValidAddress(value: string): boolean {
  return ETH_ADDRESS_RE.test(value.trim());
}

export function shortenAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  const clean = address.trim();
  if (clean.length <= prefixLen + suffixLen + 3) return clean;
  return `${clean.slice(0, prefixLen)}...${clean.slice(-suffixLen)}`;
}

export function percentToBasisPoints(percentInput: string | number): number {
  if (typeof percentInput === 'number') {
    if (!Number.isFinite(percentInput) || percentInput < 0) return 0;
    return Math.round(percentInput * 100);
  }
  const trimmed = percentInput.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

export function basisPointsToPercent(bps: number | bigint): number {
  const numeric = typeof bps === 'bigint' ? Number(bps) : bps;
  if (!Number.isFinite(numeric)) return 0;
  return Number((numeric / 100).toFixed(2));
}

export function formatPercentFromBps(bps: number | bigint): string {
  const pct = basisPointsToPercent(bps);
  if (Number.isInteger(pct)) {
    return `${pct}%`;
  }
  return `${pct.toFixed(2).replace(/\.?0+$/, '')}%`;
}

export function distributeEvenlyBasisPoints(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(TOTAL_BASIS_POINTS / count);
  const remainder = TOTAL_BASIS_POINTS - base * count;
  return Array.from({ length: count }, (_, idx) => (idx === 0 ? base + remainder : base));
}

export function validateSplitDraft(draft: SplitDraft): SplitValidationResult {
  const errors: SplitValidationResult['errors'] = { recipients: {} };
  const name = draft.name.trim();
  if (!name) {
    errors.name = 'Enter a split name';
  } else if (name.length > 80) {
    errors.name = 'Split name must be 80 characters or fewer';
  }

  if (!isValidAddress(draft.token)) {
    errors.token = 'Select or enter a valid token contract address';
  }

  if (draft.recipients.length === 0) {
    errors.total = 'Add at least one recipient';
    return {
      valid: false,
      totalBps: 0,
      remainingBps: TOTAL_BASIS_POINTS,
      errors,
    };
  }

  const seen = new Set<string>();
  let totalBps = 0;

  draft.recipients.forEach((recipient, index) => {
    const rowErr: { address?: string; share?: string } = {};
    const addr = recipient.address.trim();

    if (!isValidAddress(addr)) {
      rowErr.address = 'Enter a valid 0x wallet address';
    } else {
      const lower = addr.toLowerCase();
      if (seen.has(lower)) {
        rowErr.address = 'Duplicate recipient address';
      }
      seen.add(lower);
    }

    const rawNum = Number(recipient.percent.trim());
    const bps = percentToBasisPoints(recipient.percent);
    if (!recipient.percent.trim() || !Number.isFinite(rawNum) || bps <= 0) {
      rowErr.share = 'Share must be greater than 0%';
    } else if (bps > TOTAL_BASIS_POINTS) {
      rowErr.share = 'Share cannot exceed 100%';
    }

    totalBps += bps;

    if (rowErr.address || rowErr.share) {
      errors.recipients[index] = rowErr;
    }
  });

  const remainingBps = TOTAL_BASIS_POINTS - totalBps;
  if (totalBps !== TOTAL_BASIS_POINTS) {
    errors.total =
      totalBps < TOTAL_BASIS_POINTS
        ? `Shares total ${basisPointsToPercent(totalBps)}% — add ${basisPointsToPercent(remainingBps)}% to reach 100%`
        : `Shares total ${basisPointsToPercent(totalBps)}% — reduce by ${basisPointsToPercent(Math.abs(remainingBps))}%`;
  }

  const hasRecipientErrors = Object.keys(errors.recipients).length > 0;
  const valid = !errors.name && !errors.token && !errors.total && !hasRecipientErrors;

  return {
    valid,
    totalBps,
    remainingBps,
    errors,
  };
}

export function validateShareUpdate(sharesPercent: string[]): {
  valid: boolean;
  totalBps: number;
  remainingBps: number;
  rowErrors: Record<number, string>;
  totalError?: string;
} {
  const rowErrors: Record<number, string> = {};
  let totalBps = 0;

  sharesPercent.forEach((value, idx) => {
    const bps = percentToBasisPoints(value);
    const numeric = Number(value.trim());
    if (!value.trim() || !Number.isFinite(numeric) || bps <= 0) {
      rowErrors[idx] = 'Share must be greater than 0%';
    } else if (bps > TOTAL_BASIS_POINTS) {
      rowErrors[idx] = 'Share cannot exceed 100%';
    }
    totalBps += bps;
  });

  const remainingBps = TOTAL_BASIS_POINTS - totalBps;
  let totalError: string | undefined;
  if (totalBps !== TOTAL_BASIS_POINTS) {
    totalError =
      totalBps < TOTAL_BASIS_POINTS
        ? `Shares total ${basisPointsToPercent(totalBps)}% — add ${basisPointsToPercent(remainingBps)}%`
        : `Shares total ${basisPointsToPercent(totalBps)}% — reduce by ${basisPointsToPercent(Math.abs(remainingBps))}%`;
  }

  return {
    valid: Object.keys(rowErrors).length === 0 && !totalError,
    totalBps,
    remainingBps,
    rowErrors,
    totalError,
  };
}

/**
 * Computes exact per-recipient token amounts matching integer basis-point division.
 * Any indivisible remainder (dust from integer division) is added to the final recipient
 * so the sum of outputs equals totalAmountRaw with zero tokens trapped in the contract.
 */
export function calculatePayoutBreakdown(totalAmountRaw: bigint, sharesBps: bigint[]): bigint[] {
  if (totalAmountRaw <= 0n || sharesBps.length === 0) {
    return sharesBps.map(() => 0n);
  }
  const payouts = sharesBps.map((bps) => (totalAmountRaw * bps) / TOTAL_BASIS_POINTS_BIGINT);
  const distributed = payouts.reduce((acc, val) => acc + val, 0n);
  const remainder = totalAmountRaw - distributed;
  if (remainder > 0n) {
    payouts[payouts.length - 1] = payouts[payouts.length - 1] + remainder;
  }
  return payouts;
}

export function parseTokenAmount(input: string, decimals: number): bigint | null {
  const clean = input.trim();
  if (!clean || !/^\d+(\.\d+)?$/.test(clean)) return null;
  const [wholePart, fracPart = ''] = clean.split('.');
  if (fracPart.length > decimals) {
    const truncated = fracPart.slice(0, decimals);
    const combined = `${wholePart}${truncated.padEnd(decimals, '0')}`;
    return BigInt(combined);
  }
  const combined = `${wholePart}${fracPart.padEnd(decimals, '0')}`;
  return BigInt(combined);
}

export function formatTokenAmount(
  amountRaw: bigint,
  decimals: number,
  maxFractionDigits = 4
): string {
  if (decimals === 0) return amountRaw.toString();
  const negative = amountRaw < 0n;
  const abs = negative ? -amountRaw : amountRaw;
  const divisor = 10n ** BigInt(decimals);
  const whole = abs / divisor;
  const frac = abs % divisor;

  const wholeFormatted = whole.toLocaleString('en-US');
  if (frac === 0n) {
    return `${negative ? '-' : ''}${wholeFormatted}`;
  }

  const fracPadded = frac.toString().padStart(decimals, '0');
  const sliced = fracPadded.slice(0, Math.min(decimals, maxFractionDigits)).replace(/0+$/, '');
  if (!sliced) {
    return `${negative ? '-' : ''}${wholeFormatted}`;
  }
  return `${negative ? '-' : ''}${wholeFormatted}.${sliced}`;
}
