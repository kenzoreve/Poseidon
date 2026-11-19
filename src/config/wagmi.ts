import { connectorsForWallets, lightTheme } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { APP_CONFIG, ARC_RPC_URL, arcChain } from './arc';

const connectors = APP_CONFIG.walletConnectProjectId
  ? connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [injectedWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet],
        },
      ],
      {
        appName: 'Poseidon',
        projectId: APP_CONFIG.walletConnectProjectId,
      }
    )
  : connectorsForWallets(
      [
        {
          groupName: 'Browser Wallets',
          wallets: [injectedWallet],
        },
      ],
      {
        appName: 'Poseidon',
        projectId: '00000000000000000000000000000000',
      }
    );

export const wagmiConfig = createConfig({
  chains: [arcChain],
  connectors,
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: false,
});

export const poseidonRainbowTheme = lightTheme({
  accentColor: '#0B4F5C',
  accentColorForeground: '#FFFDF8',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

poseidonRainbowTheme.colors.modalBackground = '#FFFDF8';
poseidonRainbowTheme.colors.modalText = '#0B4F5C';
poseidonRainbowTheme.colors.modalTextSecondary = '#5B7480';
poseidonRainbowTheme.colors.profileForeground = '#F6E9D2';
poseidonRainbowTheme.colors.connectButtonBackground = '#6FD6B5';
poseidonRainbowTheme.colors.connectButtonText = '#0B4F5C';
poseidonRainbowTheme.fonts.body = '"Plus Jakarta Sans", sans-serif';
