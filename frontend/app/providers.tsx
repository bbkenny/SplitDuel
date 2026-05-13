'use client'
import React, { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { celo, celoAlfajores } from '@reown/appkit/networks'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

const queryClient = new QueryClient()
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56816460394348a735c02450371424c'

const metadata = {
  name: 'AutoSplit',
  description: 'Automated payment routing protocol for stablecoins on Celo',
  url: 'https://auto-splits.vercel.app',
  icons: ['/autosplit-logo.png'],
}

const wagmiAdapter = new WagmiAdapter({
  networks: [celo, celoAlfajores],
  projectId,
  ssr: true,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, celoAlfajores],
  defaultNetwork: celo,
  projectId,
  metadata,
  features: {
    analytics: true,
    swaps: false,
    onramp: false,
  },
  themeMode: 'dark',
})

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
