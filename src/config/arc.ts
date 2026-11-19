import { defineChain, type Address } from 'viem';
import { isValidAddress } from '../lib/splitMath';

const DEFAULT_RPC_URL = 'https://rpc.testnet.arc.network';
const DEFAULT_EXPLORER_URL = 'https://testnet.arcscan.app';

export const ARC_RPC_URL =
  (import.meta.env.VITE_ARC_RPC_URL as string | undefined)?.trim() || DEFAULT_RPC_URL;

export const ARC_EXPLORER_URL =
  (import.meta.env.VITE_ARC_EXPLORER_URL as string | undefined)?.trim() || DEFAULT_EXPLORER_URL;

export const arcChain = defineChain({
  id: 5042002,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: ARC_EXPLORER_URL,
    },
  },
});

export interface SupportedToken {
  symbol: 'USDC' | 'EURC';
  name: string;
  address: Address;
}

export const SUPPORTED_TOKENS: SupportedToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x3600000000000000000000000000000000000000',
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
];

function sanitizeAddressEnv(raw?: string): Address | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('[')) return null;
  return isValidAddress(trimmed) ? (trimmed as Address) : null;
}

function sanitizeProjectIdEnv(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('[')) return null;
  return trimmed;
}

export const APP_CONFIG = {
  contractAddress: sanitizeAddressEnv(import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined),
  walletConnectProjectId: sanitizeProjectIdEnv(
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined
  ),
  adminWallet: sanitizeAddressEnv(import.meta.env.VITE_ADMIN_WALLET as string | undefined),
  explorerUrl: ARC_EXPLORER_URL.replace(/\/+$/, ''),
};

export function findTokenByAddress(address?: string | null): SupportedToken | undefined {
  if (!address) return undefined;
  const lower = address.toLowerCase();
  return SUPPORTED_TOKENS.find((t) => t.address.toLowerCase() === lower);
}

export function getExplorerTxUrl(txHash: string): string {
  return `${APP_CONFIG.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${APP_CONFIG.explorerUrl}/address/${address}`;
}
