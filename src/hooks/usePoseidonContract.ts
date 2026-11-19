import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { erc20Abi, type Abi, type Address, type Hash } from 'viem';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { APP_CONFIG, arcChain, findTokenByAddress } from '../config/arc';
import {
  fetchDeployedContractAbi,
  resolveContractFunction,
  type ContractRole,
} from '../lib/abiResolver';

export interface SplitData {
  id: bigint;
  name: string;
  owner: Address;
  token: Address;
  recipients: Address[];
  sharesBps: bigint[];
  totalPaid: bigint;
  paymentCount: bigint;
  createdAt?: bigint;
  active?: boolean;
}

export interface SplitPaymentRecord {
  payer: Address;
  amount: bigint;
  timestamp: bigint;
  txHash?: Hash;
}

export interface PlatformStats {
  totalSplits: bigint;
  totalPayments: bigint;
  totalVolume: bigint;
}

export type TxLifecycleStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'error';

export interface TxLifecycleState {
  status: TxLifecycleStatus;
  hash?: Hash;
  error?: string;
}

function toBigIntSafe(val: unknown): bigint {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number' && Number.isFinite(val)) return BigInt(Math.trunc(val));
  if (typeof val === 'string' && /^\d+$/.test(val)) return BigInt(val);
  return 0n;
}

function normalizeSplitResult(raw: unknown, fallbackId?: bigint): SplitData | null {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const items = raw;
    if (items.length >= 6) {
      const hasLeadingId = typeof items[0] === 'bigint' || typeof items[0] === 'number';
      if (hasLeadingId && items.length >= 7) {
        return {
          id: toBigIntSafe(items[0]),
          name: String(items[1] ?? ''),
          owner: String(items[2]) as Address,
          token: String(items[3]) as Address,
          recipients: (items[4] as Address[]) ?? [],
          sharesBps: ((items[5] as unknown[]) ?? []).map(toBigIntSafe),
          totalPaid: toBigIntSafe(items[6]),
          paymentCount: toBigIntSafe(items[7] ?? 0),
          createdAt: items[8] !== undefined ? toBigIntSafe(items[8]) : undefined,
        };
      }
      return {
        id: fallbackId ?? 0n,
        name: String(items[0] ?? ''),
        owner: String(items[1]) as Address,
        token: String(items[2]) as Address,
        recipients: (items[3] as Address[]) ?? [],
        sharesBps: ((items[4] as unknown[]) ?? []).map(toBigIntSafe),
        totalPaid: toBigIntSafe(items[5]),
        paymentCount: toBigIntSafe(items[6] ?? 0),
        createdAt: items[7] !== undefined ? toBigIntSafe(items[7]) : undefined,
      };
    }
    return null;
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const recipients = (obj.recipients ?? obj.payees ?? []) as Address[];
    const rawShares = (obj.shares ?? obj.sharesBps ?? obj.bps ?? []) as unknown[];
    if (!obj.owner && !obj.token && recipients.length === 0) {
      return null;
    }
    return {
      id:
        obj.id !== undefined
          ? toBigIntSafe(obj.id)
          : obj.splitId !== undefined
            ? toBigIntSafe(obj.splitId)
            : fallbackId ?? 0n,
      name: String(obj.name ?? obj.label ?? `Split #${(fallbackId ?? 0n).toString()}`),
      owner: String(obj.owner ?? obj.creator ?? '0x0000000000000000000000000000000000000000') as Address,
      token: String(obj.token ?? obj.currency ?? '0x0000000000000000000000000000000000000000') as Address,
      recipients,
      sharesBps: rawShares.map(toBigIntSafe),
      totalPaid: toBigIntSafe(obj.totalPaid ?? obj.totalReceived ?? obj.volume ?? 0),
      paymentCount: toBigIntSafe(obj.paymentCount ?? obj.paymentsCount ?? 0),
      createdAt: obj.createdAt !== undefined ? toBigIntSafe(obj.createdAt) : undefined,
      active: typeof obj.active === 'boolean' ? obj.active : true,
    };
  }

  return null;
}

