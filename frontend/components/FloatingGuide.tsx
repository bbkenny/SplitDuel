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
                <h2 className="text-2xl font-black gradient-text tracking-tight">How AutoSplit Works</h2>
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
                    This is the heart of <strong>AutoSplit</strong>. It operates as an elite Programmable Revenue Router. One Address → Many Outcomes. Instantly split incoming revenue among your team, creators, or DAO, while automatically diverting a percentage into a yield-generating shared treasury. No accountants. No spreadsheets.
                  </p>
                  
                  <p className="font-bold text-white mt-4">Here is a step-by-step breakdown of how to interact with it:</p>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">1. Split Matrix Configurations</h3>
                  <p className="mb-4 text-[#7FA9A3]">This section replaces traditional static transfers with dynamic routing.</p>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li><strong className="text-white">Add Destination:</strong> Click this to create a new split recipient. You can add as many as you want.</li>
                    <li><strong className="text-white">Recipient Address:</strong> Enter the <code>0x...</code> address for each destination.</li>
                    <li><strong className="text-white">Share (%):</strong> Define the exact percentage of the incoming transfer each address should receive. <em className="text-[#F4D935]">Important:</em> The sum of all splits must exactly equal 100%.</li>
                    <li><strong className="text-white">Vault Toggle (Yield Treasury):</strong> By toggling the switch next to an address, you convert it from a "Direct Transfer" to "Routing to Yield Treasury." This automatically diverts those funds into compound savings instead of sending them to the wallet.</li>
                    <li><strong className="text-white">Save On-Chain:</strong> Once configured, clicking this saves your exact split matrix into the smart contract permanently.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">2. Execute Routing</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li><strong className="text-white">Route Payment:</strong> Once your rules are saved on-chain, you use this execution panel. Input a total amount and select an asset (CELO or cUSD).</li>
                    <li>When you click <strong className="text-white">Execute Routing</strong>, the smart contract instantly distributes the funds to the various recipients and diverts the specified percentage directly into the Shared Treasury.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-[#2FD07A] mt-8 mb-4">3. Shared Treasury (Compound Yield Severance Fund)</h3>
                  <ul className="space-y-3 list-disc pl-5 text-sm">
                    <li>This widget tracks the balances (cUSD and CELO) that you've routed into the compound treasury vault.</li>
                    <li><strong className="text-white">Vault Interactions:</strong> You can manually deposit more funds or withdraw your existing savings anytime. It explicitly states the simulated yield (e.g., 4.5% APY).</li>
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
