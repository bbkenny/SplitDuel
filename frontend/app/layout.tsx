import { Metadata, Viewport } from 'next'
import { Web3Providers } from './providers'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'AutoSplit',
  description: 'Send once. Split automatically on Celo.',
}

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0a0a1a' }],
  width: 'device-width',
  initialScale: 1,
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Providers>
          <Navbar />
          <main>{children}</main>
        </Web3Providers>
      </body>
    </html>
  )
}