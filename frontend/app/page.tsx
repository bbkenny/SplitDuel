'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import DuelWarRoom from '@/components/DuelWarRoom';
import HelpModal from '@/components/HelpModal';

const SPLIT_POOL_ADDRESS = "0x1D3184144fC75f4912a2805eeD7a218f2B48b4e9";
const SPLIT_POOL_ABI = parseAbi([
  "function currentTournamentId() external view returns (uint256)",
  "function tournaments(uint256, address) external view returns (uint256 id, uint256 startTime, uint256 endTime, uint256 totalStaked, uint256 totalPrize, uint256 lastYieldUpdate, bool settled)",
  "function supportedTokens(address) external view returns (bool)",
  "function tournamentDuration() external view returns (uint256)"
]);

const DEFAULT_TOKENS = [
  { name: 'CELO', address: '0x471EcE3750Da237f93B8E339c536989b8978a438' },
  { name: 'USDM', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' },
  { name: 'EURM', address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73' },
  { name: 'USDT', address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' },
  { name: 'USDC', address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' }
];

function ArenaCard({ token, currentTid, isSelected, onSelect }: { token: any, currentTid: bigint | undefined, isSelected: boolean, onSelect: (addr: string) => void }) {
  const { data: isSupported } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'supportedTokens',
    args: [token.address as `0x${string}`],
  });

  const { data: tournamentData } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournaments',
    args: currentTid ? [currentTid, token.address as `0x${string}`] : undefined,
  });

  const [, startTime, endTime, , , , settled] = (tournamentData as any) || [];
  
  let status = "LOADING...";
  let isJoinable = false;

  if (tournamentData) {
    if (startTime === 0n) {
      status = "NOT STARTED";
    } else if (settled) {
      status = "SETTLED";
    } else {
      const now = Math.floor(Date.now() / 1000);
      if (now >= Number(endTime)) {
        status = "ENDED";
      } else {
        status = "LIVE";
        isJoinable = true;
      }
    }
  }

  if (!isSupported) return null;

  return (
    <div 
      onClick={() => isJoinable && onSelect(token.address)}
      className={`bg-[#050D0C]/80 backdrop-blur-md p-5 rounded-2xl border transition-all ${isJoinable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-70'} ${isSelected ? 'border-[var(--color-primary)] shadow-[0_0_30px_rgba(93,191,126,0.4)] ring-2 ring-[var(--color-primary)]' : 'border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(93,191,126,0.05)]'} flex flex-col items-center gap-3`}
    >
      <div className="text-xl font-black text-white tracking-widest">{token.name} ARENA</div>
      <div className="flex w-full justify-between items-center border-b border-white/10 pb-2">
        <span className="text-xs font-mono text-white/50">ROUND ID:</span>
        <span className="text-sm font-bold text-white">{currentTid?.toString() || '...'}</span>
      </div>
      <div className="flex w-full justify-between items-center">
        <span className="text-xs font-mono text-white/50">STATUS:</span>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'LIVE' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50 animate-pulse' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
          {status}
        </div>
      </div>
      
      {isJoinable && (
        <div className={`mt-2 text-xs font-bold tracking-widest uppercase transition-colors ${isSelected ? 'text-[var(--color-primary)]' : 'text-white/30'}`}>
          {isSelected ? 'SELECTED' : 'CLICK TO SELECT'}
        </div>
      )}
      {!isJoinable && (
        <div className="mt-2 text-xs font-bold tracking-widest text-[#FF4D6D] uppercase">
          UNAVAILABLE
        </div>
      )}
    </div>
  );
}

