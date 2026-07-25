'use client';

import React from 'react';
import { useReadContract } from 'wagmi';
import { Shield } from 'lucide-react';
import { DUEL_MANAGER_ADDRESS, DUEL_MANAGER_ABI } from '@/lib/contracts';
import { type Address } from 'viem';

// The tiers based on fights completed
export const getReputationTier = (fights: number) => {
  if (fights >= 100) return { name: 'Legend', buff: '+2% All-Round', color: 'text-purple-400' };
  if (fights >= 50) return { name: 'Champion', buff: '+1.5% Attack', color: 'text-[#F4D935]' };
  if (fights >= 20) return { name: 'Veteran', buff: '+1% Defend', color: 'text-[#5DBF7E]' };
  if (fights >= 5) return { name: 'Warrior', buff: '+0.5% Invest', color: 'text-orange-400' };
  return { name: 'Novice', buff: 'No Buff', color: 'text-gray-400' };
};

export default function ReputationBadge({ playerAddress }: { playerAddress: Address | undefined }) {
  const { data: fightsCompletedBigInt } = useReadContract({
    address: DUEL_MANAGER_ADDRESS,
    abi: [...DUEL_MANAGER_ABI, {
      "inputs": [{"internalType": "address", "name": "", "type": "address"}],
      "name": "fightsCompleted",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }], // Added to ABI here so it works even if not yet fully updated in constants
    functionName: 'fightsCompleted',
    args: playerAddress ? [playerAddress] : undefined,
    query: { enabled: !!playerAddress }
  });

  const fights = Number(fightsCompletedBigInt || 0n);
  const tier = getReputationTier(fights);

  if (!playerAddress) return null;

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-[#5DBF7E]/20 px-3 py-1.5 rounded-full mt-2">
      <Shield className={`w-4 h-4 ${tier.color}`} />
      <span className={`text-xs font-bold tracking-widest ${tier.color}`}>
        {tier.name.toUpperCase()}
      </span>
      <span className="text-white/40 text-[10px] mx-1">•</span>
      <span className="text-[10px] tracking-widest text-[#5DBF7E]">
        {fights} FIGHTS
      </span>
      {tier.name !== 'Novice' && (
        <>
          <span className="text-white/40 text-[10px] mx-1">•</span>
          <span className="text-[10px] tracking-widest text-[#F4D935]">
            {tier.buff}
          </span>
        </>
      )}
    </div>
  );
}
