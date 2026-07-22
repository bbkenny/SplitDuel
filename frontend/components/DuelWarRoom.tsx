'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Trophy, Shield as ShieldIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatUnits, type Address } from 'viem';
import { useDuelData, useDuelActions } from '@/lib/hooks/useDuel';
import {
  computeCommitHash,
  generateSalt,
  saveCommit,
  loadCommit,
  clearCommit,
} from '@/lib/duelCommit';
import { DuelState, REVEAL_WINDOW, TOTAL_ROUNDS } from '@/lib/duelManager';

const TOKEN_DECIMALS = 18;
const ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

// What the local player still needs to do this round.
type Phase =
  | 'loading'
  | 'commit' // haven't committed my split yet
  | 'awaitOpponentCommit' // I committed, waiting on rival
  | 'reveal' // both committed, I must reveal within the window
  | 'awaitOpponentReveal' // I revealed, waiting on rival
  | 'expired' // window elapsed, someone can be forfeited
  | 'resolving' // routing animation between rounds
  | 'ended'; // duel resolved

function fmt(v: bigint | undefined) {
  if (v === undefined) return '0.0000';
  return Number(formatUnits(v, TOKEN_DECIMALS)).toFixed(4);
}

export default function DuelWarRoom({
  duelId,
  tokenName = 'CELO',
  onBack,
}: {
  duelId: bigint;
  tokenName?: string;
  onBack?: () => void;
}) {
  const { address } = useAccount();
  const { duel, round, refetch } = useDuelData(duelId);
  const {
    commitRound,
    revealRound,
    forfeitRound,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useDuelActions();

  const [attackPct, setAttackPct] = useState(40);
  const [defendPct, setDefendPct] = useState(20);
  const [investPct, setInvestPct] = useState(40);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [routing, setRouting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const prevRoundRef = useRef<number>(0);

  const total = attackPct + defendPct + investPct;
  const busy = isPending || isConfirming;

  // Which side am I? Everything else keys off this.
  const isP1 = !!address && !!duel && address.toLowerCase() === duel.player1.toLowerCase();
  const isP2 = !!address && !!duel && address.toLowerCase() === duel.player2.toLowerCase();
  const isParticipant = isP1 || isP2;

  const myScore = isP1 ? duel?.p1YieldScore : duel?.p2YieldScore;
  const oppScore = isP1 ? duel?.p2YieldScore : duel?.p1YieldScore;
  const myShield = isP1 ? duel?.p1Shield : duel?.p2Shield;
  const oppShield = isP1 ? duel?.p2Shield : duel?.p1Shield;

  const iCommitted = isP1 ? !!round && round.p1Commit !== ZERO : !!round && round.p2Commit !== ZERO;
  const oppCommitted = isP1 ? !!round && round.p2Commit !== ZERO : !!round && round.p1Commit !== ZERO;
  const iRevealed = isP1 ? !!round?.p1Revealed : !!round?.p2Revealed;
  const oppRevealed = isP1 ? !!round?.p2Revealed : !!round?.p1Revealed;

  const bothCommittedAt = round ? Number(round.bothCommittedAt) : 0;
  const windowEndsAt = bothCommittedAt > 0 ? bothCommittedAt + REVEAL_WINDOW : 0;
  const secondsLeft = windowEndsAt > 0 ? Math.max(0, windowEndsAt - now) : REVEAL_WINDOW;
  const windowOpen = windowEndsAt > 0 && now <= windowEndsAt;

  // Derive the current phase from on-chain flags.
  const phase: Phase = useMemo(() => {
    if (!duel) return 'loading';
    if (duel.state === DuelState.Resolved || duel.state === DuelState.Cancelled) return 'ended';
    if (routing) return 'resolving';
    if (!iCommitted) return 'commit';
    if (iCommitted && !oppCommitted) return 'awaitOpponentCommit';
    // both committed from here
    if (!iRevealed) return windowOpen || bothCommittedAt === 0 ? 'reveal' : 'expired';
    if (iRevealed && !oppRevealed) return windowOpen ? 'awaitOpponentReveal' : 'expired';
    return 'resolving';
  }, [duel, routing, iCommitted, oppCommitted, iRevealed, oppRevealed, windowOpen, bothCommittedAt]);

  // 1-second ticker for the reveal-window countdown.
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Play the routing/reveal animation whenever the round advances.
  useEffect(() => {
    if (!duel) return;
    const r = duel.currentRound;
    if (prevRoundRef.current !== 0 && r > prevRoundRef.current) {
      setRouting(true);
      const id = setTimeout(() => setRouting(false), 2600);
      prevRoundRef.current = r;
      return () => clearTimeout(id);
    }
    prevRoundRef.current = r;
  }, [duel?.currentRound]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isConfirmed) refetch();
  }, [isConfirmed, refetch]);

  useEffect(() => {
    if (error) setNotice(error.message.split('\n')[0]);
  }, [error]);

  const currentRound = duel?.currentRound ?? 0;

  async function handleCommit() {
    if (!address || !duel || currentRound < 1) return;
    if (total !== 100) return setNotice('Allocation must total exactly 100%.');
    setNotice(null);
    const salt = generateSalt();
    const alloc = { attack: attackPct, defend: defendPct, invest: investPct };
    const hash = computeCommitHash(alloc, salt, address as Address);
    // Persist BEFORE sending so a refresh mid-tx can still reveal.
    saveCommit(duelId, currentRound, address as Address, { ...alloc, salt });
    try {
      await commitRound(duelId, hash);
      refetch();
    } catch {
      /* surfaced via error effect */
    }
  }

  async function handleReveal() {
    if (!address || currentRound < 1) return;
    const stored = loadCommit(duelId, currentRound, address as Address);
    if (!stored) {
      return setNotice(
        'Your secret split for this round was lost (different device/browser). It cannot be revealed.',
      );
    }
    setNotice(null);
    try {
      await revealRound(duelId, stored.attack, stored.defend, stored.invest, stored.salt);
      clearCommit(duelId, currentRound, address as Address);
      refetch();
    } catch {
      /* surfaced via error effect */
    }
  }

  async function handleForfeit() {
    setNotice(null);
    try {
      await forfeitRound(duelId);
      refetch();
    } catch {
      /* surfaced via error effect */
    }
  }

  // ── Final result ──────────────────────────────────────────────────────────
  const finished = duel?.state === DuelState.Resolved;
  const iWon = finished && (myScore ?? 0n) > (oppScore ?? 0n);
  const draw = finished && (myScore ?? 0n) === (oppScore ?? 0n);
  const hasOpponent = !!duel?.player2 && duel.player2.toLowerCase() !== ZERO_ADDR;

  return (
    <div className="min-h-screen font-sans flex flex-col items-center pt-24 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: "url('/assets/background_military_bunker.png')" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent opacity-20 shadow-[0_0_30px_rgba(93,191,126,0.8)]" />

      <div className="w-full max-w-[1200px] px-4 sm:px-6 md:px-10 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#5DBF7E]/20 pb-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(93,191,126,0.6)] flex items-center gap-2 sm:gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-white/50 hover:text-white text-lg mr-2 transition-colors"
                >
                  ←
                </button>
              )}
              SPLIT DUEL
            </h1>
            <div className="text-[#5DBF7E]/60 text-xs font-bold tracking-widest mt-2">
              DUEL #{duelId.toString()} • {tokenName} ARENA
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#E6F2EF]/50 font-black tracking-widest text-xs mb-1">
              ROUND {currentRound > 0 ? `${currentRound}/${TOTAL_ROUNDS}` : '…'}
            </div>
            {/* Real 60s reveal-window timer — only meaningful once both committed */}
            <div
              className={`text-3xl sm:text-4xl font-mono font-bold ${
                bothCommittedAt > 0 && secondsLeft <= 15
                  ? 'text-[var(--color-warning)] animate-pulse'
                  : 'text-[#F4D935]'
              } drop-shadow-[0_0_15px_rgba(244,217,53,0.5)]`}
            >
              {bothCommittedAt > 0 ? `0:${secondsLeft.toString().padStart(2, '0')}` : '—:—'}
            </div>
            <div className="text-[#E6F2EF]/30 text-[10px] tracking-widest mt-1">
              {bothCommittedAt > 0 ? 'REVEAL WINDOW' : 'AWAITING COMMITS'}
            </div>
          </div>
        </div>

        {/* Not a participant guard */}
        {duel && !isParticipant && (
          <div className="text-center text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-xl py-4 px-6 mb-8 tracking-widest text-sm">
            You are a spectator — this wallet is not one of the two duelists.
          </div>
        )}

        {/* HUD */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 mb-12 items-center">
          {/* My HUD */}
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-5 rounded-2xl border-2 border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(93,191,126,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--color-primary)] text-[var(--color-surface)] font-black text-[10px] tracking-widest rounded-bl-2xl">
              YOU {isP1 ? '(P1)' : isP2 ? '(P2)' : ''}
            </div>
            <h2 className="text-lg md:text-xl font-black text-white mb-4 tracking-widest">YOUR TREASURY</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#050D0C] p-2.5 rounded-lg border border-[#5DBF7E]/20">
                <span className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs tracking-widest">
                  <img src="/assets/yield_icon.png" alt="Yield" className="w-4 h-4 object-contain" /> TREASURY
                </span>
                <span className="text-white font-mono text-lg font-bold">{fmt(myScore)}</span>
              </div>
              <div className="flex justify-between items-center bg-[#050D0C] p-2.5 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[var(--color-defense)] font-bold text-xs tracking-widest">
                  <ShieldIcon size={14} /> SHIELD
                </span>
                <span className="text-white font-mono text-lg font-bold">{fmt(myShield)}</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-1">
                <span className="text-[var(--color-text)]/40 font-bold tracking-widest text-[10px]">STATUS</span>
                <span className="text-[var(--color-primary)] font-black tracking-widest text-[11px]">
                  {iRevealed ? 'REVEALED' : iCommitted ? 'COMMITTED' : 'PLANNING'}
                </span>
              </div>
            </div>
          </div>

          {/* Battlefield core */}
          <div className="hidden md:flex flex-col items-center justify-center px-4 relative">
            <div className="text-[var(--color-attack)] font-black text-xl animate-pulse tracking-[0.3em] mb-4 drop-shadow-[0_0_10px_rgba(255,10,120,0.8)]">
              VS
            </div>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className="w-[2px] h-12 bg-gradient-to-b from-[var(--color-primary)] to-transparent rounded-full opacity-60" />
              <div
                className={`w-16 h-16 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-attack)]/40 shadow-[0_0_30px_rgba(255,10,120,0.5)] relative flex items-center justify-center overflow-hidden ${
                  routing ? 'scale-125 transition-transform duration-500' : ''
                }`}
              >
                <div className="absolute inset-0 rounded-full border border-[var(--color-attack)] animate-ping opacity-30" />
                <div
                  className={`absolute inset-2 rounded-full border-2 border-[var(--color-defense)] border-dashed opacity-50 ${
                    routing ? 'animate-[spin_0.6s_linear_infinite]' : 'animate-[spin_4s_linear_infinite]'
                  }`}
                />
                <img src="/assets/attack_icon.png" alt="Core" className="w-8 h-8 z-10 animate-pulse" />
              </div>
              <div className="w-[2px] h-12 bg-gradient-to-t from-[var(--color-attack)] to-transparent rounded-full opacity-60" />
            </div>
            {routing && (
              <div className="absolute -bottom-8 text-[var(--color-warning)] text-[10px] font-black tracking-[0.3em] animate-pulse">
                ROUTING YIELD…
              </div>
            )}
          </div>

          {/* Opponent HUD */}
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-5 rounded-2xl border-2 border-[var(--color-attack)]/20 shadow-[0_0_20px_rgba(255,10,120,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--color-attack)] text-[var(--color-text)] font-black text-[10px] tracking-widest rounded-bl-2xl">
              ENEMY
            </div>
            <h2 className="text-lg md:text-xl font-black text-white mb-4 tracking-widest">ENEMY TREASURY</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0A0507] p-2.5 rounded-lg border border-[#FF4D6D]/20">
                <span className="flex items-center gap-2 text-[var(--color-attack)] font-bold text-xs tracking-widest">
                  <img src="/assets/yield_icon.png" alt="Yield" className="w-4 h-4 object-contain" /> TREASURY
                </span>
                <span className="text-white font-mono text-lg font-bold">
                  {hasOpponent ? fmt(oppScore) : 'WAITING…'}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#0A0507] p-2.5 rounded-lg border border-[#4DA3FF]/20">
                <span className="flex items-center gap-2 text-[var(--color-defense)] font-bold text-xs tracking-widest">
                  <ShieldIcon size={14} /> SHIELD
                </span>
                <span className="text-white font-mono text-lg font-bold">{fmt(oppShield)}</span>
              </div>
              <div className="flex justify-between items-center p-2 pt-1">
                <span className="text-[var(--color-text)]/40 font-bold tracking-widest text-[10px]">STATUS</span>
                <span className="text-[var(--color-attack)] font-black tracking-widest text-[11px]">
                  {oppRevealed ? 'REVEALED' : oppCommitted ? 'COMMITTED' : 'PLANNING'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Final result panel ─────────────────────────────────────────── */}
        {finished ? (
          <div className="bg-[#0A1A18] p-8 rounded-2xl border-2 border-[var(--color-primary)]/30 text-center">
            <Trophy
              size={56}
              className={`mx-auto mb-4 ${iWon ? 'text-[var(--color-warning)]' : draw ? 'text-white/60' : 'text-[var(--color-attack)]'}`}
            />
            <div className="text-3xl font-black tracking-[0.2em] text-white mb-2">
              {draw ? 'STALEMATE' : iWon ? 'VICTORY' : 'DEFEAT'}
            </div>
            <div className="text-[var(--color-text)]/60 text-sm tracking-widest mb-6 max-w-md mx-auto">
              {draw
                ? 'Even treasuries — yield pool stays seeded. Principal returned to both.'
                : iWon
                  ? 'You claimed the accumulated yield. Your principal is back in your wallet.'
                  : 'Your rival grew the bigger treasury. Your principal has been refunded.'}
            </div>
            <div className="flex justify-center gap-8 mb-8">
              <div>
                <div className="text-[10px] tracking-widest text-white/40">YOUR FINAL</div>
                <div className="text-2xl font-mono font-black text-[var(--color-primary)]">{fmt(myScore)}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-widest text-white/40">ENEMY FINAL</div>
                <div className="text-2xl font-mono font-black text-[var(--color-attack)]">{fmt(oppScore)}</div>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="btn-cyber bg-[#05100D] border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[#05100D] px-8 py-4 rounded-xl font-black tracking-[0.2em]"
              >
                RETURN TO ARENA →
              </button>
            )}
          </div>
        ) : (
          /* ── Allocator + action ──────────────────────────────────────── */
          <div className="bg-[#0A1A18] p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-[#5DBF7E]/20 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#5DBF7E] text-[#102E2B] px-6 py-1 rounded-b-2xl font-black tracking-[0.2em] text-xs">
              {phase === 'reveal' || phase === 'awaitOpponentReveal' ? 'REVEAL YOUR SPLIT' : 'ALLOCATE RESOURCES'}
            </div>

            {/* Sliders — locked once committed */}
            <fieldset
              disabled={phase !== 'commit'}
              className={phase !== 'commit' ? 'opacity-50 pointer-events-none' : ''}
            >
              <div className="space-y-6 mt-6">
                <Slider label="ATTACK" hex="#FF4D6D" bgHex="#1A0A0E" icon="/assets/attack_icon.png" value={attackPct} onChange={setAttackPct} />
                <Slider label="DEFEND" hex="#4DA3FF" bgHex="#05101A" icon="/assets/defense_icon.png" value={defendPct} onChange={setDefendPct} />
                <Slider label="INVEST" hex="#00F28A" bgHex="#05130D" icon="/assets/invest_icon.png" value={investPct} onChange={setInvestPct} />
              </div>
            </fieldset>

            <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-[#5DBF7E]/20 pt-6 gap-6">
              <div className="flex flex-col w-full md:w-auto">
                <div
                  className={`text-xl sm:text-2xl md:text-3xl font-black tracking-[0.2em] ${
                    total === 100
                      ? 'text-[#00F28A] drop-shadow-[0_0_15px_rgba(0,242,138,0.8)]'
                      : 'text-[#FF4D6D] drop-shadow-[0_0_15px_rgba(255,77,109,0.8)]'
                  }`}
                >
                  TOTAL: <span className="font-mono">{total}%</span>{' '}
                  {total === 100 ? '✅' : <AlertTriangle className="inline text-[#FF4D6D] ml-2 mb-1 animate-pulse" size={24} />}
                </div>
                <PhaseHint phase={phase} oppCommitted={oppCommitted} oppRevealed={oppRevealed} secondsLeft={secondsLeft} />
              </div>

              <ActionButton
                phase={phase}
                total={total}
                busy={busy}
                iCanForfeit={!windowOpen && bothCommittedAt > 0 && (!iRevealed || !oppRevealed)}
                onCommit={handleCommit}
                onReveal={handleReveal}
                onForfeit={handleForfeit}
              />
            </div>
          </div>
        )}

        {notice && (
          <div className="mt-5 text-center text-xs tracking-wide text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg py-2 px-3">
            {notice}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Slider({
  label,
  hex,
  bgHex,
  icon,
  value,
  onChange,
}: {
  label: string;
  hex: string;
  bgHex: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 font-black tracking-[0.2em] text-base sm:text-lg md:text-xl" style={{ color: hex }}>
          <img src={icon} alt={label} className="w-6 h-6 object-contain" /> {label}
        </div>
        <div className="text-2xl md:text-3xl font-mono font-black" style={{ color: hex }}>
          {value}%
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-4 md:h-5 rounded-full appearance-none cursor-pointer relative z-20"
        style={{ background: `linear-gradient(to right, ${hex} ${value}%, ${bgHex} ${value}%)` }}
      />
    </div>
  );
}

function PhaseHint({
  phase,
  oppCommitted,
  oppRevealed,
  secondsLeft,
}: {
  phase: Phase;
  oppCommitted: boolean;
  oppRevealed: boolean;
  secondsLeft: number;
}) {
  const map: Record<Phase, string> = {
    loading: 'Syncing battlefield…',
    commit: 'Lock in your split and commit. Your choice stays secret until reveal.',
    awaitOpponentCommit: oppCommitted
      ? 'Both committed — reveal window opening…'
      : '⏳ You committed. Waiting on the enemy to commit.',
    reveal: `⚔ Both committed. Reveal within ${secondsLeft}s or risk a forfeit penalty.`,
    awaitOpponentReveal: oppRevealed ? 'Resolving round…' : '✅ You revealed. Waiting on the enemy to reveal.',
    expired: '⏰ Reveal window closed. A non-revealer can now be forfeited.',
    resolving: '🔀 Routing yield and resolving the round…',
    ended: 'Duel complete.',
  };
  return (
    <div className="text-[var(--color-primary)] font-bold mt-3 text-xs md:text-sm tracking-[0.1em] bg-[var(--color-primary)]/10 py-1.5 px-3 rounded border border-[var(--color-primary)]/20 inline-block w-fit">
      {map[phase]}
    </div>
  );
}

function ActionButton({
  phase,
  total,
  busy,
  iCanForfeit,
  onCommit,
  onReveal,
  onForfeit,
}: {
  phase: Phase;
  total: number;
  busy: boolean;
  iCanForfeit: boolean;
  onCommit: () => void;
  onReveal: () => void;
  onForfeit: () => void;
}) {
  const base =
    'btn-cyber w-full md:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-black tracking-[0.1em] sm:tracking-[0.2em] text-base sm:text-lg flex items-center justify-center gap-2 transition-all';

  if (iCanForfeit && (phase === 'expired' || phase === 'reveal' || phase === 'awaitOpponentReveal')) {
    return (
      <button
        onClick={onForfeit}
        disabled={busy}
        className={`${base} bg-[#1A0A0E] border-2 border-[var(--color-attack)] text-[var(--color-attack)] hover:bg-[var(--color-attack)] hover:text-white disabled:opacity-50`}
      >
        {busy && <Loader2 className="animate-spin" size={18} />}
        {busy ? 'PROCESSING…' : 'FORCE FORFEIT →'}
      </button>
    );
  }

  if (phase === 'reveal') {
    return (
      <button
        onClick={onReveal}
        disabled={busy}
        className={`${base} bg-[var(--color-surface)] border-2 border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-black disabled:opacity-50`}
      >
        {busy && <Loader2 className="animate-spin" size={18} />}
        {busy ? 'REVEALING…' : 'REVEAL SPLIT →'}
      </button>
    );
  }

  if (phase === 'commit') {
    return (
      <button
        onClick={onCommit}
        disabled={busy || total !== 100}
        className={`${base} bg-[var(--color-surface)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] disabled:border-gray-800 disabled:bg-gray-900 disabled:text-gray-600 text-[var(--color-primary)] hover:text-[var(--color-surface)]`}
      >
        {busy && <Loader2 className="animate-spin" size={18} />}
        {busy ? 'COMMITTING…' : 'COMMIT ALLOCATION →'}
      </button>
    );
  }

  return (
    <button disabled className={`${base} bg-gray-900 border-2 border-gray-700 text-gray-500 cursor-not-allowed`}>
      <Loader2 className="animate-spin" size={18} /> WAITING…
    </button>
  );
}
