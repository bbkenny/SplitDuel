'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DuelWarRoom from '@/components/DuelWarRoom';
import HelpModal from '@/components/HelpModal';

export default function SplitDuelHome() {
  const [mounted, setMounted] = useState(false);
  const [inDuel, setInDuel] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (inDuel) {
    return <DuelWarRoom />;
  }

  return (
    <div className="min-h-screen text-[var(--color-primary)] font-sans flex flex-col relative overflow-hidden bg-[var(--color-background)]">
      {/* Background Graphic */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen blur-[3px]"
          style={{ backgroundImage: "url('/assets/background_tactical_grid.png')" }} 
        />
        <div className="absolute inset-0 bg-[var(--color-background)]/70" />
      </div>
      {/* Holographic rings */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[var(--color-primary)] opacity-10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-[var(--color-secondary)] opacity-[0.05] rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-0 w-full p-6 flex justify-end z-20">
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="border border-[var(--color-primary)]/50 text-[var(--color-primary)] px-6 py-2 rounded-full font-bold tracking-widest text-xs hover:bg-[var(--color-primary)] hover:text-black transition-all shadow-[0_0_15px_rgba(93,191,126,0.2)]"
        >
          HOW IT WORKS / INTEL
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 pt-36 pb-20">
        
        <div className="w-full max-w-[1200px] mx-auto">
          
          {/* Hero Illustration */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-center mb-10 relative animate-[pulse_6s_ease-in-out_infinite]">
            <img 
              src="/assets/hero_illustration.png" 
              alt="War Room Command Center" 
              className="w-full h-auto drop-shadow-[0_0_50px_rgba(93,191,126,0.3)] object-contain"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[var(--color-text)] mb-6 tracking-widest leading-tight">
            BUILD YOUR TREASURY.<br/>
            DEFEAT YOUR RIVAL.
          </h2>
          
          <p className="text-lg md:text-xl text-[var(--color-primary)] opacity-80 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
            A 1v1 real-time strategy battle where two players compete to grow their treasury the fastest.
          </p>

          <p className="text-xs md:text-sm text-[var(--color-text)] opacity-60 mb-12 font-bold tracking-widest uppercase">
            Only the DeFi yield is at stake. Your principal is always safe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            {/* Attack Card */}
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-8 rounded-2xl border border-[var(--color-attack)]/30 shadow-[0_0_20px_rgba(255,10,120,0.05)] hover-lift">
              <img src="/assets/attack_icon.png" alt="Attack" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,10,120,0.6)] animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="text-[var(--color-attack)] font-black text-xl tracking-widest mb-2">ATTACK</div>
              <div className="text-[var(--color-text)]/70 text-sm font-medium">Drain opponent yield</div>
            </div>

            {/* Defense Card */}
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-8 rounded-2xl border border-[var(--color-defense)]/30 shadow-[0_0_20px_rgba(47,155,255,0.05)] hover-lift">
              <img src="/assets/defense_icon.png" alt="Defense" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(47,155,255,0.6)] animate-[pulse_4s_ease-in-out_infinite]" />
              <div className="text-[var(--color-defense)] font-black text-xl tracking-widest mb-2">DEFEND</div>
              <div className="text-[var(--color-text)]/70 text-sm font-medium">Block incoming attacks</div>
            </div>

            {/* Invest Card */}
            <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-8 rounded-2xl border border-[var(--color-invest)]/30 shadow-[0_0_20px_rgba(0,245,138,0.05)] hover-lift">
              <img src="/assets/invest_icon.png" alt="Invest" className="w-20 h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(0,245,138,0.6)] animate-[pulse_3.5s_ease-in-out_infinite]" />
              <div className="text-[var(--color-invest)] font-black text-xl tracking-widest mb-2">INVEST</div>
              <div className="text-[var(--color-text)]/70 text-sm font-medium">Compound your treasury</div>
            </div>
          </div>

          {!address ? (
            <div className="animate-pulse text-[var(--color-warning)] text-xl font-bold tracking-widest mt-10">
              CONNECT WALLET TO ENTER
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button 
                onClick={() => setInDuel(true)}
                className="btn-cyber w-full bg-[#05100D] border-2 border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-6 rounded-2xl font-black tracking-[0.2em] md:tracking-[0.4em] text-lg md:text-xl shadow-[0_0_20px_rgba(93,191,126,0.2)] flex items-center justify-center gap-4 hover:bg-[var(--color-primary)] hover:text-[#05100D]"
              >
                <span className="hidden md:inline">██████</span> ENTER DUEL <span className="hidden md:inline">██████</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
