'use client'

import React from 'react'
import { User, Wallet, History, Sparkles } from 'lucide-react'

export const ProfileTab = () => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-[#442F8C] rounded-2xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#442F8C]">My Profile</h2>
            <p className="text-[#B0A5D0] text-sm">Active Claimer</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#B0A5D0]/10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#442F8C]" />
              <span className="text-xs text-[#B0A5D0]">Total Balance</span>
            </div>
            <div className="text-lg font-bold text-[#442F8C]">2,400 $CAT</div>
          </div>
          <div className="p-4 bg-[#F8F7FF] rounded-2xl border border-[#B0A5D0]/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#442F8C]" />
              <span className="text-xs text-[#B0A5D0]">Best Streak</span>
            </div>
            <div className="text-lg font-bold text-[#442F8C]">12 Days</div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[#442F8C]" />
          <h3 className="font-bold text-[#442F8C]">Recent Activity</h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-[#F8F7FF] last:border-0">
              <div>
                <div className="text-sm font-medium text-[#442F8C]">Daily Reward Claimed</div>
                <div className="text-xs text-[#B0A5D0]">24 Jan 2024, 10:45 AM</div>
              </div>
              <div className="text-sm font-bold text-green-600">+100 $CAT</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
