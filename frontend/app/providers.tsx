'use client'

import React, { ReactNode } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, celo } from '@reown/appkit/networks'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

const queryClient = new QueryClient()
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56816460394348a735c02450371424c'

const metadata = {
  name: 'AutoSplit',
  description: 'Send once. Split automatically on Celo.',
  url: 'https://autosplit.celo',
  icons: ['/autosplit.svg']
}

const networks = [base, celo]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, celo],
  projectId,
  metadata,
  features: { analytics: true },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#2FD07A',
    '--w3m-color-mix': '#F4D935',
    '--w3m-background': '#031F1C',
    '--w3m-foreground': '#E6F2EF',
    '--w3m-muted': '#7FA9A3'
  }
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