export default function SplitDuelHome() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(null);
  const [enteredDuel, setEnteredDuel] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { address } = useAccount();

  const { data: currentTid } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'currentTournamentId',
  });

  const { data: currentDurationSecs } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournamentDuration',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (enteredDuel && selectedTokenAddress) {
    return <DuelWarRoom activeTokenAddress={selectedTokenAddress} onBack={() => setEnteredDuel(false)} />;
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
      <div className="absolute top-0 w-full p-4 md:p-6 flex justify-center sm:justify-end z-20">
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="border border-[var(--color-primary)]/50 text-[var(--color-primary)] px-4 sm:px-6 py-2 rounded-full font-bold tracking-widest text-[10px] sm:text-xs hover:bg-[var(--color-primary)] hover:text-black transition-all shadow-[0_0_15px_rgba(93,191,126,0.2)] mt-2 sm:mt-0"
        >
          HOW IT WORKS / INTEL
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 text-center relative z-10 pt-24 sm:pt-36 pb-10 sm:pb-20 w-full">
        <div className="w-full max-w-[1200px] mx-auto h-full flex flex-col justify-center relative">
          
          {step === 1 ? (
            <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in zoom-in duration-500">
              {/* Hero Illustration */}
              <div className="w-full max-w-2xl mx-auto flex items-center justify-center mb-6 sm:mb-10 relative animate-[pulse_6s_ease-in-out_infinite]">
                <img 
                  src="/assets/hero_illustration.png" 
                  alt="War Room Command Center" 
                  className="w-full h-auto max-h-[40vh] drop-shadow-[0_0_50px_rgba(93,191,126,0.3)] object-contain"
                />
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--color-text)] mb-3 sm:mb-6 tracking-widest leading-tight px-2">
                BUILD YOUR TREASURY.<br/>
                DEFEAT YOUR RIVAL.
              </h2>
              
              <p className="text-sm sm:text-lg md:text-xl text-[var(--color-primary)] opacity-80 mb-6 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-medium px-4">
                A 1v1 real-time strategy battle where two players compete to grow their treasury the fastest.
              </p>

              {/* Proceed Button (Bottom on Mobile, Fixed Right on Desktop) */}
              <div className="flex flex-col items-center mt-4 md:mt-0 md:fixed md:right-8 md:top-1/2 md:-translate-y-1/2 z-50">
                <button 
                  onClick={() => setStep(2)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--color-primary)]/50 flex items-center justify-center animate-bounce md:animate-[pulse_2s_ease-in-out_infinite] hover:bg-[var(--color-primary)] hover:text-black hover:border-[var(--color-primary)] transition-all shadow-[0_0_20px_rgba(93,191,126,0.4)] text-[var(--color-primary)] md:hover:scale-110"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
                <div className="text-[10px] tracking-widest mt-4 opacity-70 uppercase font-bold text-center text-[var(--color-primary)]">PROCEED<br className="hidden md:block"/>TO ARENA</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-right-8 fade-in duration-500">
              <button 
                onClick={() => setStep(1)} 
                className="absolute top-8 left-8 sm:top-24 sm:left-12 text-[var(--color-primary)]/50 hover:text-[var(--color-primary)] font-bold tracking-widest text-xs flex items-center gap-2"
              >
                ← BACK
              </button>

              <p className="text-[10px] sm:text-xs md:text-sm text-[var(--color-text)] opacity-60 mb-8 sm:mb-12 font-bold tracking-widest uppercase px-4 mt-8">
                Only the DeFi yield is at stake. Your principal is always safe.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 max-w-5xl mx-auto px-4 w-full">
                {/* Attack Card */}
                <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-[var(--color-attack)]/30 shadow-[0_0_20px_rgba(255,10,120,0.05)] hover-lift">
                  <img src="/assets/attack_icon.png" alt="Attack" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,10,120,0.6)] animate-[pulse_3s_ease-in-out_infinite]" />
                  <div className="text-[var(--color-attack)] font-black text-lg sm:text-xl tracking-widest mb-2">ATTACK</div>
                  <div className="text-[var(--color-text)]/70 text-xs sm:text-sm font-medium">Drain opponent yield</div>
                </div>

                {/* Defense Card */}
                <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-[var(--color-defense)]/30 shadow-[0_0_20px_rgba(47,155,255,0.05)] hover-lift">
                  <img src="/assets/defense_icon.png" alt="Defense" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(47,155,255,0.6)] animate-[pulse_4s_ease-in-out_infinite]" />
                  <div className="text-[var(--color-defense)] font-black text-lg sm:text-xl tracking-widest mb-2">DEFEND</div>
                  <div className="text-[var(--color-text)]/70 text-xs sm:text-sm font-medium">Block incoming attacks</div>
                </div>

                {/* Invest Card */}
                <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-[var(--color-invest)]/30 shadow-[0_0_20px_rgba(0,245,138,0.05)] hover-lift">
                  <img src="/assets/invest_icon.png" alt="Invest" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(0,245,138,0.6)] animate-[pulse_3.5s_ease-in-out_infinite]" />
                  <div className="text-[var(--color-invest)] font-black text-lg sm:text-xl tracking-widest mb-2">INVEST</div>
                  <div className="text-[var(--color-text)]/70 text-xs sm:text-sm font-medium">Compound your treasury</div>
                </div>
              </div>

              {!address ? (
                <div className="animate-pulse text-[var(--color-warning)] text-xl font-bold tracking-widest mt-10">
                  CONNECT WALLET TO ENTER
                </div>
              ) : (
                <div className="w-full max-w-4xl mx-auto mt-8">
                  <h3 className="text-xl font-bold tracking-widest text-white mb-6 border-b border-white/10 pb-2">SELECT ARENA LOBBY</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    {DEFAULT_TOKENS.map((token) => (
                      <ArenaCard 
                        key={token.address} 
                        token={token} 
                        currentTid={currentTid as bigint | undefined} 
                        isSelected={selectedTokenAddress === token.address}
                        onSelect={(addr) => setSelectedTokenAddress(addr)} 
                      />
                    ))}
                  </div>

                  <div className="max-w-2xl mx-auto px-4">
                    <button 
                      disabled={!selectedTokenAddress}
                      onClick={() => setEnteredDuel(true)}
                      className={`btn-cyber w-full border-2 px-4 py-4 md:py-6 rounded-2xl font-black tracking-[0.2em] md:tracking-[0.4em] text-base sm:text-lg md:text-xl shadow-[0_0_20px_rgba(93,191,126,0.2)] flex items-center justify-center gap-2 sm:gap-4 transition-all ${selectedTokenAddress ? 'bg-[#05100D] border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[#05100D]' : 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                      <span className="hidden md:inline">██████</span> ENTER DUEL <span className="hidden md:inline">██████</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} durationSecs={currentDurationSecs as bigint | undefined} />
    </div>
  );
}
