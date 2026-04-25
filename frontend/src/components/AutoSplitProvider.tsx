import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SplitState {
  splits: { recipient: string; percent: number; isVault: boolean }[]
  amount: string
  token: string
  setAmount: (value: string) => void
  setToken: (value: string) => void
  updateSplit: (index: number, field: string, value: any) => void
  addSplit: () => void
  removeSplit: (index: number) => void
  totalPercent: number
}

const AutoSplitContext = createContext<SplitState | undefined>(undefined)

export const AutoSplitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const value: SplitState = {
    splits,
    amount,
    token,
    setAmount,
    setToken,
    updateSplit,
    addSplit,
    removeSplit,
    totalPercent
  }

  return (
    <AutoSplitContext.Provider value={value}>
      {children}
    </AutoSplitContext.Provider>
  )
}

export const useAutoSplit = (): SplitState => {
  const context = useContext(AutoSplitContext)
  if (!context) {
    throw new Error('useAutoSplit must be used within AutoSplitProvider')
  }
  return context
}

// Re-export for convenience
export type { SplitState }