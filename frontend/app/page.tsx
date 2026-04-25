'use client'

import React, { useState } from 'react'
import { AutoSplitProvider } from '@/components/AutoSplitProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <AutoSplitProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Navbar />
        <main className="max-w-2xl mx-auto p-4">
          <h1 className="text-2xl font-bold">AutoSplit Miniapp</h1>
          <p className="text-muted-foreground mt-2">
            Coming soon — the contract is deployed and verified on Celo.
          </p>
        </main>
        <Footer />
      </div>
    </AutoSplitProvider>
  )
}
