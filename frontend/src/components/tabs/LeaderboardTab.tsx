'use client'

import React from 'react'
import { Trophy, Medal } from 'lucide-react'

const MOCK_LEADERS = [
  { address: '0x1234...5678', score: '12,500 $CAT', rank: 1 },
  { address: '0xABCD...EF01', score: '10,200 $CAT', rank: 2 },
  { address: '0x9876...5432', score: '8,900 $CAT', rank: 3 },
  { address: '0xWXYZ...9999', score: '7,500 $CAT', rank: 4 },
  { address: '0xKLMN...4444', score: '6,200 $CAT', rank: 5 },
]

export const LeaderboardTab = () => {
  return (
    <div className="flex flex-col p-6 space-y-6 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl">
      <div className="flex items-center gap-3">
        <Trophy className="w-6 h-6 text-[#442F8C]" />
        <h2 className="text-xl font-bold text-[#442F8C]">Leaderboard</h2>
      </div>

      <div className="space-y-3">
        {MOCK_LEADERS.map((leader) => (
          <div key={leader.rank} className="flex items-center justify-between p-4 bg-[#F8F7FF] rounded-2xl border border-[#B0A5D0]/10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center font-bold text-[#442F8C]">
                {leader.rank <= 3 ? <Medal className={`w-6 h-6 ${leader.rank === 1 ? 'text-yellow-500' : leader.rank === 2 ? 'text-slate-400' : 'text-amber-600'}`} /> : leader.rank}
              </div>
              <span className="font-mono text-[#442F8C]">{leader.address}</span>
            </div>
            <span className="font-bold text-[#442F8C]">{leader.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
