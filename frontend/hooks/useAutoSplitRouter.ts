'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { AutoSplitRouterABI, ERC20ABI } from '@/lib/abi';
import { AUTO_SPLIT_ROUTER_FUNCTIONS, ERC20_FUNCTIONS } from '@/lib/constants/contracts';

interface Split {
  recipient: string;
  basisPoints: number;
  isVault: boolean;
}

interface UseAutoSplitRouterProps {
  routerAddress: `0x${string}`;
  cUSDAddress: `0x${string}`;
  celoAddress: `0x${string}`;
  runTx: (writeFn: () => Promise<`0x${string}`>) => Promise<any>;
  refetchBalances: () => void;
  addTransaction: (tx: any) => void;
}

export function useAutoSplitRouter({
  routerAddress,
  cUSDAddress,
  celoAddress,
  runTx,
  refetchBalances,
  addTransaction,
}: UseAutoSplitRouterProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [splits, setSplits] = useState<Split[]>([
    { recipient: '', basisPoints: 5000, isVault: false },
    { recipient: '', basisPoints: 5000, isVault: false },
  ]);

  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('cUSD');

  // Fetch On-Chain Rules
  const { data: onChainRules, refetch: refetchOnChainRules } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: AUTO_SPLIT_ROUTER_FUNCTIONS.GET_SPLIT_RULES,
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!routerAddress, refetchInterval: 2000 },
  });

  useEffect(() => {
    const rules = onChainRules as any;
    if (rules && Array.isArray(rules[0]) && rules[0].length > 0) {
      const [recipients, basisPoints, isVaultFlags] = rules;
      const loadedSplits = (recipients as string[]).map((r, i) => ({
        recipient: r,
        basisPoints: Number(basisPoints[i]),
        isVault: isVaultFlags[i],
      }));
      setSplits(loadedSplits);
    }
  }, [onChainRules]);

  const updateSplit = (index: number, field: keyof Split, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const addSplit = () => {
    if (splits.length < 10) {
      setSplits([...splits, { recipient: '', basisPoints: 0, isVault: false }]);
    }
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const totalBasisPoints = splits.reduce(
    (sum, s) => sum + Number(s.basisPoints || 0),
    0
  );

  const isReady =
    totalBasisPoints === 10000 &&
    splits.every(
      (s) => s.recipient.startsWith('0x') && s.recipient.length === 42
    );

  const saveOnChainRules = async () => {
    if (!isReady || !isConnected || !routerAddress) return;
    
    const recipients = splits.map((s) => s.recipient as `0x${string}`);
    const basisPoints = splits.map((s) => BigInt(s.basisPoints));
    const isVault = splits.map((s) => s.isVault);

    await runTx(async () => {
      return await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: AUTO_SPLIT_ROUTER_FUNCTIONS.SET_SPLIT_RULES,
        args: [recipients, basisPoints, isVault],
        type: 'legacy',
      });
    });

    refetchOnChainRules();
  };

  const executeRoutePayment = async () => {
    if (!amount || !isReady || !isConnected || !routerAddress) return;

    const parsedAmount = parseUnits(amount, 18);
    const isNative = token === 'CELO';
    const targetToken = isNative ? '0x0000000000000000000000000000000000000000' as `0x${string}` : cUSDAddress;

    if (!isNative) {
      // Step 1: Approve cUSD for Router
      await runTx(async () => {
        return await writeContractAsync({
          address: targetToken,
          abi: ERC20ABI,
          functionName: ERC20_FUNCTIONS.APPROVE,
          args: [routerAddress, parsedAmount],
          type: 'legacy',
        });
      });
    }

    // Step 2: Route Payment
    const routeTx = await runTx(async () => {
      return await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: AUTO_SPLIT_ROUTER_FUNCTIONS.ROUTE_PAYMENT,
        args: [targetToken, parsedAmount],
        value: isNative ? parsedAmount : undefined,
        type: 'legacy',
      });
    });

    // Add to history list
    addTransaction({
      id: routeTx || '0x...',
      token,
      amount,
      recipients: splits.map((s) => s.recipient),
      amounts: splits.map((s) => ((Number(amount) * s.basisPoints) / 10000).toFixed(2)),
      timestamp: Date.now(),
    });

    setAmount('');
    refetchBalances();
  };

  return {
    splits,
    amount,
    setAmount,
    token,
    setToken,
    updateSplit,
    addSplit,
    removeSplit,
    totalBasisPoints,
    isReady,
    saveOnChainRules,
    executeRoutePayment,
    refetchOnChainRules,
  };
}
