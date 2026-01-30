'use client'

import React from 'react'
import { Cat } from 'lucide-react'

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-6 bg-transparent">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#442F8C] rounded-xl shadow-lg shadow-[#442F8C]/20">
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
