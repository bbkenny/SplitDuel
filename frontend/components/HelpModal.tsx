import React from 'react';

export default function HelpModal({ isOpen, onClose, durationSecs }: { isOpen: boolean, onClose: () => void, durationSecs?: bigint }) {
  if (!isOpen) return null;

  let formattedDuration = "the duration set in the smart contract";
  if (durationSecs !== undefined) {
    const hrs = Number(durationSecs) / 3600;
    if (hrs >= 24) {
      const days = Math.floor(hrs / 24);
      const remHrs = hrs % 24;
      formattedDuration = `${days} day${days > 1 ? 's' : ''}${remHrs > 0 ? ` and ${remHrs} hour${remHrs > 1 ? 's' : ''}` : ''}`;
    } else {
      formattedDuration = `${hrs} hour${hrs > 1 ? 's' : ''}`;
    }
  }

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
            This interface is the heart of <strong className="text-[var(--color-primary)]">SplitDuel (Yield Tactics)</strong>. It is a Global Yield Pool Tournament where players compete to be the most efficient capital allocators. Each tournament round lasts exactly for the duration set by the live smart contract. Players battle using Attack/Defend/Invest mechanics to win a share of the accumulated yield while keeping their principal 100% safe.
          </div>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[var(--color-primary)] pl-3">1. JOIN A POOL</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li><strong className="text-white">Choose Your Arena:</strong> Players connect their wallet and pick an active token arena from the lobby (e.g., CELO, USDm, USDT).</li>
              <li><strong className="text-[var(--color-primary)]">Lossless Guarantee:</strong> The principal staked is <em>never</em> put at risk. Players only fight for the accumulated yield generated during the round.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[#FF4D6D] pl-3">2. ALLOCATE STRATEGY</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li>You are presented with three sliders: <strong className="text-[#FF4D6D]">Attack %</strong>, <strong className="text-[#4DA3FF]">Defend %</strong>, and <strong className="text-[var(--color-invest)]">Invest %</strong>.</li>
              <li>The sum of all three sliders must exactly equal 100%.</li>
              <li><strong className="text-white">Secret Commit:</strong> Players submit their allocation secretly on-chain exactly once per round. Your opponent cannot front-run or see your move until the reveal.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[#4DA3FF] pl-3">3. ROUND DURATION & SETTLEMENT</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li><strong className="text-white">Live Timer:</strong> A Tournament Round currently lasts exactly <strong className="text-[var(--color-primary)]">{formattedDuration}</strong>. You can watch the real-time countdown on your dashboard.</li>
              <li><strong className="text-white">Settlement:</strong> When the timer hits zero, the pool is settled. The smart contract evaluates everyone's Invest % (efficiency score).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-3 tracking-widest border-l-4 border-[var(--color-warning)] pl-3">4. TOP 10% TAKE THE YIELD</h3>
            <ul className="space-y-3 pl-4 text-sm">
              <li>The Top 10% most efficient allocators (highest Invest %) split the entire yielded prize pool generated across all participants during that round!</li>
              <li>Everyone (both winners and losers) can immediately withdraw their initial principal back completely intact.</li>
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