function normalizePaymentList(raw: unknown): SplitPaymentRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): SplitPaymentRecord | null => {
      if (Array.isArray(item)) {
        return {
          payer: String(item[0]) as Address,
          amount: toBigIntSafe(item[1]),
          timestamp: toBigIntSafe(item[2] ?? 0),
          txHash: typeof item[3] === 'string' && item[3].startsWith('0x') ? (item[3] as Hash) : undefined,
        };
      }
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>;
        return {
          payer: String(rec.payer ?? rec.sender ?? rec.from ?? '0x0000000000000000000000000000000000000000') as Address,
          amount: toBigIntSafe(rec.amount ?? rec.value ?? 0),
          timestamp: toBigIntSafe(rec.timestamp ?? rec.paidAt ?? 0),
          txHash: typeof rec.txHash === 'string' ? (rec.txHash as Hash) : undefined,
        };
      }
      return null;
    })
    .filter((x): x is SplitPaymentRecord => x !== null);
}

export function useContractAbi() {
  const contractAddress = APP_CONFIG.contractAddress;

  return useQuery<Abi | null>({
    queryKey: ['poseidon-abi', contractAddress],
    enabled: Boolean(contractAddress),
    staleTime: 1000 * 60 * 10,
    retry: 1,
    queryFn: async () => {
      if (!contractAddress) return null;
      return fetchDeployedContractAbi(contractAddress, APP_CONFIG.explorerUrl);
    },
  });
}

export function useTokenDetails(tokenAddress?: Address | null, ownerAddress?: Address) {
  const contractAddress = APP_CONFIG.contractAddress;
  const validToken = Boolean(tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress));
  const safeToken = (validToken && tokenAddress
    ? tokenAddress
    : '0x0000000000000000000000000000000000000000') as Address;
  const safeOwner = (ownerAddress ?? '0x0000000000000000000000000000000000000000') as Address;
  const safeSpender = (contractAddress ?? '0x0000000000000000000000000000000000000000') as Address;

  const decimalsQuery = useReadContract({
    address: safeToken,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: arcChain.id,
    query: { enabled: validToken },
  });

  const symbolQuery = useReadContract({
    address: safeToken,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId: arcChain.id,
    query: { enabled: validToken },
  });

  const balanceQuery = useReadContract({
    address: safeToken,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [safeOwner],
    chainId: arcChain.id,
    query: { enabled: validToken && Boolean(ownerAddress) },
  });

  const allowanceQuery = useReadContract({
    address: safeToken,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [safeOwner, safeSpender],
    chainId: arcChain.id,
    query: { enabled: validToken && Boolean(ownerAddress) && Boolean(contractAddress) },
  });

  const known = findTokenByAddress(tokenAddress);

  return {
    decimals: decimalsQuery.data !== undefined ? Number(decimalsQuery.data) : undefined,
    symbol: symbolQuery.data ?? known?.symbol,
    balance: balanceQuery.data,
    allowance: allowanceQuery.data,
    isLoading:
      decimalsQuery.isLoading ||
      symbolQuery.isLoading ||
      balanceQuery.isLoading ||
      allowanceQuery.isLoading,
    refetch: () => {
      decimalsQuery.refetch();
      symbolQuery.refetch();
      balanceQuery.refetch();
      allowanceQuery.refetch();
    },
  };
}

export function usePlatformStats() {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abi, isLoading: abiLoading, error: abiError } = useContractAbi();
  const contractAddress = APP_CONFIG.contractAddress;

  return useQuery<PlatformStats | null>({
    queryKey: ['poseidon-stats', contractAddress, Boolean(abi)],
    enabled: Boolean(contractAddress && abi && publicClient),
    queryFn: async () => {
      if (!contractAddress || !abi || !publicClient) return null;

      const statsFn = resolveContractFunction(abi, 'getPlatformStats');
      if (statsFn) {
        const res = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: statsFn.name,
        });
        if (Array.isArray(res)) {
          return {
            totalSplits: toBigIntSafe(res[0]),
            totalPayments: toBigIntSafe(res[1] ?? 0),
            totalVolume: toBigIntSafe(res[2] ?? 0),
          };
        }
        if (res && typeof res === 'object') {
          const obj = res as Record<string, unknown>;
          return {
            totalSplits: toBigIntSafe(obj.totalSplits ?? obj.splits ?? 0),
            totalPayments: toBigIntSafe(obj.totalPayments ?? obj.payments ?? 0),
            totalVolume: toBigIntSafe(obj.totalVolume ?? obj.volume ?? 0),
          };
        }
      }

      const countFn = resolveContractFunction(abi, 'splitCount');
      if (countFn) {
        const count = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: countFn.name,
        });
        return {
          totalSplits: toBigIntSafe(count),
          totalPayments: 0n,
          totalVolume: 0n,
        };
      }

      return null;
    },
    meta: { abiLoading, abiError },
  });
}

