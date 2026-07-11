import React, { useState } from 'react';
import { Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DuelWarRoom() {
  const [attackPct, setAttackPct] = useState(40);
  const [defendPct, setDefendPct] = useState(20);
  const [investPct, setInvestPct] = useState(40);
  const [round, setRound] = useState(3);

  const total = attackPct + defendPct + investPct;

  const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center pt-32 pb-20 relative overflow-hidden">
      {/* Background visual effects */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: "url('/assets/background_military_bunker.png')" }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent opacity-20 shadow-[0_0_30px_rgba(93,191,126,0.8)]" />

      <div className="w-full max-w-[1200px] px-6 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#5DBF7E]/20 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(93,191,126,0.6)] flex items-center gap-3">
              SPLIT DUEL
            </h1>
            <div className="text-[#5DBF7E]/60 text-xs font-bold tracking-widest mt-2">SECURE BATTLEFIELD LINK ESTABLISHED</div>
          </div>
          <div className="text-right">
            <div className="text-[#E6F2EF]/50 font-black tracking-widest text-xs mb-1">ROUND {round}</div>
            {/* Color changes to simulate time running out */}
            <div className="text-3xl font-mono font-bold text-[#F4D935] drop-shadow-[0_0_15px_rgba(244,217,53,0.5)] animate-pulse">
              00:42
            </div>
          </div>
        </div>

        {/* HUD with Battlefield */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 mb-12 items-center">
          {/* Player 1 HUD */}
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-5 rounded-2xl border-2 border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(93,191,126,0.05)] relative overflow-hidden group hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--color-primary)] text-[var(--color-surface)] font-black text-[10px] tracking-widest rounded-bl-2xl shadow-[0_0_10px_rgba(93,191,126,0.3)]">COMMANDER</div>
            <img src="/assets/treasury_icon.png" alt="Treasury" className="absolute top-2 right-16 w-8 h-8 opacity-50 drop-shadow-[0_0_10px_rgba(93,191,126,0.5)] animate-pulse" />
            <h2 className="text-lg md:text-xl font-black text-white mb-4 tracking-widest">YOUR COMMAND CENTER</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#050D0C] p-2.5 rounded-lg border border-[#5DBF7E]/20">
                <span className="flex items-center gap-2 text-[#5DBF7E] font-bold text-xs tracking-widest"><TrendingUp size={16}/> TREASURY</span>
                <span className="text-white font-mono text-lg font-bold">0.023 yield</span>
              </div>
              <div className="flex justify-between items-center bg-[#050D0C] p-2.5 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[#4DA3FF] font-bold text-xs tracking-widest"><Shield size={16}/> SHIELD</span>
                <span className="text-white font-mono text-lg font-bold">40%</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-3">
                <span className="text-[var(--color-text)]/40 font-bold tracking-widest text-[10px]">RANK</span>
                <div className="flex items-center gap-1.5 border border-[var(--color-warning)]/30 px-2 py-0.5 rounded bg-[var(--color-warning)]/10 shadow-[0_0_10px_rgba(255,210,74,0.2)]">
                  <img src="/assets/rank_medal_gold.png" alt="Gold Medal" className="w-4 h-4 object-contain" />
                  <span className="text-[var(--color-warning)] font-black tracking-widest text-xs">TIER III</span>
                </div>
              </div>
            </div>
          </div>

          {/* Battlefield Middle */}
          <div className="hidden md:flex flex-col items-center justify-center px-4 relative">
            <div className="text-[var(--color-attack)] font-black text-xl animate-pulse tracking-[0.3em] mb-4 drop-shadow-[0_0_10px_rgba(255,10,120,0.8)]">VS</div>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-[2px] h-12 bg-gradient-to-b from-[var(--color-primary)] to-transparent rounded-full opacity-60"></div>
              
              {/* 3D Energy Core representation */}
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-attack)]/40 shadow-[0_0_30px_rgba(255,10,120,0.5)] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-[var(--color-attack)] animate-ping opacity-30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-[var(--color-defense)] border-dashed animate-[spin_4s_linear_infinite] opacity-50"></div>
                <img src="/assets/attack_icon.png" alt="Core" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(255,10,120,1)] z-10 animate-pulse" />
              </div>

              <div className="w-[2px] h-12 bg-gradient-to-t from-[var(--color-attack)] to-transparent rounded-full opacity-60"></div>
            </div>
            
            {/* Glowing lines connecting to HUDs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-[1px] bg-gradient-to-r from-[var(--color-primary)]/50 via-[var(--color-attack)]/50 to-[var(--color-attack)]/50 -z-10 opacity-30"></div>
          </div>

          {/* Player 2 HUD */}
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-5 rounded-2xl border-2 border-[var(--color-attack)]/20 shadow-[0_0_20px_rgba(255,10,120,0.05)] relative overflow-hidden group hover:border-[var(--color-attack)]/40 transition-colors">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--color-attack)] text-[var(--color-text)] font-black text-[10px] tracking-widest rounded-bl-2xl shadow-[0_0_10px_rgba(255,10,120,0.3)]">VETERAN</div>
            <img src="/assets/treasury_icon.png" alt="Treasury" className="absolute top-2 right-16 w-8 h-8 opacity-50 drop-shadow-[0_0_10px_rgba(255,10,120,0.5)] animate-pulse" />
            <h2 className="text-lg md:text-xl font-black text-white mb-4 tracking-widest">ENEMY TREASURY</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0A0507] p-2.5 rounded-lg border border-[#FF4D6D]/20">
                <span className="flex items-center gap-2 text-[#FF4D6D] font-bold text-xs tracking-widest"><TrendingUp size={16}/> TREASURY</span>
                <span className="text-white font-mono text-lg font-bold">0.019 yield</span>
              </div>
              <div className="flex justify-between items-center bg-[#0A0507] p-2.5 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[#4DA3FF] font-bold text-xs tracking-widest"><Shield size={16}/> SHIELD</span>
                <span className="text-white font-mono text-lg font-bold">0%</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-3">
                <span className="text-[var(--color-text)]/40 font-bold tracking-widest text-[10px]">RANK</span>
                <div className="flex items-center gap-1.5 border border-[var(--color-warning)]/30 px-2 py-0.5 rounded bg-[var(--color-warning)]/10 shadow-[0_0_10px_rgba(255,210,74,0.2)]">
                  <img src="/assets/rank_medal_bronze.png" alt="Bronze Medal" className="w-4 h-4 object-contain" />
                  <span className="text-[var(--color-warning)] font-black tracking-widest text-xs">TIER II</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Allocator */}
        <div className="bg-[#0A1A18] p-6 md:p-8 rounded-2xl border-2 border-[#5DBF7E]/20 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#5DBF7E] text-[#102E2B] px-6 py-1 rounded-b-2xl font-black tracking-[0.2em] text-xs shadow-[0_0_15px_rgba(0,242,138,0.4)]">
            ALLOCATE RESOURCES
          </div>
          
          <div className="space-y-6 mt-6">
            {/* Attack Slider */}
            <div className="flex flex-col gap-2 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 text-[#FF4D6D] font-black tracking-[0.2em] text-lg md:text-xl drop-shadow-[0_0_15px_rgba(255,77,109,0.8)]">
                  <Zap size={22}/> ATTACK
                </div>
                <div className="text-2xl md:text-3xl font-mono font-black text-[#FF4D6D] drop-shadow-[0_0_10px_rgba(255,77,109,0.5)]">{attackPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={attackPct} 
                onChange={(e) => handleSliderChange(setAttackPct, parseInt(e.target.value))}
                className="w-full h-4 md:h-5 bg-[#1A0A0E] border border-[#FF4D6D]/30 rounded-full appearance-none cursor-pointer accent-[#FF4D6D] hover:shadow-[0_0_20px_rgba(255,77,109,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #FF4D6D ${attackPct}%, #1A0A0E ${attackPct}%)` }}
              />
            </div>

            {/* Defend Slider */}
            <div className="flex flex-col gap-2 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 text-[#4DA3FF] font-black tracking-[0.2em] text-lg md:text-xl drop-shadow-[0_0_15px_rgba(77,163,255,0.8)]">
                  <Shield size={22}/> DEFEND
                </div>
                <div className="text-2xl md:text-3xl font-mono font-black text-[#4DA3FF] drop-shadow-[0_0_10px_rgba(77,163,255,0.5)]">{defendPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={defendPct} 
                onChange={(e) => handleSliderChange(setDefendPct, parseInt(e.target.value))}
                className="w-full h-4 md:h-5 bg-[#05101A] border border-[#4DA3FF]/30 rounded-full appearance-none cursor-pointer accent-[#4DA3FF] hover:shadow-[0_0_20px_rgba(77,163,255,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #4DA3FF ${defendPct}%, #05101A ${defendPct}%)` }}
              />
            </div>

            {/* Invest Slider */}
            <div className="flex flex-col gap-2 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 text-[#5DBF7E] font-black tracking-[0.2em] text-lg md:text-xl drop-shadow-[0_0_15px_rgba(93,191,126,0.8)]">
                  <TrendingUp size={22}/> INVEST
                </div>
                <div className="text-2xl md:text-3xl font-mono font-black text-[#5DBF7E] drop-shadow-[0_0_10px_rgba(0,242,138,0.5)]">{investPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={investPct} 
                onChange={(e) => handleSliderChange(setInvestPct, parseInt(e.target.value))}
                className="w-full h-4 md:h-5 bg-[#05130D] border border-[#5DBF7E]/30 rounded-full appearance-none cursor-pointer accent-[#00F28A] hover:shadow-[0_0_20px_rgba(0,242,138,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #00F28A ${investPct}%, #05130D ${investPct}%)` }}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-[#5DBF7E]/20 pt-6 gap-6">
            <div className="flex flex-col w-full md:w-auto">
              <div className={`text-2xl md:text-3xl font-black tracking-[0.2em] ${total === 100 ? 'text-[#00F28A] drop-shadow-[0_0_15px_rgba(0,242,138,0.8)]' : 'text-[#FF4D6D] drop-shadow-[0_0_15px_rgba(255,77,109,0.8)]'}`}>
                TOTAL: <span className="font-mono">{total}%</span> {total === 100 ? '✅' : <AlertTriangle className="inline text-[#FF4D6D] ml-2 mb-1 animate-pulse" size={24}/>}
              </div>
              {/* Psychological suspense text */}
              <div className="text-[#FF4D6D] font-bold mt-3 animate-pulse text-xs md:text-sm tracking-[0.1em] md:tracking-[0.2em] bg-[#FF4D6D]/10 py-1.5 px-3 rounded border border-[#FF4D6D]/20 inline-block w-fit">
                ⚠ ENEMY COMMITTED. WAITING ON YOU.
              </div>
            </div>
            
            <button 
              disabled={total !== 100}
              className="btn-cyber w-full md:w-auto bg-[var(--color-surface)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:border-gray-800 disabled:bg-gray-900 disabled:text-gray-600 text-[var(--color-primary)] hover:text-[var(--color-surface)] px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black tracking-[0.2em] text-lg shadow-[0_0_20px_rgba(93,191,126,0.2)] disabled:shadow-none"
            >
              COMMIT ALLOCATION →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
