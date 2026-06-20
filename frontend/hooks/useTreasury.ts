'use client';

import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { AutoSplitRouterABI, ERC20ABI } from '@/lib/abi';
import { VAULT_ADAPTER_FUNCTIONS, ERC20_FUNCTIONS } from '@/lib/constants/contracts';

interface UseTreasuryProps {
  routerAddress: `0x${string}`;
  cUSDAddress: `0x${string}`;
  celoAddress: `0x${string}`;
  runTx: (writeFn: () => Promise<`0x${string}`>) => Promise<any>;
  refetchBalances: () => void;
}

export function useTreasury({
  routerAddress,
  cUSDAddress,
  celoAddress,
  runTx,
  refetchBalances,
}: UseTreasuryProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Fetch cUSD Treasury Balance
  const { data: cUSDTreasuryData, refetch: refetchcUSDTreasury } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: VAULT_ADAPTER_FUNCTIONS.GET_TREASURY_BALANCE,
    args: address ? [address, cUSDAddress] : undefined,
    query: { enabled: !!address && !!routerAddress, refetchInterval: 2000 },
  });

  // Fetch CELO Treasury Balance
  const { data: celoTreasuryData, refetch: refetchCeloTreasury } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: VAULT_ADAPTER_FUNCTIONS.GET_TREASURY_BALANCE,
    args: address ? [address, '0x0000000000000000000000000000000000000000'] : undefined,
    query: { enabled: !!address && !!routerAddress, refetchInterval: 2000 },
  });

  const treasuryBalance = {
    cUSD: cUSDTreasuryData ? Number(formatUnits(cUSDTreasuryData as bigint, 18)) : 0,
    CELO: celoTreasuryData ? Number(formatUnits(celoTreasuryData as bigint, 18)) : 0,
  };

  const refetchTreasury = () => {
    refetchcUSDTreasury();
    refetchCeloTreasury();
    refetchBalances();
  };

  const depositTreasury = async (tokenName: string, val: string) => {
    if (!val || !isConnected || !routerAddress) return;
    const parsed = parseUnits(val, 18);
    const isNative = tokenName === 'CELO';
    const targetToken = isNative ? '0x0000000000000000000000000000000000000000' as `0x${string}` : cUSDAddress;

    if (!isNative) {
      // Step 1: Approve cUSD for Router (run inside simulation lifecycle if needed, or inline)
      await runTx(async () => {
        return await writeContractAsync({
          address: targetToken,
          abi: ERC20ABI,
          functionName: ERC20_FUNCTIONS.APPROVE,
          args: [routerAddress, parsed],
          type: 'legacy',
        });
      });
    }

    // Step 2: Deposit into Treasury
    await runTx(async () => {
      return await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: VAULT_ADAPTER_FUNCTIONS.DEPOSIT_TREASURY,
        args: [targetToken, parsed],
        value: isNative ? parsed : undefined,
        type: 'legacy',
      });
    });

    refetchTreasury();
  };

  const withdrawTreasury = async (tokenName: string, val: string) => {
    if (!val || !isConnected || !routerAddress) return;
    const parsed = parseUnits(val, 18);
    const isNative = tokenName === 'CELO';
    const targetToken = isNative ? '0x0000000000000000000000000000000000000000' as `0x${string}` : cUSDAddress;

    await runTx(async () => {
      return await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: VAULT_ADAPTER_FUNCTIONS.WITHDRAW_TREASURY,
        args: [targetToken, parsed],
        type: 'legacy',
      });
    });

    refetchTreasury();
  };

  return {
    treasuryBalance,
    refetchTreasury,
    depositTreasury,
    withdrawTreasury,
  };
}