export function useOwnerSplits(owner?: Address) {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abi } = useContractAbi();
  const contractAddress = APP_CONFIG.contractAddress;

  return useQuery<SplitData[]>({
    queryKey: ['poseidon-owner-splits', contractAddress, owner, Boolean(abi)],
    enabled: Boolean(contractAddress && abi && owner && publicClient),
    queryFn: async () => {
      if (!contractAddress || !abi || !owner || !publicClient) return [];

      const byOwnerFn = resolveContractFunction(abi, 'getSplitsByOwner');
      const getSplitFn = resolveContractFunction(abi, 'getSplit');
      if (!byOwnerFn) return [];

      const raw = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: byOwnerFn.name,
        args: [owner],
      });

      if (!Array.isArray(raw)) return [];
      if (raw.length === 0) return [];

      // Either the contract returned an array of split IDs or an array of Split structs
      const first = raw[0];
      if (typeof first === 'bigint' || typeof first === 'number' || typeof first === 'string') {
        if (!getSplitFn) return [];
        const splitIds = raw.map(toBigIntSafe);
        const results = await Promise.all(
          splitIds.map(async (id) => {
            const detail = await publicClient.readContract({
              address: contractAddress,
              abi,
              functionName: getSplitFn.name,
              args: [id],
            });
            return normalizeSplitResult(detail, id);
          })
        );
        return results.filter((s): s is SplitData => s !== null);
      }

      return raw
        .map((item, idx) => normalizeSplitResult(item, BigInt(idx + 1)))
        .filter((s): s is SplitData => s !== null);
    },
  });
}

export function useSplitDetail(splitIdParam?: string) {
  const publicClient = usePublicClient({ chainId: arcChain.id });
  const { data: abi, isLoading: abiLoading } = useContractAbi();
  const contractAddress = APP_CONFIG.contractAddress;

  const validId = Boolean(splitIdParam && /^\d+$/.test(splitIdParam.trim()));
  const splitId = validId ? BigInt(splitIdParam!.trim()) : undefined;

  const splitQuery = useQuery<SplitData | null>({
    queryKey: ['poseidon-split', contractAddress, splitIdParam, Boolean(abi)],
    enabled: Boolean(contractAddress && abi && validId && splitId !== undefined && publicClient),
    queryFn: async () => {
      if (!contractAddress || !abi || splitId === undefined || !publicClient) return null;
      const getSplitFn = resolveContractFunction(abi, 'getSplit');
      if (!getSplitFn) return null;

      const raw = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: getSplitFn.name,
        args: [splitId],
      });

      return normalizeSplitResult(raw, splitId);
    },
  });

  const paymentsQuery = useQuery<SplitPaymentRecord[]>({
    queryKey: ['poseidon-split-payments', contractAddress, splitIdParam, Boolean(abi)],
    enabled: Boolean(contractAddress && abi && validId && splitId !== undefined && publicClient),
    queryFn: async () => {
      if (!contractAddress || !abi || splitId === undefined || !publicClient) return [];
      const paymentsFn = resolveContractFunction(abi, 'getPaymentsBySplit');
      if (!paymentsFn) return [];

      const raw = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: paymentsFn.name,
        args: [splitId],
      });

      return normalizePaymentList(raw);
    },
  });

  return {
    split: splitQuery.data ?? null,
    payments: paymentsQuery.data ?? [],
    isLoading: abiLoading || splitQuery.isLoading || paymentsQuery.isLoading,
    error: splitQuery.error || paymentsQuery.error,
    refetch: () => {
      splitQuery.refetch();
      paymentsQuery.refetch();
    },
  };
}

