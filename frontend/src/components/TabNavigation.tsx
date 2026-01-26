'use client'

import React from 'react'
import { Gift, Trophy, User, History } from 'lucide-react'

type Tab = 'claim' | 'leaderboard' | 'history' | 'profile'

interface TabNavigationProps {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
}

export const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  const tabs = [
    { id: 'claim', label: 'Claim', icon: Gift },
    { id: 'leaderboard', label: 'Leaders', icon: Trophy },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-[#B0A5D0]/20 rounded-3xl p-2 shadow-2xl z-50">
      <div className="flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 py-3 px-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[#442F8C] text-white shadow-lg shadow-[#442F8C]/20 scale-105' 
                  : 'text-[#B0A5D0] hover:bg-[#F8F7FF] hover:text-[#442F8C]'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
