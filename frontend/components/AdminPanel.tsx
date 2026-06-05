"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ShieldCheck, Loader2, Save } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/lib/constants";
import { AutoSplitRouterABI } from "@/lib/abi";
import { splitToast } from "@/components/ui/Toast";

export default function AdminPanel() {
  const routerAddress = CONTRACT_ADDRESSES.celo.AUTO_SPLIT_ROUTER as `0x${string}`;

  const [apyValue, setApyValue] = useState("");
  const [interestValue, setInterestValue] = useState("");
  const [multiplierValue, setMultiplierValue] = useState("");

  const { data: currentApy, refetch: refetchApy } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: "apyBasisPoints",
  });

  const { data: currentInterest, refetch: refetchInterest } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: "loanInterestBps",
  });

  const { data: currentMultiplier, refetch: refetchMultiplier } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: "creditMultiplier",
  });

  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const handleUpdateApy = async () => {
    try {
      setLoading(true);
      if (!apyValue) throw new Error("Please enter APY basis points");
      await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: "setApyBasisPoints",
        args: [BigInt(apyValue)],
        type: "legacy",
      });
      splitToast.security("APY successfully updated");
      refetchApy();
      setApyValue("");
    } catch (e: any) {
      splitToast.error(e.message || "Failed to update APY");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterest = async () => {
    try {
      setLoading(true);
      if (!interestValue) throw new Error("Please enter Loan Interest basis points");
      await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: "setLoanInterestBps",
        args: [BigInt(interestValue)],
        type: "legacy",
      });
      splitToast.security("Loan Interest successfully updated");
      refetchInterest();
      setInterestValue("");
    } catch (e: any) {
      splitToast.error(e.message || "Failed to update Loan Interest");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMultiplier = async () => {
    try {
      setLoading(true);
      if (!multiplierValue) throw new Error("Please enter Credit Multiplier");
      await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: "setCreditMultiplier",
        args: [BigInt(multiplierValue)],
        type: "legacy",
      });
      splitToast.security("Credit Multiplier successfully updated");
      refetchMultiplier();
      setMultiplierValue("");
    } catch (e: any) {
      splitToast.error(e.message || "Failed to update Credit Multiplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 md:p-8 border-white/5 space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-widest flex items-center gap-3 text-red-400">
          <ShieldCheck className="w-5 h-5" />
          Protocol Admin Dashboard
        </h2>
        <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-wider">
          Exclusive Governance & System Control parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* APY Control */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-widest mb-1">Global APY (BPS)</h3>
          <p className="text-[10px] text-emerald-400 font-mono mb-4">
            Current: {currentApy ? Number(currentApy).toString() : "Loading..."} bps ({(Number(currentApy) / 100).toFixed(2)}%)
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="APY in bps (e.g. 450 = 4.5%)"
              value={apyValue}
              onChange={(e) => setApyValue(e.target.value)}
              className="w-full bg-black/20 border border-white/5 focus:border-red-500/50 rounded-xl px-4 py-3 text-xs font-black outline-none transition-all"
            />
            <button
              onClick={handleUpdateApy}
              disabled={loading || !apyValue}
              className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Update APY
            </button>
          </div>
        </div>

        {/* Loan Interest Control */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-widest mb-1">Loan Interest (BPS)</h3>
          <p className="text-[10px] text-emerald-400 font-mono mb-4">
            Current: {currentInterest ? Number(currentInterest).toString() : "Loading..."} bps ({(Number(currentInterest) / 100).toFixed(2)}%)
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Interest in bps (max 3000)"
              value={interestValue}
              onChange={(e) => setInterestValue(e.target.value)}
              className="w-full bg-black/20 border border-white/5 focus:border-red-500/50 rounded-xl px-4 py-3 text-xs font-black outline-none transition-all"
            />
            <button
              onClick={handleUpdateInterest}
              disabled={loading || !interestValue}
              className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Update Interest
            </button>
          </div>
        </div>

        {/* Credit Multiplier Control */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-widest mb-1">Credit Multiplier</h3>
          <p className="text-[10px] text-emerald-400 font-mono mb-4">
            Current: {currentMultiplier ? Number(currentMultiplier).toString() : "Loading..."}x tokens / pt
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Tokens per reputation point"
              value={multiplierValue}
              onChange={(e) => setMultiplierValue(e.target.value)}
              className="w-full bg-black/20 border border-white/5 focus:border-red-500/50 rounded-xl px-4 py-3 text-xs font-black outline-none transition-all"
            />
            <button
              onClick={handleUpdateMultiplier}
              disabled={loading || !multiplierValue}
              className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Update Multiplier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