function formatContractError(err: unknown): string {
  if (!err) return 'Transaction failed';
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('user denied')) {
    return 'Transaction signature cancelled in wallet';
  }
  const shortLine = msg.split('\n')[0];
  return shortLine.length > 140 ? `${shortLine.slice(0, 140)}...` : shortLine;
}

export function usePoseidonTx(onConfirmed?: () => void) {
  const queryClient = useQueryClient();
  const { data: abi } = useContractAbi();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [txState, setTxState] = useState<TxLifecycleState>({ status: 'idle' });

  const receiptQuery = useWaitForTransactionReceipt({
    hash: txState.hash,
    chainId: arcChain.id,
    query: {
      enabled: Boolean(txState.hash),
    },
  });

  useEffect(() => {
    if (receiptQuery.isSuccess && txState.status === 'confirming') {
      setTxState((prev) => ({ ...prev, status: 'confirmed' }));
      queryClient.invalidateQueries({ queryKey: ['poseidon-stats'] });
      queryClient.invalidateQueries({ queryKey: ['poseidon-owner-splits'] });
      queryClient.invalidateQueries({ queryKey: ['poseidon-split'] });
      queryClient.invalidateQueries({ queryKey: ['poseidon-split-payments'] });
      onConfirmed?.();
    } else if (receiptQuery.isError && txState.status === 'confirming') {
      setTxState((prev) => ({
        ...prev,
        status: 'error',
        error: formatContractError(receiptQuery.error),
      }));
    }
  }, [receiptQuery.isSuccess, receiptQuery.isError, receiptQuery.error, txState.status, queryClient, onConfirmed]);

  function resetTx() {
    setTxState({ status: 'idle' });
  }

  async function executeRoleWrite(role: ContractRole, args: unknown[]) {
    if (!APP_CONFIG.contractAddress) {
      setTxState({ status: 'error', error: 'Contract address is not configured' });
      return;
    }
    if (!abi) {
      setTxState({
        status: 'error',
        error: 'Contract ABI could not be loaded from Arc explorer',
      });
      return;
    }
    const fn = resolveContractFunction(abi, role);
    if (!fn) {
      setTxState({
        status: 'error',
        error: `Deployed contract ABI does not expose ${role}`,
      });
      return;
    }

    try {
      setTxState({ status: 'pending' });
      const hash = await writeContractAsync({
        address: APP_CONFIG.contractAddress,
        abi,
        functionName: fn.name,
        args,
        chainId: arcChain.id,
        account: address,
      });
      setTxState({ status: 'confirming', hash });
      return hash;
    } catch (err) {
      setTxState({ status: 'error', error: formatContractError(err) });
      return undefined;
    }
  }

  async function approveErc20(tokenAddress: Address, amountRaw: bigint) {
    if (!APP_CONFIG.contractAddress) {
      setTxState({ status: 'error', error: 'Contract address is not configured' });
      return;
    }
    try {
      setTxState({ status: 'pending' });
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [APP_CONFIG.contractAddress, amountRaw],
        chainId: arcChain.id,
        account: address,
      });
      setTxState({ status: 'confirming', hash });
      return hash;
    } catch (err) {
      setTxState({ status: 'error', error: formatContractError(err) });
      return undefined;
    }
  }

  return {
    txState,
    resetTx,
    createSplit: (name: string, token: Address, recipients: Address[], sharesBps: bigint[]) =>
      executeRoleWrite('createSplit', [name, token, recipients, sharesBps]),
    updateShares: (splitId: bigint, sharesBps: bigint[]) =>
      executeRoleWrite('updateShares', [splitId, sharesBps]),
    paySplit: (splitId: bigint, amountRaw: bigint) =>
      executeRoleWrite('paySplit', [splitId, amountRaw]),
    approveErc20,
  };
}
