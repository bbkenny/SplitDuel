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
    <div className="flex flex-col items-center p-6 space-y-8 bg-white rounded-3xl border border-[#B0A5D0]/20 shadow-xl min-h-[400px]">
      
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-[#442F8C] tracking-tight">
          Daily Reward
        </h1>
        <p className="text-[#B0A5D0] font-medium">
          Claim 100 $CAT every 24 hours
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-xs">
        {canClaim ? (
          <button
            onClick={() => handleClaim()}
            disabled={isClaiming || isConfirming}
            className="group relative w-full overflow-hidden rounded-2xl bg-[#442F8C] p-1 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            <div className="relative flex items-center justify-center gap-3 rounded-xl bg-[#442F8C] py-4 px-8 text-white transition-all group-hover:bg-[#5338A8]">
              {isClaiming || isConfirming ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">
                    {isClaiming ? 'Signing...' : 'Confirming...'}
                  </span>
                </>
              ) : (
                <>
                  <Gift className="w-6 h-6 animate-bounce" />
                  <span className="font-bold text-lg">Claim Reward</span>
                </>
              )}
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-[#F8F7FF] rounded-2xl border-2 border-[#B0A5D0]/20">
            <Timer className="w-8 h-8 text-[#B0A5D0] mb-2" />
            <p className="text-sm font-bold text-[#442F8C] uppercase tracking-wide mb-1">
              Next Claim In
            </p>
            <p className="text-2xl font-mono font-black text-[#442F8C]">
              {timeLeft || "Loading..."}
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      <div className="w-full">
        {isConfirmed && (
          <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold block">Success!</span>
              Your 100 $CAT has been sent to your wallet.
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-bold block">Transaction Failed</span>
              {error.message.includes('User denied') 
                ? 'You rejected the transaction.' 
                : 'Something went wrong. Please try again.'}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-1">
        <p className="text-xs text-[#B0A5D0] font-medium">
          Contract: <span className="font-mono bg-[#F8F7FF] px-1 py-0.5 rounded text-[#442F8C]">0xe7f1...0512</span>
        </p>
      </div>
    </div>
  )
}
