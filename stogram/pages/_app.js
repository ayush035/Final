import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import Footer from '../components/Footer';
import { AppProps } from 'next/app';

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import { metis } from 'wagmi/chains'
import { getDefaultConfig, } from '@rainbow-me/rainbowkit'

// const MetisSepoliatestnet = {
//   id: 59902,
//   name: 'Metis Sepolia Testnet',

//   iconBackground: '#fff',
//   nativeCurrency: { name: 'tMetis', symbol: 'tMetis', decimals: 18 },
//   rpcUrls: {
//     default: { http: ['https://sepolia.metisdevops.link	'] },
//   },
//   blockExplorers: {
//     default: { name: 'Metis Sepolia Testnet explorer', url: 'https://sepolia-explorer.metisdevops.link' },
//   },
//   // contracts: {
//   //   multicall3: {
//   //     address: '0xca11bde05977b3631167028862be2a173976ca11',
//   //     blockCreated: 11907934,
//   //   },
//   }



const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '9c17dc69becbe137fe50e55e31598852',
  chains: [metis],
  transports: {
    [metis.id]: http(),
  },
})
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
<WagmiProvider config={config}>
<QueryClientProvider  client={queryClient}>
        <RainbowKitProvider 
        initialChain={4}
        theme={darkTheme({
          accentColor: '#fffff',
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
      </QueryClientProvider>
      </WagmiProvider>

    );
}

export default MyApp;
