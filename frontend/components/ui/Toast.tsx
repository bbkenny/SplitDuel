"use client";

import { toast, Toaster as HotToaster, Toast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck } from "lucide-react";

export const splitToast = {
  success: (message: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible ? "animate-in fade-in slide-in-from-bottom-4" : "animate-out fade-out slide-out-to-bottom-4"
        } max-w-md w-full bg-zinc-900 border border-green-500/30 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 bg-gradient-to-r from-green-500/5 to-transparent flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">Split Executed</p>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    )),
  error: (message: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible ? "animate-in fade-in slide-in-from-bottom-4" : "animate-out fade-out slide-out-to-bottom-4"
        } max-w-md w-full bg-zinc-900 border border-red-500/30 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 bg-gradient-to-r from-red-500/5 to-transparent flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-black text-white uppercase tracking-wider">Routing Failed</p>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
    )),
  routing: (amount: string, count: number) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible ? "animate-in fade-in zoom-in" : "animate-out fade-out zoom-out"
        } max-w-sm w-full bg-zinc-900 border border-blue-500/40 shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden duration-500`}
      >
        <div className="flex-1 p-5 bg-gradient-to-b from-blue-500/10 to-transparent flex flex-col items-center text-center">
          <ArrowUpRight className="h-10 w-10 text-blue-500 mb-3 animate-pulse" />
          <p className="text-lg font-black text-white uppercase italic tracking-tighter">Routing {amount} cUSD</p>
          <p className="mt-1 text-xs text-zinc-400 font-bold uppercase tracking-widest">To {count} Destinations</p>
        </div>
      </div>
    )),
  security: (message: string) =>
    toast.custom((t: Toast) => (
      <div
        className={`${
          t.visible ? "animate-in fade-in slide-in-from-top-4" : "animate-out fade-out slide-out-to-top-4"
        } max-w-xs w-full bg-zinc-900 border border-emerald-500 shadow-2xl rounded-xl pointer-events-auto flex overflow-hidden duration-300`}
      >
        <div className="flex-1 p-4 flex items-center gap-3 bg-emerald-500/5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-tight">{message}</p>
        </div>
      </div>
    )),
};

export const SplitToaster = () => (
  <HotToaster
    position="bottom-center"
    toastOptions={{
      duration: 4000,
    }}
  />
);
