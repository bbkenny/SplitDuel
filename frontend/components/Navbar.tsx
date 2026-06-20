"use client";

import Link from "next/link";
import { useAccount, useBalance } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { useAutoSplit } from "@/components/AutoSplitProvider";
import { useState, useRef, useEffect } from "react";
import { Copy, Check, Wallet, ChevronDown } from "lucide-react";
import { formatUnits } from "viem";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { isMiniPay } = useMiniPay();
  const { open } = useAppKit();
  const { balances } = useAutoSplit();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <img src="/autosplit-logo.png" alt="AutoSplit Logo" className="h-14 w-auto object-contain group-hover:scale-110 transition-transform" />
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
            <div className="flex items-center gap-2" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all rounded-xl text-xs font-black text-white font-mono select-none shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  title="View balance"
                >
                  <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                  <ChevronDown size={14} className={`text-white transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#022D2B] border border-emerald-500/20 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1">
                    <div className="px-2 pt-2 pb-1 text-[10px] font-black text-emerald-400/50 tracking-wider">WALLET BALANCE</div>
                    <div className="flex justify-between items-center px-3 py-2.5 bg-[#033633]/80 rounded-lg">
                      <span className="text-emerald-400/60 text-xs font-bold">cUSD</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">{balances?.cUSD?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2.5 bg-[#033633]/80 rounded-lg">
                      <span className="text-emerald-400/60 text-xs font-bold">CELO</span>
                      <span className="text-white font-mono font-bold text-sm">{balances?.CELO?.toFixed(4) || "0.0000"}</span>
                    </div>
                    <div className="h-[1px] w-full bg-emerald-500/10 my-1" />
                    <button
                      onClick={(e) => {
                        handleCopy(e);
                        setTimeout(() => setDropdownOpen(false), 1000);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-emerald-500/10 rounded-lg text-xs font-bold text-emerald-400 transition-colors"
                    >
                      <span>{copied ? "COPIED!" : "COPY ADDRESS"}</span>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>

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
