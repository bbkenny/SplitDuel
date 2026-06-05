"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { ShieldCheck, Loader2, Save } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/lib/constants";
import { AutoSplitRouterABI } from "@/lib/abi";
import { splitToast } from "@/components/ui/Toast";

export default function AdminPanel() {
  const routerAddress = CONTRACT_ADDRESSES.celo.AUTO_SPLIT_ROUTER as `0x${string}`;

  const [apyValue, setApyValue] = useState("");

  const { data: currentApy, refetch: refetchApy } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: "apyBasisPoints",
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

  return (
    <div className="bg-[#033633] p-5 md:p-8 border border-emerald-500/20 rounded-3xl space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-widest flex items-center gap-3 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          Treasury Admin Dashboard
        </h2>
        <p className="text-xs font-bold text-emerald-400/50 mt-1 uppercase tracking-wider">
          Exclusive Governance & System Control parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* APY Control */}
        <div className="bg-[#022D2B] border border-emerald-500/10 rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-widest mb-1 text-white">Global APY (BPS)</h3>
          <p className="text-[10px] text-emerald-400 font-mono mb-4">
            Current: {currentApy ? Number(currentApy).toString() : "Loading..."} bps ({(Number(currentApy) / 100).toFixed(2)}%)
          </p>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="APY in bps (e.g. 450 = 4.5%)"
              value={apyValue}
              onChange={(e) => setApyValue(e.target.value)}
              className="w-full bg-[#033633] border border-emerald-500/20 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs font-black outline-none transition-all text-white"
            />
            <button
              onClick={handleUpdateApy}
              disabled={loading || !apyValue}
              className="w-full h-10 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Update APY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
