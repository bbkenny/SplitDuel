"use client";

import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useState } from "react";
import { Copy, Check, Wallet } from "lucide-react";
import { formatUnits } from "viem";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { isMiniPay } = useMiniPay();
  const { open } = useAppKit();
  const { data: balanceData } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      style={{
        background: "color-mix(in srgb, var(--background) 80%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <img src="/autosplit-logo.png" alt="AutoSplit Logo" className="w-14 h-14 rounded-full group-hover:scale-110 transition-transform" />
          <span
            style={{ letterSpacing: "0.16em", lineHeight: 1 }}
            className="text-2xl font-black uppercase hidden sm:block"
          >
            <span style={{ color: "var(--primary)" }}>AUTO</span>
            <span
              style={{ color: "var(--foreground-muted)" }}
              className="mx-1.5"
            >
              SPLIT
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              {/* Copyable Wallet Address styled to match Add Destination button, but with white text and icons */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all rounded-xl text-xs font-black text-white font-mono select-none shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                title="Copy wallet address"
              >
                <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                {copied ? (
                  <Check size={14} className="text-white" />
                ) : (
                  <Copy size={14} className="text-white/80" />
                )}
              </button>

              {/* Wallet Options Modal Trigger (only outside MiniPay) */}
              {!isMiniPay && (
                <button
                  onClick={() => open()}
                  className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-xl border border-white/10 text-white flex items-center justify-center"
                  title="Wallet options"
                >
                  <Wallet size={15} />
                </button>
              )}
            </div>
          ) : (
            // Only show Connect button outside MiniPay environment
            !isMiniPay && (
              <button
                onClick={() => open()}
                className="bg-[#2FD07A] text-black font-bold py-2 px-4 rounded-xl text-xs sm:text-sm hover:opacity-90 transition-opacity"
              >
                CONNECT WALLET
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
