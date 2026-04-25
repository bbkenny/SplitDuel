'use client'

import React from 'react'
import { History, CheckCircle2 } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'

export const HistoryTab = () => {
  const { history, isLoading } = useHistory()

  return (
    <div className="flex flex-col p-6 space-y-6 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl min-h-[400px]">
      <div className="flex items-center gap-3 border-b border-[#F8F7FF] pb-4">
        <div className="p-2 bg-[#F8F7FF] rounded-xl">
          <History className="w-6 h-6 text-[#442F8C]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#442F8C]">Claim History</h2>
          <p className="text-xs text-[#B0A5D0] font-medium">Your recent reward activity</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-[#442F8C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[#B0A5D0]">Fetching history...</p>
          </div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#F8F7FF] rounded-2xl border border-[#B0A5D0]/10 hover:border-[#442F8C]/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-green-500 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#442F8C]">Daily Reward</div>
                  <div className="text-[10px] text-[#B0A5D0]">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#442F8C]">+{item.amount}</div>
                <div className="text-[10px] font-bold text-[#B0A5D0]">$CAT</div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <p className="text-[#B0A5D0] font-medium">No history found</p>
            <p className="text-xs text-[#B0A5D0]">Start claiming rewards to see them here!</p>
          </div>
        )}
      </div>
    </div>
  )
}
