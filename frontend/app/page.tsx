'use client';

import React, { useState } from 'react';
import { useAutoSplit } from '@/components/AutoSplitProvider';
import { Footer } from '@/components/Footer';
import AdminPanel from '@/components/AdminPanel';
import { useReadContract, useAccount } from 'wagmi';
import { AutoSplitRouterABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import {
  Shield,
  Zap,
  History,
  Clock,
  ArrowRight,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Users,
} from 'lucide-react';
import {
  SplitRuleSkeleton,
  HistoryListSkeleton,
} from '@/components/ui/SkeletonLoaders';

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
    treasuryBalance,
    depositTreasury,
    withdrawTreasury,

    // Simulation & Stepper
    txStep,
    txError,
    txHash,
    txSimulation,
    txReset,
    txSimulatePayment,
  } = useAutoSplit();

  // Local states
  const [vaultAmount, setVaultAmount] = useState('');
  const [vaultToken, setVaultToken] = useState('cUSD');
  const [showModal, setShowModal] = useState(false);
  const [treasurySim, setTreasurySim] = useState<{
    action: 'deposit' | 'withdraw';
    token: string;
    amount: string;
    usdValue: string;
  } | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const { address } = useAccount();
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.celo.AUTO_SPLIT_ROUTER as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: 'owner',
  });

  const isAdmin = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  // Validation Checks
  const routeAmountNum = parseFloat(amount || '0');
  const routeBalance = token === 'cUSD' ? balances.cUSD : balances.CELO;
  const isRouteInsufficient = routeAmountNum > routeBalance;
  const isCeloGasLow = token === 'CELO' ? (balances.CELO - routeAmountNum < 0.005) : (balances.CELO < 0.005);

  const vaultAmountNum = parseFloat(vaultAmount || '0');
  const vaultBalance = vaultToken === 'cUSD' ? balances.cUSD : balances.CELO;
  const isDepositInsufficient = vaultAmountNum > vaultBalance;
  const isWithdrawInsufficient = vaultAmountNum > (vaultToken === 'cUSD' ? treasuryBalance.cUSD : treasuryBalance.CELO);

  // Action Handlers
  const handleRouteClick = async () => {
    if (isRouteInsufficient || !amount || isCeloGasLow) return;
    await txSimulatePayment(token, amount, splits);
    setModalTitle('Route Payment Simulation');
    setShowModal(true);
  };

  const handleSaveRulesClick = async () => {
    setModalTitle('Save Rules On-Chain');
    setShowModal(true);
    try {
      await saveOnChainRules();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDepositClick = () => {
    if (isDepositInsufficient || !vaultAmount) return;
    const rate = vaultToken === 'CELO' ? 0.62 : 1.00;
    const usd = (parseFloat(vaultAmount) * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setTreasurySim({
      action: 'deposit',
      token: vaultToken,
      amount: vaultAmount,
      usdValue: usd,
    });
    setModalTitle('Deposit to Shared Treasury');
    setShowModal(true);
  };

  const handleWithdrawClick = () => {
    if (isWithdrawInsufficient || !vaultAmount) return;
    const rate = vaultToken === 'CELO' ? 0.62 : 1.00;
    const usd = (parseFloat(vaultAmount) * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setTreasurySim({
      action: 'withdraw',
      token: vaultToken,
      amount: vaultAmount,
      usdValue: usd,
    });
    setModalTitle('Withdraw from Shared Treasury');
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#022D2B] text-white font-sans p-4 sm:p-6 md:p-8 pt-24 sm:pt-28">
      <main className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Building2 className="w-3 h-3 animate-pulse" /> Programmable Revenue Router
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase italic leading-[0.9]">
            AUTO<span className="text-emerald-400">SPLIT.</span>
          </h1>
          <p className="text-emerald-400/50 font-bold uppercase text-sm tracking-wide max-w-2xl mx-auto">
            One Address → Many Outcomes. Instantly split incoming revenue among your team, creators, or DAO, while automatically diverting a percentage into a yield-generating shared treasury. No accountants. No spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Rule Builder & Treasury (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Admin Panel (Only visible to owner) */}
            {isAdmin && <AdminPanel />}

            {/* Split Rules Editor */}
            <div className="bg-[#033633] border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black italic tracking-wide">SPLIT MATRIX</h2>
                  <p className="text-emerald-400/60 text-sm font-medium mt-1">Configure revenue distribution nodes</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${totalBasisPoints === 10000 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                  {(totalBasisPoints / 100).toFixed(1)}% / 100%
                </div>
              </div>

              {!address ? (
                <SplitRuleSkeleton />
              ) : (
                <div className="space-y-4">
                  {splits.map((split, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-[#022D2B]/50 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={split.recipient}
                          onChange={(e) => updateSplit(index, 'recipient', e.target.value)}
                          placeholder="Recipient 0x..."
                          className="w-full bg-[#033633] text-emerald-100 placeholder-emerald-700 p-3 rounded-xl border border-emerald-500/20 focus:outline-none focus:border-emerald-400 font-mono text-sm"
                        />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="range"
                              min="0"
                              max="10000"
                              value={split.basisPoints}
                              onChange={(e) => updateSplit(index, 'basisPoints', parseInt(e.target.value))}
                              className="w-full accent-emerald-500"
                            />
                            <span className="text-emerald-400 font-bold min-w-[50px] text-right">
                              {(split.basisPoints / 100).toFixed(1)}%
                            </span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${split.isVault ? 'bg-emerald-500' : 'bg-[#033633] border border-emerald-500/30'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${split.isVault ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <span className="text-xs font-bold text-emerald-400/60 group-hover:text-emerald-400">YIELD TREASURY</span>
                          </label>
                        </div>
                      </div>
                      {splits.length > 1 && (
                        <button
                          onClick={() => removeSplit(index)}
                          className="sm:w-12 h-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={addSplit}
                      disabled={splits.length >= 10}
                      className="flex-1 bg-[#022D2B] hover:bg-[#033633] text-emerald-400 font-bold p-4 rounded-2xl border border-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      + ADD DESTINATION
                    </button>
                    <button
                      onClick={handleSaveRulesClick}
                      disabled={!isReady || loading}
                      className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-[#022D2B] font-black p-4 rounded-2xl transition-all disabled:opacity-50 disabled:bg-[#033633] disabled:text-emerald-700"
                    >
                      {loading && showModal ? 'SYNCING...' : 'SAVE ON-CHAIN'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Treasury (Savings Vault) */}
            <div className="bg-[#033633] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-wide">SHARED TREASURY</h3>
                  <p className="text-emerald-400/60 text-xs font-medium">Compound Yield Severance Fund (4.5% APY)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#022D2B] p-4 rounded-2xl border border-emerald-500/10">
                  <div className="text-emerald-400/50 text-xs font-bold mb-1">cUSD TREASURY</div>
                  <div className="text-2xl font-black text-emerald-400">{treasuryBalance.cUSD.toFixed(2)}</div>
                </div>
                <div className="bg-[#022D2B] p-4 rounded-2xl border border-emerald-500/10">
                  <div className="text-emerald-400/50 text-xs font-bold mb-1">CELO TREASURY</div>
                  <div className="text-2xl font-black text-white">{treasuryBalance.CELO.toFixed(2)}</div>
                </div>
              </div>

              {/* Deposit/Withdraw Input & Smart Verification */}
              <div className="relative flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={vaultAmount}
                    onChange={e => setVaultAmount(e.target.value)}
                    className="w-full bg-[#022D2B] text-emerald-100 placeholder-emerald-700 p-3 pr-36 rounded-xl border border-emerald-500/20 focus:outline-none focus:border-emerald-400 font-mono text-sm"
                  />
                  <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    {vaultAmount && !isNaN(parseFloat(vaultAmount)) && (
                      <span className="text-[10px] text-emerald-400/60 font-medium">
                        ≈ ${(parseFloat(vaultAmount) * (vaultToken === 'CELO' ? 0.62 : 1.00)).toFixed(2)} USD
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Autocomplete with user's wallet balance (reserving 0.05 CELO buffer for gas if native CELO)
                      if (vaultToken === 'CELO') {
                        const maxVal = Math.max(0, balances.CELO - 0.05);
                        setVaultAmount(maxVal.toString());
                      } else {
                        setVaultAmount(balances.cUSD.toString());
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20"
                  >
                    MAX
                  </button>
                </div>
                <select 
                  value={vaultToken}
                  onChange={e => setVaultToken(e.target.value)}
                  className="bg-[#022D2B] text-emerald-400 font-bold p-3 rounded-xl border border-emerald-500/20 outline-none"
                >
                  <option value="cUSD">cUSD</option>
                  <option value="CELO">CELO</option>
                </select>
              </div>

              {/* Inline Smart Validation Alerts for Vault */}
              {vaultAmount && isDepositInsufficient && (
                <div className="text-red-400 font-bold text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-4">
                  ⚠️ Insufficient balance to deposit. You have {vaultBalance.toFixed(4)} {vaultToken}.
                </div>
              )}
              {vaultAmount && isWithdrawInsufficient && (
                <div className="text-red-400 font-bold text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-4">
                  ⚠️ Insufficient treasury balance to withdraw. You have {(vaultToken === 'cUSD' ? treasuryBalance.cUSD : treasuryBalance.CELO).toFixed(4)} {vaultToken}.
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={handleDepositClick}
                  disabled={loading || !vaultAmount || isDepositInsufficient}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold p-3 rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDownLeft className="w-4 h-4" /> DEPOSIT
                </button>
                <button 
                  onClick={handleWithdrawClick}
                  disabled={loading || !vaultAmount || isWithdrawInsufficient}
                  className="flex-1 bg-[#022D2B] hover:bg-[#033633] text-white font-bold p-3 rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  WITHDRAW <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Execute & History (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Execution Panel */}
            <div className="bg-emerald-500 text-[#022D2B] rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <h2 className="text-2xl font-black italic tracking-wide mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6" /> ROUTE PAYMENT
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Total Amount"
                      className="w-full bg-[#033633]/10 text-[#022D2B] placeholder-[#022D2B]/50 p-4 pr-36 rounded-2xl border border-[#022D2B]/20 focus:outline-none focus:border-[#022D2B] font-mono text-lg font-bold"
                    />
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      {amount && !isNaN(parseFloat(amount)) && (
                        <span className="text-xs text-[#022D2B]/60 font-black">
                          ≈ ${(parseFloat(amount) * (token === 'CELO' ? 0.62 : 1.00)).toFixed(2)} USD
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Max autocomplete with gas buffer for native CELO
                        if (token === 'CELO') {
                          const maxVal = Math.max(0, balances.CELO - 0.05);
                          setAmount(maxVal.toString());
                        } else {
                          setAmount(balances.cUSD.toString());
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#022D2B] hover:opacity-80 px-2 py-1 bg-[#022D2B]/10 rounded-md border border-[#022D2B]/20"
                    >
                      MAX
                    </button>
                  </div>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="bg-[#033633]/10 text-[#022D2B] font-black p-4 rounded-2xl border border-[#022D2B]/20 outline-none"
                  >
                    <option value="cUSD">cUSD</option>
                    <option value="CELO">CELO</option>
                  </select>
                </div>

                <div className="bg-[#033633]/5 p-4 rounded-2xl flex justify-between items-center text-sm font-bold">
                  <span>WALLET BALANCE:</span>
                  <span>{token === 'cUSD' ? balances.cUSD.toFixed(2) : balances.CELO.toFixed(2)} {token}</span>
                </div>

                {/* Inline Smart Validation Alerts for Routing */}
                {amount && isRouteInsufficient && (
                  <div className="text-red-950 font-bold text-xs bg-red-100 p-3 rounded-xl border border-red-200">
                    ⚠️ Insufficient balance. You only have {routeBalance.toFixed(4)} {token}.
                  </div>
                )}
                {amount && !isRouteInsufficient && isCeloGasLow && (
                  <div className="text-amber-950 font-bold text-xs bg-amber-100 p-3 rounded-xl border border-amber-200">
                    ⚠️ Low CELO balance. Leave at least 0.005 CELO for gas fees to avoid transaction failure.
                  </div>
                )}

                <button
                  onClick={handleRouteClick}
                  disabled={!isReady || !amount || loading || isRouteInsufficient || isCeloGasLow}
                  className="w-full bg-[#022D2B] hover:bg-[#033633] text-emerald-400 font-black p-5 rounded-2xl transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading && showModal ? 'PROCESSING...' : 'EXECUTE ROUTING'} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* History Panel */}
            <div className="bg-[#033633] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-black italic tracking-wide mb-6 flex items-center gap-2 text-emerald-400">
                <History className="w-5 h-5" /> RECENT ROUTINGS
              </h3>
              
              {!address ? (
                <HistoryListSkeleton />
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-emerald-400/40 font-medium text-sm">
                  No routing history found for this wallet.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((tx, i) => (
                    <div key={i} className="bg-[#022D2B]/50 p-4 rounded-2xl border border-emerald-500/10">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                        <a 
                          href={`https://celoscan.io/tx/${tx.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 hover:bg-emerald-500/20"
                        >
                          EXPLORER ↗
                        </a>
                      </div>
                      <div className="font-black text-lg mb-2">
                        {tx.amount} {tx.token}
                      </div>
                      <div className="space-y-1">
                        {tx.recipients.map((r, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-mono text-emerald-100/60">
                            <span>{r.slice(0,6)}...{r.slice(-4)}</span>
                            <span className="text-emerald-400">+{tx.amounts[idx]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />

      {/* Transaction Lifecycle & Simulation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#022D2B]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#033633] border border-emerald-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
            
            <h3 className="text-xl font-black italic tracking-wide uppercase text-emerald-400 mb-4 border-b border-emerald-500/10 pb-3">
              {modalTitle}
            </h3>

            {/* 1. Simulation step (Only for route payments and when status is idle) */}
            {txStep === 'idle' && txSimulation && (
              <div className="space-y-4">
                <p className="text-sm text-emerald-100/70">
                  Review your program split parameters before signing the transaction.
                </p>
                <div className="bg-[#022D2B] p-4 rounded-2xl border border-emerald-500/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                    <span>TOTAL SEND AMOUNT</span>
                    <span>{txSimulation.totalAmount} {txSimulation.tokenName} (≈ ${(parseFloat(txSimulation.totalAmount) * (txSimulation.tokenName === 'CELO' ? 0.62 : 1.00)).toFixed(2)} USD)</span>
                  </div>
                  <div className="border-t border-emerald-500/10 pt-2 space-y-2">
                    {txSimulation.recipients.map((recipient, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-mono text-emerald-100/60">
                          {txSimulation.isVault[i] ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">🏦 SAVINGS VAULT</span>
                          ) : (
                            `${recipient.slice(0, 8)}...${recipient.slice(-6)}`
                          )}
                        </span>
                        <span className="font-bold text-white">
                          {txSimulation.amounts[i]} {txSimulation.tokenName} ({txSimulation.percentages[i]}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-emerald-500/10 pt-2 flex justify-between items-center text-[10px] font-bold text-emerald-400/60">
                    <span>ESTIMATED GAS FEE</span>
                    <span>{txSimulation.estimatedGasFee} (≈ $0.0003 USD)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      txReset();
                    }}
                    className="flex-1 bg-[#022D2B] hover:bg-[#033633] text-emerald-400 font-bold p-3 rounded-xl border border-emerald-500/20 transition-all text-xs"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await executeRoutePayment();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#022D2B] font-black p-3 rounded-xl transition-all text-xs"
                  >
                    CONFIRM & SEND
                  </button>
                </div>
              </div>
            )}

            {/* 1.5. Treasury Simulation step (When status is idle and treasurySim exists) */}
            {txStep === 'idle' && treasurySim && (
              <div className="space-y-4">
                <p className="text-sm text-emerald-100/70">
                  Review your treasury transaction parameters before signing.
                </p>
                <div className="bg-[#022D2B] p-4 rounded-2xl border border-emerald-500/10 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                    <span>ACTION</span>
                    <span className="uppercase text-white font-black bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">{treasurySim.action}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                    <span>TOKEN</span>
                    <span>{treasurySim.token}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-white">
                    <span>AMOUNT</span>
                    <span>{treasurySim.amount} {treasurySim.token} (≈ ${treasurySim.usdValue} USD)</span>
                  </div>
                  <div className="border-t border-emerald-500/10 pt-2 flex justify-between items-center text-[10px] font-bold text-emerald-400/60">
                    <span>ESTIMATED GAS FEE</span>
                    <span>0.0005 CELO (≈ $0.0003 USD)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setTreasurySim(null);
                      txReset();
                    }}
                    className="flex-1 bg-[#022D2B] hover:bg-[#033633] text-emerald-400 font-bold p-3 rounded-xl border border-emerald-500/20 transition-all text-xs"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (treasurySim.action === 'deposit') {
                          await depositTreasury(treasurySim.token, treasurySim.amount);
                        } else {
                          await withdrawTreasury(treasurySim.token, treasurySim.amount);
                        }
                        setVaultAmount('');
                        setTreasurySim(null);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#022D2B] font-black p-3 rounded-xl transition-all text-xs"
                  >
                    CONFIRM & SIGN
                  </button>
                </div>
              </div>
            )}

            {/* 2. Active transaction steps (preparing, broadcasting, confirming, confirmed, failed) */}
            {txStep !== 'idle' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Preparing Step */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      txStep === 'preparing' ? 'bg-emerald-500 text-[#022D2B] animate-pulse' :
                      ['broadcasting', 'confirming', 'confirmed'].includes(txStep) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-[#022D2B] text-emerald-700'
                    }`}>
                      {['broadcasting', 'confirming', 'confirmed'].includes(txStep) ? '✓' : '1'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${txStep === 'preparing' ? 'text-emerald-400' : 'text-emerald-100/60'}`}>
                        Preparing Transaction
                      </p>
                      <p className="text-xs text-emerald-400/40">Requesting signature from wallet...</p>
                    </div>
                  </div>

                  {/* Broadcasting Step */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      txStep === 'broadcasting' ? 'bg-emerald-500 text-[#022D2B] animate-pulse' :
                      ['confirming', 'confirmed'].includes(txStep) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-[#022D2B] text-emerald-700'
                    }`}>
                      {['confirming', 'confirmed'].includes(txStep) ? '✓' : '2'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${txStep === 'broadcasting' ? 'text-emerald-400' : 'text-emerald-100/60'}`}>
                        Broadcasting
                      </p>
                      <p className="text-xs text-emerald-400/40">Sending transaction to Celo network...</p>
                    </div>
                  </div>

                  {/* Confirming Step */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      txStep === 'confirming' ? 'bg-emerald-500 text-[#022D2B] animate-pulse' :
                      txStep === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-[#022D2B] text-emerald-700'
                    }`}>
                      {txStep === 'confirmed' ? '✓' : '3'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${txStep === 'confirming' ? 'text-emerald-400' : 'text-emerald-100/60'}`}>
                        Confirming Blocks
                      </p>
                      <p className="text-xs text-emerald-400/40">Waiting for Celo block receipt...</p>
                    </div>
                  </div>
                </div>

                {/* Status messages & feedback */}
                {txStep === 'confirmed' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      ✓
                    </div>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Transaction Confirmed!</p>
                    {txHash && (
                      <a
                        href={`https://celoscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs font-mono text-emerald-400/60 hover:text-emerald-400 underline"
                      >
                        View on Celoscan ↗
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setShowModal(false);
                        txReset();
                      }}
                      className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-[#022D2B] font-black py-2.5 rounded-xl transition-all text-xs"
                    >
                      DISMISS
                    </button>
                  </div>
                )}

                {txStep === 'failed' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400 text-lg font-bold">
                      ✕
                    </div>
                    <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Transaction Failed</p>
                    <p className="text-xs text-red-300/80 max-h-20 overflow-y-auto font-mono text-left p-2 bg-black/20 rounded-lg">
                      {txError}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          txReset();
                        }}
                        className="flex-1 bg-[#022D2B] hover:bg-[#033633] text-emerald-400 font-bold py-2 rounded-xl border border-emerald-500/20 transition-all text-xs"
                      >
                        CLOSE
                      </button>
                      <button
                        onClick={async () => {
                          txReset();
                          if (modalTitle.includes('Route')) {
                            await executeRoutePayment();
                          } else if (modalTitle.includes('Save')) {
                            await saveOnChainRules();
                          } else if (modalTitle.includes('Deposit')) {
                            await depositTreasury(vaultToken, vaultAmount);
                          } else if (modalTitle.includes('Withdraw')) {
                            await withdrawTreasury(vaultToken, vaultAmount);
                          }
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-400 text-white font-black py-2 rounded-xl transition-all text-xs"
                      >
                        TRY AGAIN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
