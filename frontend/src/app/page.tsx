'use client'

import React, { useState } from 'react'
import { useAutoSplit, AutoSplitProvider } from '@/components/AutoSplitProvider'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SplitIcon, PlusIcon, TrashIcon, VaultIcon } from '@/components/icons'

const AutoSplitProvider = ({ children }: { children: React.ReactNode }) => {
  return <AutoSplitProvider>{children}</AutoSplitProvider>
}

const useAutoSplit = () => {
  const context = React.useContext(AutoSplitProvider)
  if (!context) {
    throw new Error('useAutoSplit must be used within AutoSplitProvider')
  }
  return context
}

const AutoSplitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splits, setSplits] = useState<{ recipient: string; percent: number; isVault: boolean }[]>([
    { recipient: '', percent: 50, isVault: false },
    { recipient: '', percent: 50, isVault: false }
  ])
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('USDC')

  const updateSplit = (index: number, field: string, value: any) => {
    const newSplits = splits.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    if (field === 'percent') {
      const total = newSplits.reduce((sum, s) => sum + Number(s.percent || 0), 0)
      if (total !== 100) {
        const othersTotal = newSplits.reduce((sum, s, i2) => sum + (i2 === index ? 0 : Number(s.percent || 0)), 0)
        newSplits[index].percent = Math.max(0, 100 - othersTotal)
      }
    }
    setSplits(newSplits)
  }

  const addSplit = () => {
    if (splits.length < 10) {
      setSplits([...splits, { recipient: '', percent: 0, isVault: false }])
    }
  }

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      const newSplits = splits.filter((_, i) => i !== index)
      const remainingPercent = 100 - newSplits.reduce((sum, s) => sum + Number(s.percent || 0), 0)
      const perSplit = Math.floor(remainingPercent / newSplits.length)
      const remainder = remainingPercent % newSplits.length
      newSplits.forEach((s, i) => {
        s.percent = perSplit + (i < remainder ? 1 : 0)
      })
      setSplits(newSplits)
    }
  }

  const totalPercent = splits.reduce((sum, s) => sum + Number(s.percent || 0), 0)

  return (
    <AutoSplitProvider.Provider value={{ splits, setSplits, amount, setAmount, token, setToken, updateSplit, addSplit, removeSplit, totalPercent }}>
      {children}
    </AutoSplitProvider.Provider>
  )
}

const SplitRow: React.FC<{ index: number }> = ({ index }) => {
  const { splits, updateSplit, removeSplit } = useAutoSplit()
  const split = splits[index]

  return (
    <Card className="glass-card p-4 border-[var(--color-border)] mb-3 group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm text-[var(--color-muted)]">Route {index + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeSplit(index)}
          disabled={splits.length <= 1}
          className="text-[var(--color-secondary)] disabled:opacity-50 h-auto p-1"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
      <Input
        placeholder="0x... or name"
        value={split.recipient}
        onChange={(e) => updateSplit(index, 'recipient', e.target.value)}
        className="bg-[#0D2A24] border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] rounded-lg px-3 py-2 mb-3"
      />
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={0}
          max={100}
          value={split.percent}
          onChange={(e) => updateSplit(index, 'percent', e.target.value)}
          className="w-20 bg-[#0D2A24] border-[var(--color-border)] text-white text-center focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] rounded-lg px-3 py-2"
        />
        <span className="text-[var(--color-muted)] text-sm">%</span>
        <label className="flex items-center gap-2 ml-auto text-sm">
          <input
            type="checkbox"
            checked={split.isVault}
            onChange={(e) => updateSplit(index, 'isVault', e.target.checked)}
            className="rounded border-[var(--color-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-[var(--color-muted)]">Vault</span>
        </label>
      </div>
      {split.recipient && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted)]">Amount</span>
            <span className="text-white">{((Number(amount) || 0) * Number(split.percent) / 100).toFixed(2)} {token}</span>
          </div>
        </div>
      )}
    </Card>
  )
}

const Icons = {
  Split: SplitIcon,
  Plus: PlusIcon,
  Trash: TrashIcon,
  Vault: VaultIcon
}

export default function Home() {
  return (
    <AutoSplitProvider>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] font-sans">
        <Navbar />
        <main className="max-w-2xl mx-auto p-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--color-primary)]/30">
              <Icons.Split className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">AutoSplit</h1>
            <p className="text-[var(--color-muted)] text-sm">Send once. Split automatically on Celo.</p>
          </div>

          {/* Token Input Card */}
          <Card className="glass-card p-6 mb-6 border-[var(--color-border)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Amount & Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-[#0D2A24] border-[var(--color-border)] text-xl text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] rounded-lg px-4 py-3"
                />
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger className="bg-[#0D2A24] border-[var(--color-border)] text-white px-4 py-3 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] w-[120px]">
                    <SelectValue placeholder="Token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="cUSD">cUSD</SelectItem>
                    <SelectItem value="DAI">DAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Split Rules */}
          <Card className="glass-card p-6 mb-6 border-[var(--color-border)]">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-lg font-semibold">Split Routes</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addSplit}
                  disabled={splits.length >= 10}
                  className="text-[var(--color-secondary)] disabled:opacity-50 h-auto p-2"
                >
                  <Icons.Plus className="w-4 h-4" />
                  Add route
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {splits.map((_, index) => (
                <SplitRow key={index} index={index} />
              ))}
            </CardContent>
          </Card>

          {/* Progress Summary */}
          {amount && totalPercent === 100 && (
            <Card className="glass-card p-6 mb-6 border-[var(--color-border)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold mb-3">Distribution Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {splits.map((split, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${split.isVault ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]'}`}></div>
                      <span className="text-sm text-[var(--color-text)]">
                        {split.recipient ? split.recipient.slice(0, 6) + '...' + split.recipient.slice(-4) : 'No address'}
                      </span>
                    </div>
                    <span className="text-white font-medium">{((Number(amount) || 0) * Number(split.percent) / 100).toFixed(2)} {token}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-sm text-[var(--color-muted)] font-medium">Total</span>
                  <span className="text-[var(--color-primary)] font-bold">{totalPercent}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execute Button */}
          <Button
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${totalPercent === 100 ? 'btn-gradient text-white shadow-lg shadow-[var(--color-primary)]/20' : 'bg-[#1A1A1A] text-[var(--color-muted)] cursor-not-allowed'}`}
            disabled={!amount || totalPercent !== 100}
          >
            {amount && totalPercent === 100 ? 'Execute Split' : 'Complete setup to continue'}
          </Button>

          {/* Info */}
          <div className="mt-6 text-center text-xs text-[var(--color-muted)]">
            <p>One transaction. Multiple outcomes.</p>
            <p className="mt-1">Split stablecoins across recipients & vaults instantly on Celo.</p>
          </div>
        </main>
      </div>
    </AutoSplitProvider>
  )
}

// Re-export for use elsewhere
export const useAutoSplit = () => {
  const context = React.useContext(AutoSplitProvider)
  if (!context) throw new Error('useAutoSplit must be used within AutoSplitProvider')
  return context
}