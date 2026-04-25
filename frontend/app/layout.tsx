import { Web3Providers } from './providers'
import { Navbar } from '@/components/Navbar'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Providers>
          <Navbar />
          <main>{children}</main>
        </Web3Providers>
      </body>
    </html>
  )
}