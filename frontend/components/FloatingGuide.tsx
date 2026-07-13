"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

export default function FloatingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#2FD07A] text-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-[#F4D935]/30 group"
      >
        <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
          >
            {/* Overlay to close when clicking outside on mobile */}
            <div 
              className="absolute inset-0 sm:hidden" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full sm:w-[450px] h-full bg-[#031F1C] border-l border-[#2FD07A]/20 shadow-2xl relative z-10 flex flex-col"
            >
              <div className="p-6 border-b border-[#2FD07A]/20 flex justify-between items-center bg-black/30 backdrop-blur-md">
                <h2 className="text-2xl font-black gradient-text tracking-tight">How Split Duel Works</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8 text-[#E6F2EF]">
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-lg text-[#7FA9A3] leading-relaxed">
                    This interface is the heart of <strong className="text-[#2FD07A]">SplitDuel (Yield Tactics)</strong>. It is a 1v1 tactical yield battle game. Players battle across 5 rounds using Attack/Defend/Invest mechanics to win accumulated yield while keeping their principal 100% safe.
                  </p>
                  
                  <p className="font-bold text-white mt-4">Here is a step-by-step breakdown of how to interact with it:</p>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">1. Enter Match</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li><strong className="text-white">Deposit Equal Stake:</strong> Players connect their wallet and deposit an equal stake of CELO, USDm, EURm, USDT, or USDC into the DuelManager.</li>
                    <li><strong className="text-[#2FD07A]">Lossless Guarantee:</strong> The principal staked is <em>never</em> put at risk. Players only fight for the accumulated yield generated during the match.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">2. Allocate Round (The Core Strategy)</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li>In each of the 5 rounds, players are presented with three sliders: <strong className="text-red-400">Attack %</strong>, <strong className="text-blue-400">Defend %</strong>, and <strong className="text-yellow-400">Invest %</strong>.</li>
                    <li>The sum of all three sliders must exactly equal 100%.</li>
                    <li><strong className="text-white">Commit:</strong> Players submit their allocation secretly on-chain (commit-reveal scheme) so the opponent cannot front-run or see their move.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">3. Visual Routing & Resolution</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li>Once both players commit, the reveal phase triggers a <strong className="text-white">Visual Routing Animation</strong>, showing energy flowing from the player to the three vaults.</li>
                    <li><strong className="text-white">Combat Mechanics (Rock-Paper-Scissors logic):</strong>
                      <ul className="pl-5 mt-2 space-y-1 text-white/60 list-disc">
                        <li><strong>Attack</strong> vs <strong>Defend</strong>: Blocked — attack wasted.</li>
                        <li><strong>Attack</strong> vs <strong>Invest</strong>: Hit — drain a % of their yield gain this round.</li>
                        <li><strong>Invest</strong> vs <strong>Invest</strong>: Both grow cleanly.</li>
                      </ul>
                    </li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">4. Winner Takes Yield</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li>After 5 rounds, the player with the higher treasury score wins the accumulated yield (the prize pool).</li>
                    <li>Both players instantly receive their initial principal back intact.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">5. Daily Split Pool & Reputation</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li><strong className="text-[#F4D935]">Daily Pool:</strong> Alongside 1v1 duels, there is a Daily Split Pool where the top 10% most efficient allocators share the daily yield.</li>
                    <li><strong className="text-[#F4D935]">Reputation Buffs:</strong> Completing fights earns reputation, granting small % efficiency buffs (e.g., Novice to Legend).</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-black/30">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-[#2FD07A]/10 hover:bg-[#2FD07A]/20 text-[#2FD07A] font-bold rounded-xl transition-all border border-[#2FD07A]/20"
                >
                  Got it, let's go!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
