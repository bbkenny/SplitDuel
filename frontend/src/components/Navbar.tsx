'use client'

import React from 'react'
import { Cat } from 'lucide-react'

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#B0A5D0]/30 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#442F8C] rounded-xl">
          <Cat className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-[#442F8C]">Cat Daily</span>
      </div>
      
      <div className="flex items-center gap-4">
        <appkit-button />
      </div>
    </nav>
  )
}
