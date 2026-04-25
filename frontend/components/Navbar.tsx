"use client";

import Link from "next/link";

export default function Navbar() {
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
          <span
            style={{ letterSpacing: "0.16em", lineHeight: 1 }}
            className="text-2xl font-black uppercase"
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
        <div className="flex items-center gap-3" />
      </div>
    </header>
  );
}
