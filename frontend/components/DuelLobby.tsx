'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits, type Address } from 'viem';
import { Swords, Link2, Loader2, Copy, Check } from 'lucide-react';
import {
  useActiveDuel,
  useDuelActions,
  useDuelData,
  useTokenApproval,
} from '@/lib/hooks/useDuel';
import { DuelState, NATIVE_CELO } from '@/lib/duelManager';

// Non-native Mento stablecoins use 18 decimals on Celo, as does native CELO.
const TOKEN_DECIMALS = 18;

interface DuelLobbyProps {
  tokenAddress: string;
  tokenName: string;
  onEnterDuel: (duelId: bigint) => void;
  onBack?: () => void;
}

export default function DuelLobby({
  tokenAddress,
  tokenName,
  onEnterDuel,
  onBack,
}: DuelLobbyProps) {
  const { address } = useAccount();
  const token = tokenAddress as Address;
  const isNative = token.toLowerCase() === NATIVE_CELO;

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [stakeInput, setStakeInput] = useState('0.1');
  const [joinId, setJoinId] = useState('');
  const [createdDuelId, setCreatedDuelId] = useState<bigint | undefined>();
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const stake = useMemo(() => {
    try {
      return parseUnits(stakeInput || '0', TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  }, [stakeInput]);

  const { activeDuelId, refetch: refetchActive } = useActiveDuel();
  const { balance, needsApproval, refetch: refetchApproval } = useTokenApproval(
    token,
    stake,
  );
  const {
    approve,
    createDuel,
    joinDuel,
    cancelDuel,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useDuelActions();

  // Watch the duel we just created — the instant a player2 joins, drop into the
  // war room. Also lets the creator cancel while still Open.
  const { duel: createdDuel } = useDuelData(createdDuelId);

  const busy = isPending || isConfirming;

  useEffect(() => {
    if (error) setNotice(error.message.split('\n')[0]);
  }, [error]);

  useEffect(() => {
    if (isConfirmed) {
      refetchActive();
      refetchApproval();
    }
  }, [isConfirmed, refetchActive, refetchApproval]);

  // Auto-advance the creator into battle once the duel goes Active.
  useEffect(() => {
    if (createdDuelId && createdDuel?.state === DuelState.Active) {
      onEnterDuel(createdDuelId);
    }
  }, [createdDuelId, createdDuel?.state, onEnterDuel]);

  const shareLink = useMemo(() => {
    if (!createdDuelId || typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?duel=${createdDuelId.toString()}`;
  }, [createdDuelId]);

  async function handleCreate() {
    setNotice(null);
    if (stake <= 0n) return setNotice('Enter a stake greater than zero.');
    if (!isNative && balance < stake)
      return setNotice(`Insufficient ${tokenName} balance for this stake.`);
    try {
      if (needsApproval) {
        await approve(token, stake);
        setNotice('Approval confirmed — press Create again to open the duel.');
        return;
      }
      const txHash = await createDuel(token, stake);
      // After creation, read back the wallet's active duel id to track it.
      const res = await refetchActive();
      const newId = (res.data as bigint | undefined) ?? undefined;
      if (newId && newId > 0n) setCreatedDuelId(newId);
      setNotice(
        txHash
          ? 'Duel created. Waiting for an opponent to join…'
          : 'Duel created.',
      );
    } catch {
      /* surfaced via `error` effect */
    }
  }

  async function handleJoin() {
    setNotice(null);
    let id: bigint;
    try {
      id = BigInt(joinId.trim());
    } catch {
      return setNotice('Enter a valid duel id.');
    }
    if (id <= 0n) return setNotice('Enter a valid duel id.');
    if (!isNative && balance < stake) {
      // stake is re-derived from the on-chain duel; balance check is best-effort.
    }
    try {
      await joinDuel(id, token, stake);
      onEnterDuel(id);
    } catch {
      /* surfaced via `error` effect */
    }
  }

  async function handleCancel() {
    if (!createdDuelId) return;
    try {
      await cancelDuel(createdDuelId);
      setCreatedDuelId(undefined);
      setMode('choose');
      setNotice('Duel cancelled and stake refunded.');
      refetchActive();
    } catch {
      /* surfaced via `error` effect */
    }
  }

  function copyLink() {
    if (!shareLink) return;
    navigator.clipboard?.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // If the wallet is already locked into a duel elsewhere, offer to resume it.
  const resumeBanner =
    activeDuelId && activeDuelId !== createdDuelId ? (
      <button
        onClick={() => onEnterDuel(activeDuelId)}
        className="w-full mb-6 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/40 text-[var(--color-warning)] px-4 py-3 rounded-xl font-bold tracking-widest text-xs hover:bg-[var(--color-warning)]/20 transition-colors"
      >
        ↺ RESUME ACTIVE DUEL #{activeDuelId.toString()}
      </button>
    ) : null;

  return (
    <div className="min-h-screen font-sans flex flex-col items-center pt-24 sm:pt-32 pb-16 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none mix-blend-screen"
        style={{ backgroundImage: "url('/assets/command_center_topdown.png')" }}
      />
      <div className="w-full max-w-[560px] px-4 sm:px-6 relative z-10">
        <div className="flex items-center justify-between border-b border-[var(--color-primary)]/20 pb-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] text-white flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-white/50 hover:text-white transition-colors"
              >
                ←
              </button>
            )}
            <Swords className="text-[var(--color-primary)]" size={22} />
            {tokenName} DUEL
          </h1>
          <span className="text-[var(--color-primary)]/60 text-[10px] font-bold tracking-widest">
            1V1 • 5 ROUNDS
          </span>
        </div>

        {resumeBanner}

        {/* Created duel — waiting room */}
        {createdDuelId ? (
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 rounded-2xl border-2 border-[var(--color-primary)]/30">
            <div className="text-center mb-5">
              <Loader2 className="animate-spin mx-auto text-[var(--color-primary)] mb-3" size={32} />
              <div className="text-white font-black tracking-widest text-lg">
                DUEL #{createdDuelId.toString()} OPEN
              </div>
              <div className="text-[var(--color-text)]/60 text-xs tracking-widest mt-1">
                WAITING FOR AN OPPONENT TO JOIN
              </div>
            </div>

            <div className="text-[10px] font-bold tracking-widest text-[var(--color-primary)]/70 mb-2 flex items-center gap-2">
              <Link2 size={13} /> CHALLENGE LINK
            </div>
            <div className="flex gap-2 mb-5">
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-[#050D0C] border border-[var(--color-primary)]/20 rounded-lg px-3 py-2 text-xs text-white/70 font-mono truncate"
              />
              <button
                onClick={copyLink}
                className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/40 text-[var(--color-primary)] px-3 rounded-lg hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <button
              onClick={handleCancel}
              disabled={busy}
              className="w-full border border-[var(--color-attack)]/40 text-[var(--color-attack)] px-4 py-3 rounded-xl font-bold tracking-widest text-xs hover:bg-[var(--color-attack)]/10 transition-colors disabled:opacity-50"
            >
              {busy ? 'PROCESSING…' : 'CANCEL DUEL & REFUND STAKE'}
            </button>
          </div>
        ) : mode === 'choose' ? (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setMode('create')}
              className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 rounded-2xl border-2 border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50 transition-all text-left group"
            >
              <div className="text-[var(--color-primary)] font-black tracking-widest text-lg mb-1">
                CREATE DUEL →
              </div>
              <div className="text-[var(--color-text)]/60 text-xs">
                Set your stake and open a lobby. Share the link to challenge a rival.
              </div>
            </button>
            <button
              onClick={() => setMode('join')}
              className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 rounded-2xl border-2 border-[var(--color-attack)]/20 hover:border-[var(--color-attack)]/50 transition-all text-left"
            >
              <div className="text-[var(--color-attack)] font-black tracking-widest text-lg mb-1">
                JOIN DUEL →
              </div>
              <div className="text-[var(--color-text)]/60 text-xs">
                Have a challenge id or link? Match the stake and drop into battle.
              </div>
            </button>
          </div>
        ) : mode === 'create' ? (
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 rounded-2xl border-2 border-[var(--color-primary)]/20">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-primary)]/70 mb-2 block">
              YOUR STAKE ({tokenName})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              className="w-full bg-[#050D0C] border border-[var(--color-primary)]/30 rounded-lg px-4 py-3 text-white font-mono text-lg mb-2 focus:outline-none focus:border-[var(--color-primary)]"
            />
            <div className="text-[10px] text-[var(--color-text)]/40 tracking-widest mb-5">
              BALANCE: {formatUnits(balance, TOKEN_DECIMALS)} {tokenName} • PRINCIPAL
              ALWAYS REFUNDED
            </div>
            <button
              onClick={handleCreate}
              disabled={busy}
              className="btn-cyber w-full bg-[#05100D] border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[#05100D] px-6 py-4 rounded-xl font-black tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="animate-spin" size={18} />}
              {busy
                ? 'PROCESSING…'
                : needsApproval
                  ? `APPROVE ${tokenName}`
                  : 'CREATE DUEL'}
            </button>
            <button
              onClick={() => setMode('choose')}
              className="w-full mt-3 text-[var(--color-text)]/40 hover:text-white text-xs tracking-widest"
            >
              ← BACK
            </button>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-md p-6 rounded-2xl border-2 border-[var(--color-attack)]/20">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-attack)]/70 mb-2 block">
              CHALLENGE / DUEL ID
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 7"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full bg-[#0A0507] border border-[var(--color-attack)]/30 rounded-lg px-4 py-3 text-white font-mono text-lg mb-5 focus:outline-none focus:border-[var(--color-attack)]"
            />
            <button
              onClick={handleJoin}
              disabled={busy}
              className="btn-cyber w-full bg-[#0A0507] border-2 border-[var(--color-attack)] text-[var(--color-attack)] hover:bg-[var(--color-attack)] hover:text-white px-6 py-4 rounded-xl font-black tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="animate-spin" size={18} />}
              {busy ? 'JOINING…' : 'JOIN & FIGHT'}
            </button>
            <button
              onClick={() => setMode('choose')}
              className="w-full mt-3 text-[var(--color-text)]/40 hover:text-white text-xs tracking-widest"
            >
              ← BACK
            </button>
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
