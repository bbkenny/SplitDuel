'use client'

import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import autosplitLogo from '@/public/autosplit-logo.png'
import { SplitIcon, VaultIcon } from '@/components/icons'

export const Navbar = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#031F1C] backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#2FD07A] rounded-xl shadow-lg shadow-[#2FD07A]/30 flex items-center justify-center">
          <Image src={autosplitLogo} alt="AutoSplit Logo" width={28} height={28} className="drop-shadow-[0_0_8px_rgba(47,208,122,0.6)]" />
        </div>
        <span className="hidden sm:block text-xl font-bold text-[var(--foreground)] transition-colors">AutoSplit</span>
      </div>

      <div className="flex items-center gap-4">
        {mounted && (
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#F4D935]" /> : <Moon className="w-5 h-5 text-[#E6F2EF]" />}
          </button>
        )}
        <appkit-button />
      </div>
    </nav>
  )
}