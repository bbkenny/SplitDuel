'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits, parseAbi } from 'viem';

const SPLIT_POOL_ADDRESS = "0x1D3184144fC75f4912a2805eeD7a218f2B48b4e9";
const CELO_ERC20 = "0x471EcE3750Da237f93B8E339c536989b8978a438";

const DEFAULT_TOKENS = [
  { name: 'CELO', address: '0x471EcE3750Da237f93B8E339c536989b8978a438' },
  { name: 'USDM', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' },
  { name: 'EURM', address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73' },
  { name: 'USDT', address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' },
  { name: 'USDC', address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' }
];

const SPLIT_POOL_ABI = parseAbi([
  "function admin() external view returns (address)",
  "function startTournament(address token) external",
  "function advanceTournament() external",
  "function settlePool(address token) external",
  "function setApyBasisPoints(uint256 _apy) external",
  "function setTournamentDuration(uint256 _duration) external",
  "function setTokenSupport(address token, bool supported, uint256 minAmount) external",
  "function currentTournamentId() external view returns (uint256)",
  "function tournaments(uint256, address) external view returns (uint256 id, uint256 startTime, uint256 endTime, uint256 totalStaked, uint256 totalPrize, uint256 lastYieldUpdate, bool settled)",
  "function apyBasisPoints() external view returns (uint256)",
  "function tournamentDuration() external view returns (uint256)",
  "function minEntryAmount(address) external view returns (uint256)",
  "function supportedTokens(address) external view returns (bool)"
]);

export default function AdminConsole() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash: txHash });

  const [apy, setApy] = useState('500');
  const [durationHrs, setDurationHrs] = useState('24');
  const [tokenAddress, setTokenAddress] = useState(CELO_ERC20);
  const [minEntry, setMinEntry] = useState('0.05');

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: adminAddress } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'admin',
  });

  const { data: currentTid } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'currentTournamentId',
  });

  const { data: tournamentData } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournaments',
    args: currentTid ? [currentTid, tokenAddress as `0x${string}`] : undefined,
  });

  const { data: currentApy } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'apyBasisPoints',
  });

  const { data: currentDurationSecs } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'tournamentDuration',
  });

  const { data: currentMinEntry } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'minEntryAmount',
    args: [tokenAddress as `0x${string}`],
  });

  const { data: isTokenSupported } = useReadContract({
    address: SPLIT_POOL_ADDRESS,
    abi: SPLIT_POOL_ABI,
    functionName: 'supportedTokens',
    args: [tokenAddress as `0x${string}`],
  });

  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!tournamentData) return;
    const [, startTime, endTime, , , , settled] = tournamentData as any;
    
    if (startTime === 0n) {
      setCountdown('NOT STARTED');
      return;
    }

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const end = Number(endTime);
      
      if (settled) {
        setCountdown('SETTLED');
        clearInterval(interval);
      } else if (now >= end) {
        setCountdown('TOURNAMENT ENDED');
        clearInterval(interval);
      } else {
        const diff = end - now;
        const d = Math.floor(diff / 86400);
        const h = Math.floor((diff % 86400) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setCountdown(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tournamentData]);

  const formatDuration = (hoursStr: string) => {
    const hrs = parseInt(hoursStr, 10);
    if (isNaN(hrs) || hrs <= 24) return '';
    const days = Math.floor(hrs / 24);
    const remainingHrs = hrs % 24;
    return `(${days} day${days > 1 ? 's' : ''}${remainingHrs > 0 ? ` ${remainingHrs} hr${remainingHrs > 1 ? 's' : ''}` : ''})`;
  };

  if (!mounted) return null;

  const isAdmin = address && adminAddress && address.toLowerCase() === (adminAddress as string).toLowerCase();

  const handleStart = () => {
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'startTournament', args: [tokenAddress as `0x${string}`] });
  };

  const handleAdvance = () => {
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'advanceTournament' });
  };

  const handleSettle = () => {
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'settlePool', args: [tokenAddress as `0x${string}`] });
  };

  const handleSetApy = () => {
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'setApyBasisPoints', args: [BigInt(apy)] });
  };

  const handleSetDuration = () => {
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'setTournamentDuration', args: [BigInt(parseFloat(durationHrs) * 3600)] });
  };

  const handleSetToken = () => {
    const isStable = tokenAddress.toLowerCase() === "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e".toLowerCase() || tokenAddress.toLowerCase() === "0xcebA9300f2b948710d2653dD7B07f33A8B32118C".toLowerCase();
    writeContract({ address: SPLIT_POOL_ADDRESS, abi: SPLIT_POOL_ABI, functionName: 'setTokenSupport', args: [tokenAddress as `0x${string}`, true, parseUnits(minEntry, isStable ? 6 : 18)] });
  };

  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <h1 className="text-2xl text-[var(--color-warning)] font-bold tracking-widest animate-pulse">CONNECT WALLET TO ACCESS TERMINAL</h1>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] gap-4">
        <img src="/assets/defense_icon.png" alt="Blocked" className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(255,10,120,0.8)]" />
        <h1 className="text-4xl text-[#FF4D6D] font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,77,109,0.5)]">ACCESS DENIED</h1>
        <p className="text-white/60 font-mono text-sm">Your clearance level does not permit entry to this sector.</p>
        <p className="text-white/40 font-mono text-xs mt-2">Connected: {address}</p>
        <p className="text-white/40 font-mono text-xs">Required: {adminAddress as string}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050D0C] text-white p-8 pt-32 font-sans relative">
      <div className="absolute inset-0 bg-[url('/assets/background_tactical_grid.png')] bg-cover bg-center opacity-10 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex items-center gap-4 border-b border-[var(--color-primary)]/30 pb-6 mb-8">
          <img src="/assets/attack_icon.png" alt="Admin" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(93,191,126,0.6)]" />
          <div>
            <h1 className="text-3xl font-black tracking-[0.3em] text-[var(--color-primary)] drop-shadow-[0_0_10px_rgba(93,191,126,0.4)]">DIRECTOR TERMINAL</h1>
            <p className="text-[var(--color-primary)]/60 text-xs font-mono tracking-widest mt-1">SPLIT POOL OMNI-CONTROL PROTOCOL ACTIVATED</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Main Controls */}
          <div className="bg-[#0A1A18]/80 backdrop-blur-md p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(93,191,126,0.05)]">
            <h2 className="text-xl font-bold tracking-widest mb-6 text-white border-b border-white/10 pb-2">LIFECYCLE MANAGEMENT</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-white/70">Current Tournament ID:</span>
                <span className="text-2xl font-black text-[var(--color-primary)]">{currentTid?.toString() || 'Loading...'}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-white/70">Status / Time Left:</span>
                <span className={`text-lg font-black font-mono ${countdown === 'TOURNAMENT ENDED' ? 'text-[var(--color-warning)] animate-pulse' : countdown === 'NOT STARTED' ? 'text-gray-500' : 'text-[#F4D935]'}`}>{countdown || 'LOADING...'}</span>
              </div>
              <button onClick={handleStart} disabled={isPending || isWaiting} className="w-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black font-bold tracking-widest py-3 rounded-xl transition-all">
                START TOURNAMENT
              </button>
              <button onClick={handleAdvance} disabled={isPending || isWaiting} className="w-full bg-[var(--color-warning)]/10 border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-black font-bold tracking-widest py-3 rounded-xl transition-all">
                ADVANCE TOURNAMENT CYCLE
              </button>
              <button onClick={handleSettle} disabled={isPending || isWaiting} className="w-full bg-[var(--color-defense)]/10 border border-[var(--color-defense)] text-[var(--color-defense)] hover:bg-[var(--color-defense)] hover:text-black font-bold tracking-widest py-3 rounded-xl transition-all">
                SETTLE CURRENT POOL
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-[#0A1A18]/80 backdrop-blur-md p-6 rounded-2xl border border-[var(--color-primary)]/20 shadow-[0_0_20px_rgba(93,191,126,0.05)]">
            <h2 className="text-xl font-bold tracking-widest mb-6 text-white border-b border-white/10 pb-2">ECONOMICS & PARAMS</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-white/50 mb-1">APY BASIS POINTS <span className="text-[var(--color-primary)] ml-2 bg-[var(--color-primary)]/10 px-2 py-0.5 rounded border border-[var(--color-primary)]/30">Current: {currentApy?.toString() || '...'}</span></label>
                  <input type="number" value={apy} onChange={e => setApy(e.target.value)} className="w-full bg-black/50 border border-[var(--color-primary)]/30 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <button onClick={handleSetApy} disabled={isPending || isWaiting} className="px-6 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(93,191,126,0.5)]">UPDATE</button>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-mono text-white/50 mb-1">DURATION (HOURS) <span className="text-[var(--color-primary)] font-bold">{formatDuration(durationHrs)}</span> <span className="text-[var(--color-primary)] ml-2 bg-[var(--color-primary)]/10 px-2 py-0.5 rounded border border-[var(--color-primary)]/30">Current: {currentDurationSecs ? (Number(currentDurationSecs) / 3600).toString() : '...'}</span></label>
                  <input type="number" value={durationHrs} onChange={e => setDurationHrs(e.target.value)} className="w-full bg-black/50 border border-[var(--color-primary)]/30 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <button onClick={handleSetDuration} disabled={isPending || isWaiting} className="px-6 py-2 bg-[var(--color-primary)] text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(93,191,126,0.5)]">UPDATE</button>
              </div>

              <div className="border border-white/10 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-mono text-white/80 font-bold mb-2 flex items-center">
                  UPDATE TOKEN SUPPORT & MIN ENTRY 
                  {isTokenSupported ? <span className="text-[var(--color-primary)] text-[10px] ml-3 px-2 py-0.5 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50">ACTIVE</span> : <span className="text-[var(--color-warning)] text-[10px] ml-3 px-2 py-0.5 rounded-full bg-[var(--color-warning)]/20 border border-[var(--color-warning)]/50">NOT SUPPORTED</span>}
                </label>
                <input type="text" value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} placeholder="Token Address" className="w-full bg-black/50 border border-[var(--color-primary)]/30 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-[var(--color-primary)]" />
                <div className="flex gap-4">
                  <div className="flex-1">
                     <input type="number" value={minEntry} step="0.01" onChange={e => setMinEntry(e.target.value)} placeholder="Min Entry (Ether)" className="w-full bg-black/50 border border-[var(--color-primary)]/30 rounded-lg p-2 font-mono text-white text-xs focus:outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <button onClick={handleSetToken} disabled={isPending || isWaiting} className="px-4 py-2 bg-[var(--color-invest)] text-black font-bold text-xs rounded-lg hover:shadow-[0_0_15px_rgba(0,245,138,0.5)]">SET SUPPORT</button>
                </div>
              </div>

              <div className="border border-white/10 p-4 rounded-xl space-y-3 mt-4">
                <label className="block text-xs font-mono text-white/80 font-bold mb-3">NATIVE SUPPORTED TOKENS DIRECTORY</label>
                <div className="space-y-2">
                  {DEFAULT_TOKENS.map((t) => (
                    <div key={t.name} className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/5">
                      <span className="text-[var(--color-primary)] font-bold text-xs w-10">{t.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white/50 text-[10px] hidden sm:inline">{t.address}</span>
                        <span className="font-mono text-white/50 text-[10px] sm:hidden">{t.address.slice(0, 6)}...{t.address.slice(-4)}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(t.address);
                            setTokenAddress(t.address);
                          }} 
                          className="bg-white/10 hover:bg-[var(--color-primary)]/20 text-white/70 hover:text-[var(--color-primary)] px-3 py-1 rounded text-[10px] transition-colors font-bold tracking-wider"
                        >
                          COPY & USE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {(isPending || isWaiting) && (
          <div className="mt-8 bg-[var(--color-warning)]/20 border border-[var(--color-warning)] p-4 rounded-xl flex items-center justify-center gap-3 text-[var(--color-warning)] font-mono animate-pulse">
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-[var(--color-warning)] animate-spin" />
            TRANSACTION IN PROGRESS... PLEASE WAIT
          </div>
        )}

      </div>
    </div>
  );
}
