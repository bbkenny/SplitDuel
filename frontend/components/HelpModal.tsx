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
            This interface is the heart of <strong className="text-[var(--color-primary)]">SplitDuel (Yield Tactics)</strong>. It is a 1v1 tactical yield battle game. Players battle across 5 rounds using Attack/Defend/Invest mechanics to win accumulated yield while keeping their principal 100% safe.
          </div>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[var(--color-primary)] pl-3">1. ENTER MATCH</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li><strong className="text-white">Deposit Equal Stake:</strong> Players connect their wallet and deposit an equal stake of CELO, USDm, EURm, USDT, or USDC into the DuelManager.</li>
              <li><strong className="text-[var(--color-primary)]">Lossless Guarantee:</strong> The principal staked is <em>never</em> put at risk. Players only fight for the accumulated yield generated during the match.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[#FF4D6D] pl-3">2. ALLOCATE ROUND (THE CORE STRATEGY)</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li>In each of the 5 rounds, players are presented with three sliders: <strong className="text-[#FF4D6D]">Attack %</strong>, <strong className="text-[#4DA3FF]">Defend %</strong>, and <strong className="text-[var(--color-invest)]">Invest %</strong>.</li>
              <li>The sum of all three sliders must exactly equal 100%.</li>
              <li><strong className="text-white">Commit:</strong> Players submit their allocation secretly on-chain (commit-reveal scheme) so the opponent cannot front-run or see their move.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[#4DA3FF] pl-3">3. VISUAL ROUTING & RESOLUTION</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li>Once both players commit, the reveal phase triggers a <strong className="text-white">Visual Routing Animation</strong>, showing energy flowing from the player to the three vaults.</li>
              <li><strong className="text-white">Combat Mechanics (Rock-Paper-Scissors logic):</strong>
                <ul className="pl-5 mt-2 space-y-1 text-white/60">
                  <li><strong>Attack</strong> vs <strong>Defend</strong>: Blocked — attack wasted.</li>
                  <li><strong>Attack</strong> vs <strong>Invest</strong>: Hit — drain a % of their yield gain this round.</li>
                  <li><strong>Invest</strong> vs <strong>Invest</strong>: Both grow cleanly.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[var(--color-warning)] pl-3">4. WINNER TAKES YIELD</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li>After 5 rounds, the player with the higher treasury score wins the accumulated yield (the prize pool).</li>
              <li>Both players instantly receive their initial principal back intact.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-purple-400 pl-3">5. DAILY SPLIT POOL & REPUTATION</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li><strong className="text-purple-400">Daily Pool:</strong> Alongside 1v1 duels, there is a Daily Split Pool where the top 10% most efficient allocators share the daily yield.</li>
              <li><strong className="text-purple-400">Reputation Buffs:</strong> Completing fights earns reputation, granting small % efficiency buffs (e.g., Novice to Legend).</li>
            </ul>
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
