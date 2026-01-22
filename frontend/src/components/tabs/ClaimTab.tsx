'use client'

import React from 'react'
import { Gift } from 'lucide-react'

export const ClaimTab = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl">
      <div className="p-6 bg-[#F8F7FF] rounded-full">
        <Gift className="w-16 h-16 text-[#442F8C]" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[#442F8C]">Daily Rewards</h2>
        <p className="text-[#B0A5D0] font-medium">Claim your daily $CAT tokens and build your streak!</p>
      </div>
      
      <button className="w-full py-4 bg-[#442F8C] hover:bg-[#322269] text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-[#442F8C]/20">
        Claim 100 $CAT
      </button>
      
      <div className="flex gap-4 w-full">
        <div className="flex-1 p-4 bg-[#F8F7FF] rounded-2xl text-center border border-[#B0A5D0]/10">
          <div className="text-sm text-[#B0A5D0]">Current Streak</div>
          <div className="text-xl font-bold text-[#442F8C]">5 Days</div>
        </div>
        <div className="flex-1 p-4 bg-[#F8F7FF] rounded-2xl text-center border border-[#B0A5D0]/10">
          <div className="text-sm text-[#B0A5D0]">Next Claim</div>
          <div className="text-xl font-bold text-[#442F8C]">23:59:59</div>
        </div>
      </div>
    </div>
  )
}
