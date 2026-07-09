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
    <div className="min-h-screen bg-gray-950 text-green-400 p-8 font-mono flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-900 border border-green-500/30 rounded-xl p-6 shadow-2xl shadow-green-900/20">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-green-500/30 pb-4 mb-6">
          <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
            SPLIT DUEL
          </h1>
          <div className="text-xl animate-pulse">
            ⏱️ 00:45 <span className="text-sm text-green-500/70">ROUND {round}/5</span>
          </div>
        </div>

        {/* HUD */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Player 1 HUD */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/20">
            <h2 className="text-xl font-bold text-white mb-4">YOU</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><TrendingUp size={16}/> Treasury:</span>
                <span className="text-white font-bold">0.023 yield</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><Shield size={16}/> Shield:</span>
                <span className="text-white font-bold">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">Reputation:</span>
                <span className="text-yellow-400">⭐⭐⭐</span>
              </div>
            </div>
          </div>

          {/* Player 2 HUD */}
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/20 text-red-400">
            <h2 className="text-xl font-bold text-white mb-4">OPPONENT</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><TrendingUp size={16}/> Treasury:</span>
                <span className="text-white font-bold">0.019 yield</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2"><Shield size={16}/> Shield:</span>
                <span className="text-white font-bold">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">Reputation:</span>
                <span className="text-yellow-400">⭐⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Allocator */}
        <div className="bg-gray-800 p-6 rounded-lg border border-green-500/30">
          <h3 className="text-center text-lg mb-6 text-white tracking-widest">ROUND {round} — SET YOUR ALLOCATION</h3>
          
          <div className="space-y-6">
            {/* Attack Slider */}
            <div className="flex items-center gap-4">
              <div className="w-24 flex items-center gap-2 text-red-400 font-bold">
                <Zap size={20}/> ATTACK
              </div>
              <input 
                type="range" min="0" max="100" value={attackPct} 
                onChange={(e) => handleSliderChange(setAttackPct, parseInt(e.target.value))}
                className="flex-1 accent-red-500"
              />
              <div className="w-16 text-right text-red-400">{attackPct}%</div>
            </div>

            {/* Defend Slider */}
            <div className="flex items-center gap-4">
              <div className="w-24 flex items-center gap-2 text-blue-400 font-bold">
                <Shield size={20}/> DEFEND
              </div>
              <input 
                type="range" min="0" max="100" value={defendPct} 
                onChange={(e) => handleSliderChange(setDefendPct, parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <div className="w-16 text-right text-blue-400">{defendPct}%</div>
            </div>

            {/* Invest Slider */}
            <div className="flex items-center gap-4">
              <div className="w-24 flex items-center gap-2 text-green-400 font-bold">
                <TrendingUp size={20}/> INVEST
              </div>
              <input 
                type="range" min="0" max="100" value={investPct} 
                onChange={(e) => handleSliderChange(setInvestPct, parseInt(e.target.value))}
                className="flex-1 accent-green-500"
              />
              <div className="w-16 text-right text-green-400">{investPct}%</div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center border-t border-green-500/20 pt-6">
            <div className={`text-xl font-bold ${total === 100 ? 'text-green-400' : 'text-red-500'}`}>
              TOTAL: {total}% {total === 100 ? '✅' : <AlertTriangle className="inline text-red-500 ml-2" size={20}/>}
            </div>
            
            <button 
              disabled={total !== 100}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-3 rounded font-bold tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(74,222,128,0.4)] disabled:shadow-none"
            >
              COMMIT ALLOCATION →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
