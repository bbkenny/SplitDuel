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
    <div className="min-h-screen bg-[#021312] p-4 md:p-8 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,138,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,138,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,242,138,0.05)_0%,rgba(2,19,18,1)_70%)] pointer-events-none" />

      <div className="w-full max-w-5xl bg-[#102E2B]/80 backdrop-blur-xl border border-[#5DBF7E]/30 rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(93,191,126,0.1)] relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#5DBF7E]/20 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(93,191,126,0.6)] flex items-center gap-3">
              SPLIT DUEL
            </h1>
            <div className="text-[#5DBF7E]/60 text-xs font-bold tracking-widest mt-2">SECURE BATTLEFIELD LINK ESTABLISHED</div>
          </div>
          <div className="text-right">
            <div className="text-[#E6F2EF]/50 font-black tracking-widest text-sm mb-1">ROUND {round}</div>
            {/* Color changes to simulate time running out */}
            <div className="text-4xl font-mono font-bold text-[#F4D935] drop-shadow-[0_0_15px_rgba(244,217,53,0.5)] animate-pulse">
              00:42
            </div>
          </div>
        </div>

        {/* HUD with Battlefield */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 mb-12 items-center">
          {/* Player 1 HUD */}
          <div className="bg-[#0A1A18] p-6 rounded-xl border-2 border-[#00F28A]/30 shadow-[0_0_30px_rgba(0,242,138,0.1)] relative overflow-hidden group hover:border-[#00F28A]/60 transition-colors">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#00F28A] text-[#102E2B] font-black text-xs tracking-widest rounded-bl-lg shadow-[0_0_10px_rgba(0,242,138,0.5)]">COMMANDER</div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-6 tracking-widest">YOUR COMMAND CENTER</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#050D0C] p-3 rounded-lg border border-[#5DBF7E]/20">
                <span className="flex items-center gap-2 text-[#5DBF7E] font-bold text-sm tracking-widest"><TrendingUp size={18}/> TREASURY</span>
                <span className="text-white font-mono text-xl font-bold">0.023 yield</span>
              </div>
              <div className="flex justify-between items-center bg-[#050D0C] p-3 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[#4DA3FF] font-bold text-sm tracking-widest"><Shield size={18}/> SHIELD</span>
                <span className="text-white font-mono text-xl font-bold">40%</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-4">
                <span className="text-[#E6F2EF]/40 font-bold tracking-widest text-xs">RANK</span>
                <span className="text-[#F4D935] font-black tracking-widest border border-[#F4D935]/30 px-3 py-1 rounded bg-[#F4D935]/10 text-sm shadow-[0_0_10px_rgba(244,217,53,0.2)]">TIER III</span>
              </div>
            </div>
          </div>

          {/* Battlefield Middle */}
          <div className="hidden md:flex flex-col items-center justify-center px-4 relative">
            <div className="text-[#FF4D6D] font-black text-2xl animate-pulse tracking-[0.3em] mb-6 drop-shadow-[0_0_10px_rgba(255,77,109,0.8)]">VS</div>
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="w-[2px] h-16 bg-gradient-to-b from-[#00F28A] to-transparent rounded-full opacity-60"></div>
              <div className="p-3 rounded-full bg-[#1A0A0E] border border-[#FF4D6D]/30 shadow-[0_0_20px_rgba(255,77,109,0.4)] relative">
                <div className="absolute inset-0 rounded-full border border-[#FF4D6D] animate-ping opacity-20"></div>
                <Zap className="text-[#FF4D6D] drop-shadow-[0_0_10px_rgba(255,77,109,1)]" size={28} />
              </div>
              <div className="w-[2px] h-16 bg-gradient-to-t from-[#FF4D6D] to-transparent rounded-full opacity-60"></div>
            </div>
            
            {/* Glowing lines connecting to HUDs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-[1px] bg-gradient-to-r from-[#00F28A]/50 via-[#FF4D6D]/50 to-[#FF4D6D]/50 -z-10 opacity-30"></div>
          </div>

          {/* Player 2 HUD */}
          <div className="bg-[#1A0A0E]/80 p-6 rounded-xl border-2 border-[#FF4D6D]/30 shadow-[0_0_30px_rgba(255,77,109,0.1)] relative overflow-hidden group hover:border-[#FF4D6D]/60 transition-colors">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#FF4D6D] text-white font-black text-xs tracking-widest rounded-bl-lg shadow-[0_0_10px_rgba(255,77,109,0.5)]">VETERAN</div>
            <h2 className="text-xl md:text-2xl font-black text-white mb-6 tracking-widest">ENEMY TREASURY</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#0A0507] p-3 rounded-lg border border-[#FF4D6D]/20">
                <span className="flex items-center gap-2 text-[#FF4D6D] font-bold text-sm tracking-widest"><TrendingUp size={18}/> TREASURY</span>
                <span className="text-white font-mono text-xl font-bold">0.019 yield</span>
              </div>
              <div className="flex justify-between items-center bg-[#0A0507] p-3 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[#4DA3FF] font-bold text-sm tracking-widest"><Shield size={18}/> SHIELD</span>
                <span className="text-white font-mono text-xl font-bold">0%</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-4">
                <span className="text-[#E6F2EF]/40 font-bold tracking-widest text-xs">RANK</span>
                <span className="text-[#F4D935] font-black tracking-widest border border-[#F4D935]/30 px-3 py-1 rounded bg-[#F4D935]/10 text-sm shadow-[0_0_10px_rgba(244,217,53,0.2)]">TIER II</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Allocator */}
        <div className="bg-[#0A1A18] p-6 md:p-10 rounded-xl border-2 border-[#5DBF7E]/30 relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#5DBF7E] text-[#102E2B] px-8 py-1.5 rounded-b-xl font-black tracking-[0.2em] text-xs md:text-sm shadow-[0_0_20px_rgba(0,242,138,0.6)]">
            ALLOCATE RESOURCES
          </div>
          
          <div className="space-y-10 mt-8">
            {/* Attack Slider */}
            <div className="flex flex-col gap-3 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3 text-[#FF4D6D] font-black tracking-[0.2em] text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(255,77,109,0.8)]">
                  <Zap size={28}/> ATTACK
                </div>
                <div className="text-4xl font-mono font-black text-[#FF4D6D] drop-shadow-[0_0_10px_rgba(255,77,109,0.5)]">{attackPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={attackPct} 
                onChange={(e) => handleSliderChange(setAttackPct, parseInt(e.target.value))}
                className="w-full h-6 bg-[#1A0A0E] border border-[#FF4D6D]/30 rounded-full appearance-none cursor-pointer accent-[#FF4D6D] hover:shadow-[0_0_20px_rgba(255,77,109,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #FF4D6D ${attackPct}%, #1A0A0E ${attackPct}%)` }}
              />
            </div>

            {/* Defend Slider */}
            <div className="flex flex-col gap-3 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3 text-[#4DA3FF] font-black tracking-[0.2em] text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(77,163,255,0.8)]">
                  <Shield size={28}/> DEFEND
                </div>
                <div className="text-4xl font-mono font-black text-[#4DA3FF] drop-shadow-[0_0_10px_rgba(77,163,255,0.5)]">{defendPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={defendPct} 
                onChange={(e) => handleSliderChange(setDefendPct, parseInt(e.target.value))}
                className="w-full h-6 bg-[#05101A] border border-[#4DA3FF]/30 rounded-full appearance-none cursor-pointer accent-[#4DA3FF] hover:shadow-[0_0_20px_rgba(77,163,255,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #4DA3FF ${defendPct}%, #05101A ${defendPct}%)` }}
              />
            </div>

            {/* Invest Slider */}
            <div className="flex flex-col gap-3 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3 text-[#5DBF7E] font-black tracking-[0.2em] text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(93,191,126,0.8)]">
                  <TrendingUp size={28}/> INVEST
                </div>
                <div className="text-4xl font-mono font-black text-[#5DBF7E] drop-shadow-[0_0_10px_rgba(0,242,138,0.5)]">{investPct}%</div>
              </div>
              <input 
                type="range" min="0" max="100" value={investPct} 
                onChange={(e) => handleSliderChange(setInvestPct, parseInt(e.target.value))}
                className="w-full h-6 bg-[#05130D] border border-[#5DBF7E]/30 rounded-full appearance-none cursor-pointer accent-[#00F28A] hover:shadow-[0_0_20px_rgba(0,242,138,0.8)] transition-all relative z-20"
                style={{ background: `linear-gradient(to right, #00F28A ${investPct}%, #05130D ${investPct}%)` }}
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t border-[#5DBF7E]/20 pt-8 gap-8">
            <div className="flex flex-col w-full md:w-auto">
              <div className={`text-3xl md:text-4xl font-black tracking-[0.2em] ${total === 100 ? 'text-[#00F28A] drop-shadow-[0_0_15px_rgba(0,242,138,0.8)]' : 'text-[#FF4D6D] drop-shadow-[0_0_15px_rgba(255,77,109,0.8)]'}`}>
                TOTAL: <span className="font-mono">{total}%</span> {total === 100 ? '✅' : <AlertTriangle className="inline text-[#FF4D6D] ml-2 mb-2 animate-pulse" size={32}/>}
              </div>
              {/* Psychological suspense text */}
              <div className="text-[#FF4D6D] font-bold mt-4 animate-pulse text-sm md:text-base tracking-[0.1em] md:tracking-[0.2em] bg-[#FF4D6D]/10 py-2 px-4 rounded border border-[#FF4D6D]/20 inline-block w-fit">
                ⚠ ENEMY COMMITTED. WAITING ON YOU.
              </div>
            </div>
            
            <button 
              disabled={total !== 100}
              className="w-full md:w-auto bg-[#102E2B] border-2 border-[#00F28A] hover:bg-[#00F28A] disabled:border-gray-800 disabled:bg-gray-900 disabled:text-gray-600 text-[#00F28A] hover:text-[#102E2B] px-8 md:px-12 py-5 md:py-6 rounded-xl font-black tracking-[0.2em] text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(0,242,138,0.4)] hover:shadow-[0_0_50px_rgba(0,242,138,0.8)] disabled:shadow-none"
            >
              COMMIT ALLOCATION →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
