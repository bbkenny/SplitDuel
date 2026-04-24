'use client'

import React, { useState } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('USDC')
  const [splits, setSplits] = useState([
    { recipient: '', percent: 50, isVault: false },
    { recipient: '', percent: 50, isVault: false }
  ])

  const updateSplit = (index: number, field: string, value: any) => {
    const newSplits = splits.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    )
    // Recalculate percentages if needed
    if (field === 'percent') {
      const total = newSplits.reduce((sum, s) => sum + Number(s.percent || 0), 0)
      if (total !== 100) {
        // Auto-adjust the changed one to make it 100
        const othersTotal = newSplits.reduce((sum, s, i2) => 
          sum + (i2 === index ? 0 : Number(s.percent || 0)), 0)
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
      // Redistribute
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
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            AutoSplit
          </h1>
          <p className="text-gray-400 mt-2">Send once. Split automatically.</p>
        </div>

        {/* Token Input Card */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <label className="text-sm text-gray-400 mb-2 block">Amount</label>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="USDC">USDC</option>
              <option value="cUSD">cUSD</option>
              <option value="DAI">DAI</option>
            </select>
          </div>
        </div>

        {/* Split Rules */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Split Routes</h2>
            <button
              onClick={addSplit}
              disabled={splits.length >= 10}
              className="text-sm text-emerald-400 disabled:text-gray-500"
            >
              + Add route
            </button>
          </div>

          <div className="space-y-3">
            {splits.map((split, index) => (
              <div key={index} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-gray-400">Route {index + 1}</span>
                  <button
                    onClick={() => removeSplit(index)}
                    disabled={splits.length <= 1}
                    className="text-red-400 hover:text-red-300 text-sm disabled:text-gray-600"
                  >
                    Remove
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="0x... or name"
                  value={split.recipient}
                  onChange={(e) => updateSplit(index, 'recipient', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={split.percent}
                    onChange={(e) => updateSplit(index, 'percent', e.target.value)}
                    className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                  <label className="flex items-center gap-2 ml-auto text-sm">
                    <input
                      type="checkbox"
                      checked={split.isVault}
                      onChange={(e) => updateSplit(index, 'isVault', e.target.checked)}
                      className="rounded border-gray-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-gray-400">Vault</span>
                  </label>
                </div>

                {split.recipient && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white">{((Number(amount) || 0) * Number(split.percent) / 100).toFixed(2)} {token}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`mt-4 pt-4 border-t ${totalPercent === 100 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total</span>
              <span className={`font-semibold ${totalPercent === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {amount && totalPercent === 100 && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">Distribution Preview</h2>
            <div className="space-y-2">
              {splits.map((split, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${split.isVault ? 'bg-emerald-500' : 'bg-teal-400'}`}></div>
                    <span className="text-sm text-gray-300">
                      {split.recipient ? split.recipient.slice(0, 6) + '...' + split.recipient.slice(-4) : 'No address'}
                    </span>
                  </div>
                  <span className="text-white font-medium">{((Number(amount) || 0) * Number(split.percent) / 100).toFixed(2)} {token}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
            amount && totalPercent === 100
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!amount || totalPercent !== 100}
        >
          {amount && totalPercent === 100 ? 'Execute Split' : 'Complete setup to continue'}
        </button>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>One transaction. Multiple outcomes.</p>
          <p className="mt-1">Split stablecoins across recipients & vaults instantly.</p>
        </div>
      </div>
    </div>
  )
}
