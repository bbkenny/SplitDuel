"use client";

import { motion } from "framer-motion";

const Shimmer = () => (
  <motion.div
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: "linear",
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
  />
);

export const SplitRuleSkeleton = () => (
  <div className="relative overflow-hidden bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
    <div className="flex items-center gap-4 flex-1">
      <div className="w-12 h-12 bg-zinc-800 rounded-xl" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-800/50 rounded" />
      </div>
    </div>
    <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
    <Shimmer />
  </div>
);

export const VaultStatsSkeleton = () => (
  <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-[1.5rem] space-y-3">
        <div className="h-3 w-20 bg-zinc-800/70 rounded uppercase tracking-widest" />
        <div className="h-10 w-32 bg-zinc-800 rounded-lg" />
        <Shimmer />
      </div>
    ))}
  </div>
);

export const HistoryListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="flex flex-col gap-3 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="relative overflow-hidden h-16 bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-16 bg-zinc-800/50 rounded" />
        <Shimmer />
      </div>
    ))}
  </div>
);
