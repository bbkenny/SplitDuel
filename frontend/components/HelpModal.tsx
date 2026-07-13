import React from 'react';

export default function HelpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#050D0C] border border-[#5DBF7E]/40 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(93,191,126,0.15)] flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#050D0C] border-b border-[#5DBF7E]/20 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-black tracking-[0.2em] text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(93,191,126,0.4)] uppercase">
            HOW SPLIT DUEL WORKS
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white font-bold text-xl">✕</button>
        </div>

        {/* Content */}
        <div className="p-8 text-white/80 font-sans space-y-8">
          
          <div className="text-sm text-white/70 leading-relaxed text-center italic border-b border-white/10 pb-6">
            This is the heart of Split Duel. It operates as an elite <strong className="text-[var(--color-primary)]">Programmable Revenue Router</strong>. One Address → Many Outcomes. Instantly split incoming revenue among your team, creators, or DAO, while automatically diverting a percentage into a yield-generating shared treasury. No accountants. No spreadsheets.
          </div>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[var(--color-primary)] pl-3">1. SPLIT MATRIX CONFIGURATIONS</h3>
            <p className="leading-relaxed text-sm mb-4">
              This section replaces traditional static transfers with dynamic routing.
            </p>
            <ul className="space-y-3 pl-4 text-sm">
              <li><strong className="text-white">Add Destination:</strong> Click this to create a new split recipient. You can add as many as you want.</li>
              <li><strong className="text-white">Recipient Address:</strong> Enter the 0x... address for each destination.</li>
              <li><strong className="text-[var(--color-primary)]">Share (%):</strong> Define the exact percentage of the incoming transfer each address should receive. <em>Important: The sum of all splits must exactly equal 100%.</em></li>
              <li><strong className="text-[#FF4D6D]">Vault Toggle (Yield Treasury):</strong> By toggling the switch next to an address, you convert it from a "Direct Transfer" to "Routing to Yield Treasury." This automatically diverts those funds into compound savings instead of sending them to the wallet.</li>
              <li><strong className="text-white">Save On-Chain:</strong> Once configured, clicking this saves your exact split matrix into the smart contract permanently.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[#4DA3FF] pl-3">2. EXECUTE ROUTING</h3>
            <p className="leading-relaxed text-sm">
              <strong className="text-[#4DA3FF]">Route Payment:</strong> Once your rules are saved on-chain, you use this execution panel. Input a total amount and select an asset (CELO or cUSD).
              <br/><br/>
              When you click <strong>Execute Routing</strong>, the smart contract instantly distributes the funds to the various recipients and diverts the specified percentage directly into the Shared Treasury.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-purple-400 pl-3">3. SHARED TREASURY (MOOLA MARKET INTEGRATED)</h3>
            <p className="leading-relaxed text-sm">
              This widget tracks the balances (cUSD and CELO) that you've routed into the compound treasury vault.
              <br/><br/>
              <strong className="text-purple-400">Vault Interactions:</strong> You can manually deposit more funds or withdraw your existing savings anytime. Behind the scenes, the VaultAdapter seamlessly deposits your CELO and ERC20 tokens natively into Moola Market for real, decentralized yield generation while maintaining your 1:1 parity and accounting!
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#050D0C] border-t border-[#5DBF7E]/20 p-6 flex justify-end z-10">
          <button onClick={onClose} className="px-8 py-3 bg-[var(--color-primary)] text-black font-black tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(93,191,126,0.6)] transition-all">
            ACKNOWLEDGE
          </button>
        </div>

      </div>
    </div>
  );
}
