'use client';

import React from 'react';
import { Trophy, Swords, Medal } from 'lucide-react';
import { getReputationTier } from './ReputationBadge';

// Mock data for the leaderboard since we don't have a backend indexer yet
const MOCK_LEADERBOARD = [
  { address: '0x853a...f12a', wins: 142, yield: '124.5', streak: 12, fights: 180 },
  { address: '0xC702...b39e', wins: 98, yield: '85.2', streak: 5, fights: 120 },
  { address: '0x4f1B...9c8d', wins: 76, yield: '62.0', streak: 3, fights: 90 },
  { address: '0x9a2C...e4f1', wins: 45, yield: '31.4', streak: 8, fights: 60 },
  { address: '0x3d4E...a5b2', wins: 22, yield: '15.1', streak: 2, fights: 40 },
];

export default function Leaderboard() {
  return (
    <div className="w-full bg-[#111111]/80 backdrop-blur-md border border-[#5DBF7E]/20 rounded-2xl p-6 sm:p-8 mt-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#5DBF7E]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      
      <div className="flex items-center gap-3 mb-8 border-b border-[#5DBF7E]/10 pb-4 relative z-10">
        <Trophy className="w-6 h-6 text-[#F4D935]" />
        <h2 className="text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-[0_0_10px_rgba(244,217,53,0.5)]">
          HALL OF CHAMPIONS
        </h2>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono w-16">RANK</th>
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono">GLADIATOR</th>
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono text-center">TIER</th>
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono text-right">WINS</th>
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono text-right">STREAK</th>
              <th className="pb-4 text-xs font-bold tracking-widest text-white/40 font-mono text-right">YIELD EARNED</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((player, idx) => {
              const tier = getReputationTier(player.fights);
              return (
                <tr 
                  key={player.address}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-black/40 border ${idx === 0 ? 'border-[#F4D935] text-[#F4D935] shadow-[0_0_10px_rgba(244,217,53,0.3)]' : idx === 1 ? 'border-gray-300 text-gray-300' : idx === 2 ? 'border-amber-700 text-amber-700' : 'border-white/10 text-white/40'}`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-mono text-sm text-[#E6F2EF]">{player.address}</span>
                  </td>
                  <td className="py-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/10 bg-black/40 ${tier.color} text-[10px] tracking-widest font-bold`}>
                      <Medal className="w-3 h-3" />
                      {tier.name.toUpperCase()}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-bold text-[#5DBF7E] text-lg">{player.wins}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 text-[#F4D935]">
                      <Swords className="w-3 h-3" />
                      <span className="font-bold font-mono text-sm">{player.streak}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-mono font-bold text-white group-hover:text-[#5DBF7E] transition-colors">{player.yield}</span>
                    <span className="text-white/40 text-xs ml-1 font-sans">CELO</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-[10px] text-white/30 tracking-widest font-mono">
        SEASON 1 ENDS IN 14 DAYS • TOP 10 QUALIFY FOR GRAND TOURNAMENT
      </div>
    </div>
  );
}
