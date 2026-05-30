"use client";

import React, { useState } from "react";
import { useAutoSplit } from "@/components/AutoSplitProvider";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Zap,
  History,
  Clock,
  ArrowRight,
  Coins,
  Scale,
  Award,
  TrendingUp,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  SplitRuleSkeleton,
  HistoryListSkeleton,
} from "@/components/ui/SkeletonLoaders";

export default function Home() {
  const {
    splits,
    amount,
    setAmount,
    token,
    setToken,
    updateSplit,
    addSplit,
    removeSplit,
    totalBasisPoints,
    isReady,
    history,
    loading,
    saveOnChainRules,
    executeRoutePayment,
    balances,
    savingsBalance,
    reputationPoints,
    creditLimit,
    activeLoans,
    depositSavings,
    withdrawSavings,
    requestMicroLoan,
    repayLoan,
  } = useAutoSplit();

  // Local savings & borrowing inputs
  const [vaultAmount, setVaultAmount] = useState("");
  const [vaultToken, setVaultToken] = useState("cUSD");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [borrowToken, setBorrowToken] = useState("cUSD");

  // Determine Credit Tier
  const getCreditTier = () => {
    if (reputationPoints >= 50) return { name: "ELITE TIER", color: "text-emerald-400 border-emerald-400 bg-emerald-500/10" };
    if (reputationPoints >= 15) return { name: "GOLD TIER", color: "text-yellow-400 border-yellow-400 bg-yellow-500/10" };
    return { name: "BRONZE TIER", color: "text-blue-400 border-blue-400 bg-blue-500/10" };
  };
  const creditTier = getCreditTier();

  return (
    <div className="min-h-screen bg-[#022D2B] text-white font-sans p-4 sm:p-6 md:p-8 pt-24 sm:pt-28">
      <main className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3 animate-pulse" /> AutoSplit DeFi Credit Union v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase italic leading-[0.9]">
            AUTONOMOUS <span className="text-emerald-400">CREDIT.</span>
          </h1>
          <p className="text-emerald-400/50 font-bold uppercase text-sm tracking-wide">
            Automate split savings, farm reputational credit scores, and request micro-loans on Celo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Rule Builder & Credit Union (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Split Rules Matrix */}
            <div className="glass-card p-5 md:p-8 border-white/5 space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center relative z-10">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Split Routing Configurations
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={saveOnChainRules}
                    disabled={loading || !isReady}
                    className="flex-1 sm:flex-initial text-center justify-center text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black py-2.5 px-4 sm:px-6 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {loading ? "SAVING..." : "SAVE ON-CHAIN"}
                  </button>
                  <button
                    onClick={addSplit}
                    className="flex-1 sm:flex-initial text-center justify-center text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-4 sm:px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(47,208,122,0.2)] cursor-pointer"
                  >
                    + ADD DESTINATION
                  </button>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                {loading && splits.length === 0 ? (
                  <>
                    <SplitRuleSkeleton />
                    <SplitRuleSkeleton />
                  </>
                ) : (
                  splits.map((s, i) => (
                    <div
                      key={i}
                      className="group flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start">
                        <div className="flex-1 space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                            Recipient / Vault Address
                          </label>
                          <input
                            type="text"
                            value={s.recipient}
                            onChange={(e) =>
                              updateSplit(i, "recipient", e.target.value)
                            }
                            placeholder="0x..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="flex items-end gap-3 sm:w-auto">
                          <div className="flex-1 sm:w-28 space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block">
                              Share (%)
                            </label>
                            <input
                              type="number"
                              value={s.basisPoints / 100}
                              onChange={(e) =>
                                updateSplit(
                                  i,
                                  "basisPoints",
                                  Number(e.target.value) * 100,
                                )
                              }
                              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-black focus:border-emerald-500 focus:outline-none transition-all text-center"
                            />
                          </div>
                          <button
                            onClick={() => removeSplit(i)}
                            className="h-[46px] px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer"
                            title="Remove Destination"
                          >
                            <span className="sm:hidden">Remove</span>
                            <span>✕</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={s.isVault}
                              onChange={(e) =>
                                updateSplit(i, "isVault", e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/20 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500/50"></div>
                          </label>
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${s.isVault ? "text-emerald-400" : "text-white/20"}`}
                          >
                            {s.isVault
                              ? "ROUTING TO YIELD VAULT"
                              : "DIRECT TRANSFER"}
                          </span>
                        </div>
                        {s.isVault && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500/50 italic select-none">
                            <Shield className="w-3 h-3" /> Auto-Yield Compound Savings
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                <div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Total Allocation
                  </span>
                  <p className="text-xs font-bold text-emerald-500/50 uppercase mt-1">
                    Must sum to 100%
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-3xl font-black font-mono ${totalBasisPoints === 10000 ? "text-emerald-400" : "text-red-400"} drop-shadow-[0_0_10px_currentColor]`}
                  >
                    {(totalBasisPoints / 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* DEFI CREDIT UNION SUITE */}
            <div className="glass-card p-5 md:p-8 border-white/5 space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

              <h2 className="text-base sm:text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Landmark className="w-5 h-5 text-emerald-400" />
                DeFi Credit Union Suite
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reputation HUD */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                      Credit Reputation
                    </span>
                    <Award className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                      {reputationPoints}
                    </span>
                    <span className="text-xs font-bold text-white/40">PTS</span>
                  </div>
                  {/* Rating progress bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(reputationPoints * 2, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold text-white/20 uppercase">Bronze</span>
                      <span className={`text-[9px] font-black border px-2 py-0.5 rounded uppercase tracking-wider ${creditTier.color}`}>
                        {creditTier.name}
                      </span>
                      <span className="text-[8px] font-bold text-white/20 uppercase">Elite</span>
                    </div>
                  </div>
                </div>

                {/* Savings Growth Vault */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                      Growth Vault (Savings)
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-white/70">cUSD Savings</span>
                      <span className="text-sm font-black text-emerald-400">{savingsBalance.cUSD.toFixed(4)} cUSD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-white/70">CELO Savings</span>
                      <span className="text-sm font-black text-emerald-400">{savingsBalance.CELO.toFixed(4)} CELO</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Actions Terminal */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                  Vault Interactions (Compound 4.5% APY Yield)
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex gap-2">
                    <select
                      value={vaultToken}
                      onChange={(e) => setVaultToken(e.target.value)}
                      className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-emerald-400 focus:outline-none"
                    >
                      <option value="cUSD" className="bg-zinc-950">cUSD</option>
                      <option value="CELO" className="bg-zinc-950">CELO</option>
                    </select>
                    <input
                      type="number"
                      value={vaultAmount}
                      onChange={(e) => setVaultAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 min-w-0 bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-center"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        depositSavings(vaultToken, vaultAmount);
                        setVaultAmount("");
                      }}
                      disabled={!vaultAmount || loading}
                      className="flex-1 sm:flex-initial text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(47,208,122,0.15)] flex items-center gap-1 justify-center cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-black" strokeWidth={3} /> Deposit
                    </button>
                    <button
                      onClick={() => {
                        withdrawSavings(vaultToken, vaultAmount);
                        setVaultAmount("");
                      }}
                      disabled={!vaultAmount || loading}
                      className="flex-1 sm:flex-initial text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black py-2.5 px-5 rounded-xl transition-all flex items-center gap-1 justify-center cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} /> Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Micro-Credit Hub */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest block">
                    Micro-Credit Hub (Reputation-backed Lending)
                  </span>
                  <div className="text-[8px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest text-center select-none">
                    Limit: {creditLimit.cUSD.toFixed(1)} cUSD / {creditLimit.CELO.toFixed(1)} CELO
                  </div>
                </div>
                
                {/* Borrow Interface */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex gap-2">
                    <select
                      value={borrowToken}
                      onChange={(e) => setBorrowToken(e.target.value)}
                      className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs font-black text-emerald-400 focus:outline-none"
                    >
                      <option value="cUSD" className="bg-zinc-950">cUSD</option>
                      <option value="CELO" className="bg-zinc-950">CELO</option>
                    </select>
                    <input
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 min-w-0 bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none text-center"
                    />
                  </div>
                  <button
                    onClick={() => {
                      requestMicroLoan(borrowToken, borrowAmount);
                      setBorrowAmount("");
                    }}
                    disabled={!borrowAmount || loading}
                    className="w-full sm:w-auto text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(47,208,122,0.15)] flex items-center gap-1 justify-center cursor-pointer"
                  >
                    Request Microfinance Loan
                  </button>
                </div>

                {/* Active Loans Table */}
                {activeLoans.length > 0 && (
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">
                      Active Micro-Lending Overdrafts
                    </span>
                    <div className="space-y-2">
                      {activeLoans.map((loan, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3.5 rounded-xl bg-black/20 border border-white/5 text-xs font-mono"
                        >
                          <div>
                            <p className="font-black text-white uppercase tracking-tight text-[10px]">
                              Loan ID: #{loan.id} ({loan.principal} cUSD)
                            </p>
                            <p className="text-[9px] text-white/40 font-medium">
                              Interest: {loan.interest} cUSD • Approved & Disbursed
                            </p>
                          </div>
                          <button
                            onClick={() => repayLoan(loan.id, (loan.principal + loan.interest).toString())}
                            className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                          >
                            Repay {loan.principal + loan.interest} cUSD
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Execution & History (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Execution Card */}
            <div className="bg-emerald-400 text-black rounded-3xl p-5 md:p-8 space-y-8 shadow-[0_20px_50px_rgba(47,208,122,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Scale className="w-24 h-24 rotate-12" />
              </div>

              <div className="space-y-4 relative z-10">
                <h2 className="text-3xl font-black uppercase italic leading-[0.8]">
                  EXECUTE
                  <br />
                  ROUTING.
                </h2>
                <p className="text-xs font-bold opacity-70 uppercase leading-relaxed tracking-tight">
                  Split your assets across the defined matrix in a single atomic transaction.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  {["cUSD", "CELO"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setToken(t)}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 cursor-pointer ${token === t ? "bg-black text-emerald-400 border-black animate-float-alt" : "bg-transparent border-black/10 text-black/40 hover:bg-black/5"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-black/55 select-none">
                    <label className="flex items-center gap-2">
                      <Coins className="w-3 h-3" /> Input Amount ({token})
                    </label>
                    <button
                      type="button"
                      onClick={() => setAmount(balances[token as keyof typeof balances]?.toString() || "0")}
                      className="hover:underline font-bold tracking-normal text-[9px] transition-all cursor-pointer opacity-70 hover:opacity-100"
                      title="Use full balance"
                    >
                      Balance: {balances[token as keyof typeof balances]?.toFixed(4) || "0.0000"} {token}
                    </button>
                  </div>
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
                  className="w-full bg-black text-emerald-400 font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-20 disabled:pointer-events-none group shadow-2xl cursor-pointer"
                >
                  <Shield className="w-5 h-5" />
                  {loading ? "ROUTING PAYMENTS..." : "INITIATE AUTO-SPLIT"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* History Section */}
            <div className="glass-card p-5 md:p-8 border-white/5 space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-white/50">
                <History className="w-4 h-4" /> Activity Log
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading && history.length === 0 ? (
                  <HistoryListSkeleton count={4} />
                ) : history.length === 0 ? (
                  <div className="py-12 text-center space-y-3 opacity-20">
                    <Clock className="w-10 h-10 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      No recent transactions
                    </p>
                  </div>
                ) : (
                  history.map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-emerald-400">
                          {tx.amount} {tx.token}
                        </span>
                        <span className="text-[8px] font-bold text-white/20">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tx.recipients.map((r, i) => (
                          <div
                            key={i}
                            className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/40"
                          >
                            {r.slice(0, 6)}...{r.slice(-4)}
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
  );
}
