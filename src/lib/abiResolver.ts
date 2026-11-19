import type { Abi, AbiFunction } from 'viem';

export type ContractRole =
  | 'createSplit'
  | 'updateShares'
  | 'paySplit'
  | 'getSplit'
  | 'getSplitsByOwner'
  | 'getPaymentsBySplit'
  | 'getPlatformStats'
  | 'splitCount';

const ROLE_NAME_CANDIDATES: Record<ContractRole, string[]> = {
  createSplit: ['createSplit', 'newSplit', 'create'],
  updateShares: ['updateShares', 'updateSplitShares', 'setShares', 'updateSplit'],
  paySplit: ['paySplit', 'pay', 'distribute', 'fundSplit', 'sendPayment'],
  getSplit: ['getSplit', 'splits', 'getSplitDetails', 'splitInfo'],
  getSplitsByOwner: ['getSplitsByOwner', 'getOwnerSplits', 'splitsByOwner', 'getSplitsOf'],
  getPaymentsBySplit: [
    'getPaymentsBySplit',
    'getSplitPayments',
    'paymentsBySplit',
    'getPaymentHistory',
    'splitPayments',
  ],
  getPlatformStats: [
    'getPlatformStats',
    'getStats',
    'platformStats',
    'stats',
    'getTotals',
  ],
  splitCount: ['splitCount', 'totalSplits', 'nextSplitId', 'getSplitCount'],
};

export function extractFunctionEntries(abi: Abi): AbiFunction[] {
  return abi.filter((item): item is AbiFunction => item.type === 'function');
}

export function resolveContractFunction(abi: Abi, role: ContractRole): AbiFunction | null {
  const functions = extractFunctionEntries(abi);
  const candidates = ROLE_NAME_CANDIDATES[role];

  for (const candidate of candidates) {
    const exact = functions.find((fn) => fn.name === candidate);
    if (exact) return exact;
  }

  for (const candidate of candidates) {
    const lowerCandidate = candidate.toLowerCase();
    const caseInsensitive = functions.find((fn) => fn.name.toLowerCase() === lowerCandidate);
    if (caseInsensitive) return caseInsensitive;
  }

  return null;
}

export function parseExplorerAbiResponse(payload: unknown): Abi | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.abi) && record.abi.length > 0) {
    return record.abi as Abi;
  }

  if (Array.isArray(record.implementations) && record.implementations.length > 0) {
    for (const impl of record.implementations) {
      if (impl && typeof impl === 'object' && Array.isArray((impl as Record<string, unknown>).abi)) {
        const implAbi = (impl as Record<string, unknown>).abi as Abi;
        if (implAbi.length > 0) return implAbi;
      }
    }
  }

  if (typeof record.result === 'string') {
    try {
      const parsed = JSON.parse(record.result);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Abi;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function fetchDeployedContractAbi(
  contractAddress: string,
  explorerBaseUrl: string
): Promise<Abi | null> {
  const cleanAddress = contractAddress.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    return null;
  }

  const normalizedBase = explorerBaseUrl.replace(/\/+$/, '');
  const v2Url = `${normalizedBase}/api/v2/smart-contracts/${cleanAddress}`;

  const response = await fetch(v2Url, {
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    const json = await response.json();
    const abi = parseExplorerAbiResponse(json);
    if (abi) return abi;
  }

  // Fallback to Etherscan-compatible explorer query endpoint
  const legacyUrl = `${normalizedBase}/api?module=contract&action=getabi&address=${cleanAddress}`;
  const legacyResp = await fetch(legacyUrl, {
    headers: { Accept: 'application/json' },
  });

  if (legacyResp.ok) {
    const json = await legacyResp.json();
    const abi = parseExplorerAbiResponse(json);
    if (abi) return abi;
  }

  return null;
}
