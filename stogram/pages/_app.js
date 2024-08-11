import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import Footer from '../components/Footer';
import { AppProps } from 'next/app';

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { zkSync, goerli, arbitrum}  from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { http } from 'viem';


 const zetachaintestnet = {
  id: 7001,
  name: 'Zetachain Testnet',
  network: 'zetachain-testnet',
  nativeCurrency: {
    name: 'ZETA',
    symbol: 'Zeta',
    decimals: 18,
  },
  rpcUrls: {
    default: {http: ['https://zeta-chain-testnet.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Custom Explorer',
      url: 'https://custom-explorer.com',
    },
  },
  testnet: true, // Indicate that this is a testnet
};

const { chains, publicClient, webSocketPublicClient, provider } = configureChains(
  [
    zkSync,
    arbitrum,
   
    // zetachaintestnet,

    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http,
      }),
    }),

  publicProvider(),
  ]
);

const projectId = '9c17dc69becbe137fe50e55e31598852';

const { wallets } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'Rainbowkit Demo',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        appInfo={demoAppInfo}
        chains={chains}
        theme={lightTheme({
          accentColor: '#FF69B4',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}
      >
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
