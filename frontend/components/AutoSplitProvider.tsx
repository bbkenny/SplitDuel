import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SplitState {
  splits: { recipient: string; basisPoints: number; isVault: boolean }[]
  amount: string
  token: string
  setAmount: (value: string) => void
  setToken: (value: string) => void
  updateSplit: (index: number, field: string, value: any) => void
  addSplit: () => void
  removeSplit: (index: number) => void
  totalBasisPoints: number
  isReady: boolean
}

const AutoSplitContext = createContext<SplitState | undefined>(undefined)

export const AutoSplitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [splits, setSplits] = useState<{ recipient: string; basisPoints: number; isVault: boolean }[]>([
    { recipient: '', basisPoints: 5000, isVault: false },
    { recipient: '', basisPoints: 5000, isVault: false }
  ])
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('cUSD')

  const updateSplit = (index: number, field: string, value: any) => {
    const newSplits = [...splits]
    newSplits[index] = { ...newSplits[index], [field]: value }
    setSplits(newSplits)
  }

  const addSplit = () => {
    if (splits.length < 10) setSplits([...splits, { recipient: '', basisPoints: 0, isVault: false }])
  }

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index))
    }
  }

  const totalBasisPoints = splits.reduce((sum, s) => sum + Number(s.basisPoints || 0), 0)
  const isReady = totalBasisPoints === 10000 && splits.every(s => s.recipient.startsWith('0x'))

  const value: SplitState = {
    splits,
    amount,
    token,
    setAmount,
    setToken,
    updateSplit,
    addSplit,
    removeSplit,
    totalBasisPoints,
    isReady
  }

  return <AutoSplitContext.Provider value={value}>{children}</AutoSplitContext.Provider>
}

export const useAutoSplit = (): SplitState => {
  const context = useContext(AutoSplitContext)
  if (!context) throw new Error('useAutoSplit must be used within AutoSplitProvider')
  return context
}
