'use client'

import React from 'react'
import { useAutoSplit } from '@/components/AutoSplitProvider'
import { Footer } from '@/components/Footer'
import { Shield, Zap, History, Clock, ArrowRight, Coins, Scale } from 'lucide-react'

export default function Home() {
  const { 
    splits, amount, setAmount, token, setToken, 
    updateSplit, addSplit, removeSplit, 
    totalBasisPoints, isReady, history,
    loading, saveOnChainRules, executeRoutePayment
  } = useAutoSplit()

  return (
    <div className="min-h-screen bg-[#022D2B] text-white font-sans p-6 pt-28">
      <main className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" /> AutoSplit Protocol v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase italic leading-[0.9]">
            PRECISION <span className="text-emerald-400">ROUTING.</span>
          </h1>
          <p className="text-emerald-400/50 font-bold uppercase text-sm tracking-wide">
            Automate your financial behavior on Celo with immutable split rules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Rule Builder (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-8 border-white/5 space-y-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
               
               <div className="flex justify-between items-center relative z-10">
                 <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   Split Configuration
                 </h2>
                 <div className="flex gap-2">
                   <button 
                     onClick={saveOnChainRules}
                     disabled={loading || !isReady}
                     className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black py-2.5 px-6 rounded-xl transition-all disabled:opacity-40"
                   >
                     {loading ? "SAVING..." : "SAVE ON-CHAIN"}
                   </button>
                   <button 
                     onClick={addSplit}
                     className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(47,208,122,0.2)]"
                   >
                     + ADD DESTINATION
                   </button>
                 </div>
               </div>

               <div className="space-y-6 relative z-10">
                 {splits.map((s, i) => (
                   <div key={i} className="group flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                     <div className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Recipient / Vault Address</label>
                          <input 
                            type="text" 
                            value={s.recipient}
                            onChange={(e) => updateSplit(i, 'recipient', e.target.value)}
                            placeholder="0x..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="w-28 space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Share (%)</label>
                          <input 
                            type="number" 
                            value={s.basisPoints / 100}
                            onChange={(e) => updateSplit(i, 'basisPoints', Number(e.target.value) * 100)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-black focus:border-emerald-500 focus:outline-none transition-all text-center"
                          />
                        </div>
                        <button 
                          onClick={() => removeSplit(i)}
                          className="mt-8 p-2 text-white/10 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                     </div>
                     
                     <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={s.isVault} 
                              onChange={(e) => updateSplit(i, 'isVault', e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500/50"></div>
                          </label>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${s.isVault ? 'text-emerald-400' : 'text-white/20'}`}>
                            {s.isVault ? 'ROUTING TO YIELD VAULT' : 'DIRECT TRANSFER'}
                          </span>
                        </div>
                        {s.isVault && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500/50 italic">
                            <Shield className="w-3 h-3" /> Protected by VaultAdapter
                          </div>
                        )}
                     </div>
                   </div>
                 ))}
               </div>

               <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                 <div>
                   <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Allocation</span>
                   <p className="text-xs font-bold text-emerald-500/50 uppercase mt-1">Must sum to 100%</p>
                 </div>
                 <div className="text-right">
                   <span className={`text-3xl font-black font-mono ${totalBasisPoints === 10000 ? 'text-emerald-400' : 'text-red-400'} drop-shadow-[0_0_10px_currentColor]`}>
                     {(totalBasisPoints / 100).toFixed(0)}%
                   </span>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT: Execution & History (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Execution Card */}
            <div className="bg-emerald-400 text-black rounded-3xl p-8 space-y-8 shadow-[0_20px_50px_rgba(47,208,122,0.1)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Scale className="w-24 h-24 rotate-12" />
               </div>
               
               <div className="space-y-4 relative z-10">
                 <h2 className="text-3xl font-black uppercase italic leading-[0.8]">EXECUTE<br />ROUTING.</h2>
                 <p className="text-xs font-bold opacity-70 uppercase leading-relaxed tracking-tight">Deploy your assets across the defined destination matrix in a single atomic transaction.</p>
               </div>

               <div className="space-y-6 relative z-10">
                 <div className="grid grid-cols-2 gap-3">
                   {['cUSD', 'CELO'].map(t => (
                     <button 
                       key={t}
                       onClick={() => setToken(t)}
                       className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${token === t ? 'bg-black text-emerald-400 border-black' : 'bg-transparent border-black/10 text-black/40 hover:bg-black/5'}`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>

                 <div className="space-y-3">
                   <label className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                     <Coins className="w-3 h-3" /> Input Amount ({token})
                   </label>
                   <input 
                     type="number" 
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     placeholder="0.00"
                     className="w-full bg-white/20 border-2 border-black/10 rounded-2xl px-6 py-5 text-4xl font-black placeholder:text-black/10 focus:outline-none focus:border-black transition-all"
                   />
                 </div>

                  <button 
                    onClick={executeRoutePayment}
                    disabled={!isReady || !amount || loading}
                    className="w-full bg-black text-emerald-400 font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-20 disabled:pointer-events-none group shadow-2xl"
                  >
                    <Shield className="w-5 h-5" />
                    {loading ? "ROUTING PAYMENTS..." : "INITIATE AUTO-SPLIT"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>

            {/* History Section */}
            <div className="glass-card p-8 border-white/5 space-y-6">
               <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white/50">
                 <History className="w-4 h-4" /> Activity Log
               </h2>
               
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {history.length === 0 ? (
                   <div className="py-12 text-center space-y-3 opacity-20">
                     <Clock className="w-10 h-10 mx-auto" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No recent transactions</p>
                   </div>
                 ) : (
                   history.map((tx, idx) => (
                     <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-emerald-400">{tx.amount} {tx.token}</span>
                         <span className="text-[8px] font-bold text-white/20">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                       </div>
                       <div className="flex flex-wrap gap-1.5">
                         {tx.recipients.map((r, i) => (
                           <div key={i} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/40">
                             {r.slice(0,6)}...{r.slice(-4)}
                           </div>
                         ))}
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
