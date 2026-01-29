'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import DailyRewardABI from '@/lib/abi/DailyReward.json';
import { base } from 'viem/chains';
import { useEffect, useState } from 'react';

export function useDailyReward() {
  const { address, chainId } = useAccount();
  const currentChainId = chainId || base.id;
  const contractAddress = CONTRACT_ADDRESSES[currentChainId as keyof typeof CONTRACT_ADDRESSES]?.DAILY_REWARD as `0x${string}`;

  // Read: Check if user can claim
  const { 
    data: canClaim, 
    refetch: refetchCanClaim,
    isLoading: isLoadingStatus 
  } = useReadContract({
    address: contractAddress,
    abi: DailyRewardABI,
    functionName: 'canClaim',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Read: Get last claim time
  const { data: lastClaimTime } = useReadContract({
    address: contractAddress,
    abi: DailyRewardABI,
    functionName: 'lastClaimTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Write: Claim reward
  const { 
    data: hash, 
    writeContract: claimReward, 
    isPending: isClaiming,
    error: claimError 
  } = useWriteContract();

  // Wait for transaction
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaim = () => {
    if (!address) return;
    claimReward({
      address: contractAddress,
      abi: DailyRewardABI,
      functionName: 'claim',
    });
  };

  // Calculate next claim time
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);

  useEffect(() => {
    if (lastClaimTime) {
      const lastClaim = Number(lastClaimTime) * 1000;
      const cooldown = 24 * 60 * 60 * 1000; // 24 hours
      setNextClaimTime(new Date(lastClaim + cooldown));
    }
  }, [lastClaimTime]);

  return {
    canClaim: !!canClaim,
    nextClaimTime,
    handleClaim,
    isClaiming,
    isConfirming,
    isConfirmed,
    hash,
    error: claimError,
    refetchStatus: refetchCanClaim
  };
}
