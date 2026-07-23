'use client';

import React, { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseUnits } from 'viem';
import { celo } from 'wagmi/chains';

// ─── Contract config ──────────────────────────────────────────────────────────
const SPLIT_POOL_ADDRESS = '0x1D3184144fC75f4912a2805eeD7a218f2B48b4e9' as const;

const SPLIT_POOL_ABI = parseAbi([
  'function currentTournamentId() external view returns (uint256)',
  'function tournaments(uint256 id) external view returns (uint256 id, uint256 startTime, uint256 endTime, uint256 totalStaked, uint256 totalPrize, uint256 lastYieldUpdate, bool settled)',
  'function playerCount(uint256 id) external view returns (uint256)',
  'function tournamentDuration() external view returns (uint256)',
  'function joinTournament(address token, uint256 attackBP, uint256 defendBP, uint256 investBP) external',
  'function apyBasisPoints() external view returns (uint256)',
]);

interface DailySplitPoolWidgetProps {
  /** Optional: called when user successfully joins the pool */
  onJoined?: () => void;
}

function formatCountdown(secsLeft: number): string {
  if (secsLeft <= 0) return '00:00:00';
  const h = Math.floor(secsLeft / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
}

function formatAmount(raw: bigint, decimals = 18): string {
  const n = Number(raw) / 10 ** decimals;
  return n.toFixed(2);
}

export default function DailySplitPoolWidget({ onJoined }: DailySplitPoolWidgetProps) {
  const { address } = useAccount();
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // Tick every second for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // ── On-chain reads ─────────────────────────────────────────────────────────
  const { data: currentTid } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'currentTournamentId',
    chainId: celo.id,
  });

  const { data: tournamentRaw } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournaments',
    args: currentTid !== undefined ? [currentTid as bigint] : undefined,
    chainId: celo.id,
    query: { enabled: currentTid !== undefined },
  });

  const { data: playerCountRaw } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'playerCount',
    args: currentTid !== undefined ? [currentTid as bigint] : undefined,
    chainId: celo.id,
    query: { enabled: currentTid !== undefined },
  });

  const { data: durationRaw } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournamentDuration',
    chainId: celo.id,
  });

  const { data: apyRaw } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'apyBasisPoints',
    chainId: celo.id,
  });

  // Parse tournament data
  const [, startTime, endTime, totalStaked, totalPrize, , settled] =
    (tournamentRaw as readonly bigint[] & readonly [bigint, bigint, bigint, bigint, bigint, bigint, boolean]) ?? [];

  const playerCount = playerCountRaw ? Number(playerCountRaw) : 0;
  const secsLeft = endTime ? Math.max(0, Number(endTime) - now) : 0;
  const isLive = !!startTime && !settled && now < Number(endTime);
  const isSettled = !!settled;
  const notStarted = !startTime || startTime === 0n;

  const prizeDisplay = totalPrize ? formatAmount(totalPrize) : '0.00';
  const stakedDisplay = totalStaked ? formatAmount(totalStaked) : '0.00';
  const apyDisplay = apyRaw ? `${(Number(apyRaw) / 100).toFixed(1)}%` : '5.0%';

  // Top 10% prize estimate
  const top10Count = Math.max(1, Math.ceil(playerCount * 0.1));
  const prizePerWinner =
    totalPrize && top10Count > 0
      ? formatAmount(totalPrize / BigInt(top10Count))
      : '0.00';

  // ── Pool status label ──────────────────────────────────────────────────────
  let statusLabel = 'LOADING';
  let statusColor = '#888';
  if (notStarted) { statusLabel = 'NOT STARTED'; statusColor = '#888'; }
  else if (isLive) { statusLabel = 'LIVE'; statusColor = '#00F58A'; }
  else if (isSettled) { statusLabel = 'SETTLED'; statusColor = '#F4D935'; }
  else { statusLabel = 'ENDED'; statusColor = '#FF4D6D'; }

  // ── Quick-join (CELO, equal split) ─────────────────────────────────────────
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed && onJoined) onJoined();
  }, [isConfirmed, onJoined]);

  const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438' as const;

  function handleJoin() {
    if (!address) return;
    // Join with a balanced 33/33/34 split to show intent — user can customise later
    writeContract({
      address: SPLIT_POOL_ADDRESS,
      abi: SPLIT_POOL_ABI,
      functionName: 'joinTournament',
      args: [CELO_ADDRESS, 3300n, 3300n, 3400n],
    });
  }

  const busy = isPending || isConfirming;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,245,138,0.06) 0%, rgba(3,10,8,0.95) 60%, rgba(244,217,53,0.04) 100%)',
        border: '1px solid rgba(0,245,138,0.25)',
        boxShadow: '0 0 40px rgba(0,245,138,0.08), inset 0 0 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Animated top bar */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isLive
            ? 'linear-gradient(90deg, transparent, #00F58A, #F4D935, #00F58A, transparent)'
            : 'linear-gradient(90deg, transparent, #333, transparent)',
          animation: isLive ? 'shimmer 2s linear infinite' : 'none',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏆</span>
              <h3
                className="font-black tracking-[0.2em] text-white text-sm sm:text-base"
              >
                DAILY SPLIT POOL
              </h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-white/40">
              TOP 10% OF EFFICIENT SPLITTERS WIN THE YIELD
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div
              className={`text-[9px] font-black tracking-[0.2em] px-2 py-0.5 rounded-full border ${isLive ? 'animate-pulse' : ''}`}
              style={{
                color: statusColor,
                borderColor: `${statusColor}50`,
                background: `${statusColor}15`,
              }}
            >
              {statusLabel}
            </div>
            {currentTid !== undefined && (
              <div className="text-[9px] text-white/20 tracking-widest">
                ROUND #{currentTid.toString()}
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Countdown */}
          <div
            className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center p-3 rounded-xl"
            style={{
              background: 'rgba(244,217,53,0.06)',
              border: '1px solid rgba(244,217,53,0.2)',
            }}
          >
            <div className="text-[9px] font-bold tracking-[0.2em] text-[#F4D935]/60 mb-1">
              ENDS IN
            </div>
            <div
              className={`text-2xl sm:text-3xl font-mono font-black ${secsLeft < 3600 && isLive ? 'animate-pulse' : ''}`}
              style={{
                color: secsLeft < 3600 && isLive ? '#FF4D6D' : '#F4D935',
                textShadow: `0 0 20px ${secsLeft < 3600 && isLive ? 'rgba(255,77,109,0.6)' : 'rgba(244,217,53,0.5)'}`,
              }}
            >
              {isLive ? formatCountdown(secsLeft) : notStarted ? '- -:- -:- -' : '00:00:00'}
            </div>
          </div>

          {/* Today's prize */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-xl"
            style={{ background: 'rgba(0,245,138,0.06)', border: '1px solid rgba(0,245,138,0.2)' }}
          >
            <div className="text-[9px] font-bold tracking-widest text-[#00F58A]/60 mb-1">
              TODAY'S YIELD
            </div>
            <div
              className="text-base sm:text-lg font-mono font-black text-[#00F58A]"
              style={{ textShadow: '0 0 15px rgba(0,245,138,0.5)' }}
            >
              {prizeDisplay}
            </div>
            <div className="text-[8px] text-white/20 tracking-widest">CELO</div>
          </div>

          {/* Players */}
          <div
            className="flex flex-col items-center justify-center p-3 rounded-xl"
            style={{ background: 'rgba(77,163,255,0.06)', border: '1px solid rgba(77,163,255,0.2)' }}
          >
            <div className="text-[9px] font-bold tracking-widest text-[#4DA3FF]/60 mb-1">
              PLAYERS
            </div>
            <div
              className="text-base sm:text-lg font-mono font-black text-[#4DA3FF]"
              style={{ textShadow: '0 0 15px rgba(77,163,255,0.5)' }}
            >
              {playerCount}
            </div>
            <div className="text-[8px] text-white/20 tracking-widest">TODAY</div>
          </div>
        </div>

        {/* Prize breakdown row */}
        <div
          className="flex flex-wrap justify-between items-center gap-2 mb-5 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex flex-col items-center px-2">
            <div className="text-[9px] text-white/30 tracking-widest mb-0.5">TOTAL STAKED</div>
            <div className="text-sm font-mono font-bold text-white/70">{stakedDisplay} CELO</div>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="text-[9px] text-white/30 tracking-widest mb-0.5">TOP 10% COUNT</div>
            <div className="text-sm font-mono font-bold text-[#F4D935]">{top10Count} players</div>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="text-[9px] text-white/30 tracking-widest mb-0.5">~PRIZE EACH</div>
            <div className="text-sm font-mono font-bold text-[#00F58A]">
              {prizePerWinner} CELO
            </div>
          </div>
          <div className="flex flex-col items-center px-2">
            <div className="text-[9px] text-white/30 tracking-widest mb-0.5">SIMULATED APY</div>
            <div className="text-sm font-mono font-bold text-[#F4D935]">{apyDisplay}</div>
          </div>
        </div>

        {/* How it works — compact */}
        <div className="flex gap-2 mb-5 text-[9px] text-white/30 tracking-widest">
          <span>⚔️ Highest INVEST% wins</span>
          <span className="text-white/10">•</span>
          <span>🔒 Principal always returned</span>
          <span className="text-white/10">•</span>
          <span>🏆 Top 10% share prize</span>
        </div>

        {/* CTA Button */}
        {!address ? (
          <div className="text-center text-[10px] font-bold tracking-widest text-[#F4D935]/60 animate-pulse">
            CONNECT WALLET TO JOIN POOL
          </div>
        ) : isConfirmed ? (
          <div
            className="text-center py-3 rounded-xl text-sm font-black tracking-widest"
            style={{ background: 'rgba(0,245,138,0.1)', color: '#00F58A', border: '1px solid rgba(0,245,138,0.3)' }}
          >
            ✅ YOU'RE IN THE POOL — CHECK BACK AFTER IT SETTLES
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={!isLive || busy}
            className={`w-full py-3.5 rounded-xl font-black tracking-[0.25em] text-sm transition-all flex items-center justify-center gap-2 ${
              isLive && !busy
                ? 'hover:scale-[1.02] active:scale-[0.99]'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={
              isLive && !busy
                ? {
                    background: 'linear-gradient(135deg, rgba(0,245,138,0.2), rgba(244,217,53,0.15))',
                    border: '1px solid rgba(0,245,138,0.5)',
                    color: '#00F58A',
                    boxShadow: '0 0 25px rgba(0,245,138,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)',
                  }
            }
          >
            {busy ? (
              <>
                <span className="animate-spin text-base">⟳</span>
                {isPending ? 'WAITING FOR WALLET…' : 'CONFIRMING ON-CHAIN…'}
              </>
            ) : isLive ? (
              <>
                <span>🏆</span>
                JOIN DAILY POOL →
              </>
            ) : notStarted ? (
              'POOL NOT STARTED YET'
            ) : (
              'POOL ENDED — NEXT ROUND SOON'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
