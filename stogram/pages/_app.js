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
import { metis, arbitrum } from 'wagmi/chains'
import { getDefaultConfig, } from '@rainbow-me/rainbowkit'
import { Analytics } from '@vercel/analytics/next';
 
const OgTestnet = {
  id: 16661,
  name: '0g Mainnet',

  iconBackground: '#fff',
  nativeCurrency: { name: '0g', symbol: '0g', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai	'] },
  }}
  



const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '9174d135ff3ead793285d03479e4d37c',
  chains: [OgTestnet],
  transports: {
    [OgTestnet.id]: http(),
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
