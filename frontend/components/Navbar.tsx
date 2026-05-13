"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useMiniPay } from "@/hooks/useMiniPay";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { isMiniPay } = useMiniPay();
  const { open } = useAppKit();

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
          <img src="/autosplit-logo.png" alt="AutoSplit Logo" className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform" />
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
        <div className="flex items-center gap-4">
          {!isMiniPay && (
            <button
              onClick={() => open()}
              className="bg-[#2FD07A] text-black font-bold py-2 px-4 rounded-xl text-xs sm:text-sm hover:opacity-90 transition-opacity"
            >
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'CONNECT WALLET'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
