'use client'

import React, { useEffect, useState } from 'react'
import { Gift, Timer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useDailyReward } from '@/hooks/useDailyReward'
import { useAccount } from 'wagmi'

export const ClaimTab = () => {
  const { isConnected } = useAccount()
  const { 
    canClaim, 
    nextClaimTime, 
    handleClaim, 
    isClaiming, 
    isConfirming, 
    isConfirmed,
    error,
    refetchStatus
  } = useDailyReward()

  const [timeLeft, setTimeLeft] = useState('')

  // Countdown timer logic
  useEffect(() => {
    if (!nextClaimTime) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = nextClaimTime.getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft('Ready!')
        refetchStatus()
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [nextClaimTime, refetchStatus])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl min-h-[400px]">
        <div className="p-4 bg-[#F8F7FF] rounded-full mb-4">
          <Gift className="w-12 h-12 text-[#B0A5D0]" />
        </div>
        <h2 className="text-xl font-bold text-[#442F8C] mb-2">Connect Wallet</h2>
        <p className="text-[#B0A5D0] text-center max-w-xs">
          Connect your wallet to start claiming daily $CAT rewards!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center space-y-6">
        
        {/* Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-[#F3F0FF] rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10 text-[#442F8C]" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#442F8C]">Daily Rewards</h2>
            <p className="text-sm text-[#B0A5D0] font-medium leading-relaxed max-w-[240px]">
              Claim your daily $CAT tokens and build your streak!
            </p>
          </div>
        </div>

        {/* Claim Button */}
        <div className="w-full">
          {canClaim ? (
            <button
              onClick={() => handleClaim()}
              disabled={isClaiming || isConfirming}
              className="w-full bg-[#442F8C] hover:bg-[#362473] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#442F8C]/30 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isClaiming || isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Claim 100 $CAT</span>
              )}
            </button>
          ) : (
            <button disabled className="w-full bg-[#EAE6F5] text-[#B0A5D0] font-bold py-4 rounded-2xl cursor-not-allowed">
              Claimed
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-[#F8F7FF] rounded-2xl p-4 text-center border border-[#EAE6F5]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#B0A5D0] mb-1">Current Streak</p>
            <p className="text-xl font-black text-[#442F8C]">5 Days</p>
          </div>
          <div className="bg-[#F8F7FF] rounded-2xl p-4 text-center border border-[#EAE6F5]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#B0A5D0] mb-1">Next Claim</p>
            <p className="text-xl font-black text-[#442F8C] font-mono tracking-tight">
              {canClaim ? 'Now' : timeLeft || '...'}
            </p>
          </div>
        </div>

      </div>

      {/* Toast Notifications */}
      {isConfirmed && (
        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg animate-in slide-in-from-bottom-4 fade-in">
          <CheckCircle2 className="w-4 h-4" /> Claim Successful!
        </div>
      )}
      {error && (
        <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg animate-in slide-in-from-bottom-4 fade-in">
          <AlertCircle className="w-4 h-4" /> Failed
        </div>
      )}
    </div>
  )
}
