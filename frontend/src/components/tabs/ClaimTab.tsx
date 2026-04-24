'use client'

import React, { useEffect, useState } from 'react'
import { Gift, Timer, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/constants'
import { ethers } from 'ethers'

// AutoSplit Router ABI (simplified - replace with actual ABI)
const AUTO_SPLIT_ABI = [
  "function canClaim(address) view returns (bool)",
  "function nextClaimTime(address) view returns (uint256)",
  "function handleClaim() external",
  "function getStreak(address) view returns (uint256)"
]

export const AutoSplitContext = React.createContext(null)

export function AutoSplitProvider({ children, address }) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress
  const [state, setState] = useState({
    canClaim: false,
    nextClaimTime: null,
    isClaiming: false,
    isConfirming: false,
    isConfirmed: false,
    error: null,
    streak: 0
  })

  const refetchStatus = async () => {
    if (!targetAddress) return
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(targetAddress, AUTO_SPLIT_ABI, provider)
      const [canClaim, nextClaim, streak] = await Promise.all([
        contract.canClaim(targetAddress),
        contract.nextClaimTime(targetAddress),
        contract.getStreak(targetAddress)
      ])
      setState(prev => ({ ...prev, canClaim, nextClaimTime: nextClaim.toNumber() ? new Date(nextClaim.toNumber() * 1000) : null, streak }))
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }))
    }
  }

  const handleClaim = async () => {
    if (!targetAddress) return
    setState(prev => ({ ...prev, isClaiming: true, error: null }))
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(targetAddress, AUTO_SPLIT_ABI, signer)
      const tx = await contract.handleClaim()
      await tx.wait()
      setState(prev => ({ ...prev, isConfirming: true }))
      await new Promise(r => setTimeout(r, 2000))
      setState(prev => ({ ...prev, isConfirmed: true, isClaiming: false }))
      await refetchStatus()
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, isClaiming: false }))
    }
  }

  useEffect(() => {
    refetchStatus()
  }, [targetAddress])

  return (
    <AutoSplitContext.Provider value={{ ...state, handleClaim, refetchStatus }}>
      {children}
    </AutoSplitContext.Provider>
  )
}

export const useAutoSplit = () => {
  const context = React.useContext(AutoSplitContext)
  if (!context) {
    throw new Error('useAutoSplit must be used within AutoSplitProvider')
  }
  return context
}

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
    refetchStatus,
    streak
  } = useAutoSplit()

  const [timeLeft, setTimeLeft] = useState('')

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
          Connect your wallet to start claiming daily $CAT tokens!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-[#F3F0FF] rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10 text-[#442F8C]" strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#442F8C]">AutoSplit Claims</h2>
            <p className="text-sm text-[#B0A5D0] font-medium leading-relaxed max-w-[240px]">
              Claim your split rewards and build your streak!
            </p>
          </div>
        </div>

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
                <span>Claim Split Reward</span>
              )}
            </button>
          ) : (
            <button disabled className="w-full bg-[#EAE6F5] text-[#B0A5D0] font-bold py-4 rounded-2xl cursor-not-allowed">
              Claimed
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-[#F8F7FF] rounded-2xl p-4 text-center border border-[#EAE6F5]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#B0A5D0] mb-1">Current Streak</p>
            <p className="text-xl font-black text-[#442F8C]">{streak || 0} Days</p>
          </div>
          <div className="bg-[#F8F7FF] rounded-2xl p-4 text-center border border-[#EAE6F5]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#B0A5D0] mb-1">Next Claim</p>
            <p className="text-xl font-black text-[#442F8C] font-mono tracking-tight">
              {canClaim ? 'Now' : timeLeft || '...'}
            </p>
          </div>
        </div>

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
    </div>
  )
}