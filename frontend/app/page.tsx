'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DuelWarRoom from '@/components/DuelWarRoom';
import { Shield, TrendingUp, Zap, History, Target } from 'lucide-react';

export default function SplitDuelHome() {
  const [mounted, setMounted] = useState(false);
  const [inDuel, setInDuel] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (inDuel) {
    return <DuelWarRoom />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono flex flex-col">
      {/* Navbar Minimal */}
      <nav className="p-6 border-b border-green-500/20 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] flex items-center gap-3">
          <Zap className="text-green-500" />
          SPLIT DUEL
        </h1>
        <div className="flex gap-4">
          <button className="bg-gray-800 border border-green-500/30 text-green-400 px-4 py-2 rounded hover:bg-gray-700 transition">
            Leaderboard
          </button>
          <w3m-button />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="z-10 max-w-2xl bg-gray-900/80 p-8 rounded-xl border border-green-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(74,222,128,0.1)]">
          <h2 className="text-4xl font-bold text-white mb-6 tracking-wider">
            ENTER THE WAR ROOM
          </h2>
          
          <p className="text-lg text-green-500/80 mb-8 leading-relaxed">
            A 1v1 real-time strategy battle where two players compete to grow their treasury the fastest. Route payments to ATTACK, DEFEND, or INVEST. 
            <br/><br/>
            <span className="text-white font-bold">Only the DeFi yield is at stake. Your principal is always safe.</span>
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div className="bg-gray-800/50 p-4 rounded border border-red-500/20">
              <Zap className="text-red-400 mx-auto mb-2" />
              <div className="text-red-400 font-bold">ATTACK</div>
              <div className="text-gray-400 mt-1">Drain opponent's yield</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded border border-blue-500/20">
              <Shield className="text-blue-400 mx-auto mb-2" />
              <div className="text-blue-400 font-bold">DEFEND</div>
              <div className="text-gray-400 mt-1">Block incoming attacks</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded border border-green-500/20">
              <TrendingUp className="text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-bold">INVEST</div>
              <div className="text-gray-400 mt-1">Compound your treasury</div>
            </div>
          </div>

          {!address ? (
            <div className="animate-pulse text-yellow-400 text-lg">
              Connect Wallet to Enter
            </div>
          ) : (
            <button 
              onClick={() => setInDuel(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-lg font-bold tracking-widest text-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
            >
              FIND OPPONENT →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
