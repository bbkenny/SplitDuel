'use client'

import React from 'react'
import { AutoSplitProvider, useAutoSplit } from '@/components/AutoSplitProvider'
import Navbar from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function Home() {
  const { splits, amount, setAmount, updateSplit, addSplit, removeSplit, totalBasisPoints, isReady } = useAutoSplit()

  return (
    <AutoSplitProvider>
      <div className="min-h-screen bg-[#022D2B] text-white font-sans p-6 pt-28">
        <Navbar />
        <main className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tight uppercase">Automated Routing</h1>
            <p className="text-emerald-400/70">One transaction → Multiple financial outcomes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rule Builder */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-3xl p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Split Rules
                </h2>
                <button 
                  onClick={addSplit}
                  className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-4 rounded-full transition-all"
                >
                  + ADD RECIPIENT
                </button>
              </div>

              <div className="space-y-4">
                {splits.map((s, i) => (
                  <div key={i} className="flex gap-4 items-end animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase">Recipient Address</label>
                      <input 
                        type="text" 
                        value={s.recipient}
                        onChange={(e) => updateSplit(i, 'recipient', e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[10px] font-bold text-white/40 uppercase">BPS (%)</label>
                      <input 
                        type="number" 
                        value={s.basisPoints}
                        onChange={(e) => updateSplit(i, 'basisPoints', Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => removeSplit(i)}
                      className="p-3 text-white/20 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Allocation</span>
                <span className={`text-lg font-mono font-bold ${totalBasisPoints === 10000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(totalBasisPoints / 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Execution Card */}
            <div className="bg-emerald-400 text-black rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase leading-tight italic">Ready to<br />Route?</h2>
                <p className="text-sm font-medium opacity-70">Define your rules on the left and input the total amount you want to split across your destinations.</p>
              </div>

              <div className="space-y-6 mt-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Split Amount (cUSD)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/20 border-2 border-black/10 rounded-2xl px-6 py-4 text-2xl font-black placeholder:text-black/20 focus:outline-none focus:border-black"
                  />
                </div>

                <button 
                  disabled={!isReady || !amount}
                  className="w-full bg-black text-emerald-400 font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  EXECUTE TRANSACTION
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AutoSplitProvider>
  )
}
