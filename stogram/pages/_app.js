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
import { Analytics } from '@vercel/analytics/next';
 
const CitreaTestnet = {
  id: 5115,
  name: 'Citrea Testnet',

  iconBackground: '#fff',
  nativeCurrency: { name: 'CBTC', symbol: 'CBTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz	'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Testnet explorer', url: 'https://explorer.testnet.citrea.xyz/' },
  },
  // contracts: {
  //   multicall3: {
  //     address: '0xca11bde05977b3631167028862be2a173976ca11',
  //     blockCreated: 11907934,
  //   },
  }



const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '9174d135ff3ead793285d03479e4d37c',
  chains: [CitreaTestnet],
  transports: {
    [CitreaTestnet.id]: http(),
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
            <Analytics />
            

          </div>

          <Footer />
        </div>
      </RainbowKitProvider>
      </QueryClientProvider>
      </WagmiProvider>

    );
}

export default MyApp;
