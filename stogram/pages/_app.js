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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, http } from 'wagmi'
import { mainnet, zetachain, zksync, arbitrum } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

 



const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '9c17dc69becbe137fe50e55e31598852',
  chains: [zetachain, zksync, arbitrum],
  transports: {
    [arbitrum.id]: http(),
    [zetachain.id]: http(),

  },
})
const queryClient = new QueryClient()




function MyApp({ Component, pageProps }) {
  return (
<WagmiProvider config={config}>
<QueryClientProvider client={queryClient}>
        <RainbowKitProvider
        
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
      </QueryClientProvider>
      </WagmiProvider>

    );
}

export default MyApp;
