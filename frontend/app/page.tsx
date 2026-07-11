'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DuelWarRoom from '@/components/DuelWarRoom';
import { Shield, TrendingUp, Zap, History, Target } from 'lucide-react';

export default function SplitDuelHome() {
  const [mounted, setMounted] = useState(false);
  const [inDuel, setInDuel] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (inDuel) {
    return <DuelWarRoom />;
  }

  return (
    <div className="min-h-screen text-[#5DBF7E] font-sans flex flex-col">

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden pt-36 pb-20">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,138,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,138,0.06)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="z-10 w-full max-w-[1200px] mx-auto">
          
          {/* Hero Illustration */}
          <div className="w-full max-w-lg mx-auto h-32 flex items-center justify-center mb-16 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-[#00F28A]/10 rounded-full animate-ping absolute" />
              <div className="w-16 h-16 border border-[#5DBF7E]/30 rounded-full absolute" />
              <Shield size={40} className="text-[#5DBF7E] drop-shadow-[0_0_15px_rgba(0,242,138,0.6)] z-10" />
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-widest leading-tight">
            BUILD YOUR TREASURY.<br/>
            DEFEAT YOUR RIVAL.
          </h2>
          
          <p className="text-xl md:text-2xl text-[#5DBF7E]/80 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            A 1v1 real-time strategy battle where two players compete to grow their treasury the fastest.
          </p>

          <p className="text-sm md:text-base text-white/60 mb-20 font-bold tracking-widest uppercase">
            Only the DeFi yield is at stake. Your principal is always safe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            <div className="bg-[#0A1A18] p-8 rounded-2xl border-2 border-[#FF4D6D]/20 shadow-[0_0_15px_rgba(255,77,109,0.05)] hover:border-[#FF4D6D]/60 hover:-translate-y-1 transition-all">
              <Zap className="text-[#FF4D6D] w-12 h-12 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,77,109,0.6)]" />
              <div className="text-[#FF4D6D] font-black text-xl tracking-widest mb-2">ATTACK</div>
              <div className="text-[#E6F2EF]/70 font-medium">Drain opponent yield</div>
            </div>
            <div className="bg-[#0A1A18] p-8 rounded-2xl border-2 border-[#4DA3FF]/20 shadow-[0_0_15px_rgba(77,163,255,0.05)] hover:border-[#4DA3FF]/60 hover:-translate-y-1 transition-all">
              <Shield className="text-[#4DA3FF] w-12 h-12 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(77,163,255,0.6)]" />
              <div className="text-[#4DA3FF] font-black text-xl tracking-widest mb-2">DEFEND</div>
              <div className="text-[#E6F2EF]/70 font-medium">Block incoming attacks</div>
            </div>
            <div className="bg-[#0A1A18] p-8 rounded-2xl border-2 border-[#5DBF7E]/20 shadow-[0_0_15px_rgba(93,191,126,0.05)] hover:border-[#00F28A]/60 hover:-translate-y-1 transition-all">
              <TrendingUp className="text-[#5DBF7E] w-12 h-12 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,242,138,0.6)]" />
              <div className="text-[#5DBF7E] font-black text-xl tracking-widest mb-2">INVEST</div>
              <div className="text-[#E6F2EF]/70 font-medium">Compound your treasury</div>
            </div>
          </div>

          {!address ? (
            <div className="animate-pulse text-[#F4D935] text-xl font-bold tracking-widest mt-10">
              CONNECT WALLET TO ENTER
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button 
                onClick={() => setInDuel(true)}
                className="w-full bg-[#102E2B] border-2 border-[#00F28A] hover:bg-[#00F28A] text-[#00F28A] hover:text-[#102E2B] px-4 py-6 rounded-2xl font-black tracking-[0.2em] md:tracking-[0.4em] text-xl md:text-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,242,138,0.2)] hover:shadow-[0_0_40px_rgba(0,242,138,0.4)] flex items-center justify-center gap-4"
              >
                <span className="hidden md:inline">██████</span> ENTER DUEL <span className="hidden md:inline">██████</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
