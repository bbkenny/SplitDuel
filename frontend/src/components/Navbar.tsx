'use client'

import React, { useEffect, useState } from 'react'
import { Cat, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="flex items-center justify-between px-6 py-6 bg-transparent">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[#442F8C] rounded-xl shadow-lg shadow-[#442F8C]/20">
          <Cat className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-[var(--foreground)] transition-colors">
          Cat Daily
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/5 transition-colors backdrop-blur-sm cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#EAE6F5]" />
            ) : (
              <Moon className="w-5 h-5 text-[#442F8C]" />
            )}
          </button>
        )}
        <appkit-button />
      </div>
    </nav>
  )
}
