import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { arcChain } from '../config/arc';
import { RippleButton } from './RippleButton';

interface WalletGateProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function WalletGate({
  title = 'Connect your wallet to continue',
  description = 'Connect an Arc compatible wallet to view your splits and sign transactions directly on chain.',
  children,
}: WalletGateProps) {
  const { isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return (
      <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-8 sm:p-12 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#0B4F5C] text-[#6FD6B5] flex items-center justify-center mx-auto mb-5">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-semibold text-[#0B4F5C] mb-3">{title}</h2>
        <p className="text-[15px] text-[#5B7480] mb-7 leading-relaxed">{description}</p>
        <RippleButton variant="primary" onClick={() => openConnectModal?.()}>
          Connect Wallet
        </RippleButton>
      </div>
    );
  }

  if (chainId !== arcChain.id) {
    return (
      <div className="treasury-card bg-[#F6E9D2] border border-[#5B7480]/20 p-8 sm:p-12 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-[#0B4F5C] mb-3">Switch network to Arc</h2>
        <p className="text-[15px] text-[#5B7480] mb-7 leading-relaxed">
          Your wallet is connected to another network. Switch to Arc to manage and settle splits.
        </p>
        <RippleButton
          variant="primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: arcChain.id })}
        >
          {isSwitching ? 'Switching network...' : 'Switch to Arc'}
        </RippleButton>
      </div>
    );
  }

  return <>{children}</>;
}
