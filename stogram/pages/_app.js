import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import Footer from '../components/Footer';
import  { AppProps } from 'next/app';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  midnightTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli, zkSync, zkSyncTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    
    arbitrum,
    zkSync,
    zkSyncTestnet,

    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const projectId = 'YOUR_PROJECT_ID';

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
      <RainbowKitProvider appInfo={demoAppInfo} 
      chains={chains}
      theme={lightTheme({
        accentColor: '#FF69B4',
        accentColorForeground: 'white',
        borderRadius: 'medium',})}>
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