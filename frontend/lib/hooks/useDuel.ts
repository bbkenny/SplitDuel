'use client';

import { useCallback, useMemo } from 'react';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import type { Address, Hex } from 'viem';
import {
  DUEL_MANAGER_ADDRESS,
  DUEL_MANAGER_ABI,
  ERC20_ABI,
  NATIVE_CELO,
  DuelState,
} from '../duelManager';

// ── Decoded shapes ──────────────────────────────────────────────────────────
export interface DuelInfo {
  player1: Address;
  player2: Address;
  token: Address;
  stakePerPlayer: bigint;
  startTime: bigint;
  currentRound: number;
  p1YieldScore: bigint;
  p2YieldScore: bigint;
  p1Shield: bigint;
  p2Shield: bigint;
  state: DuelState;
}

export interface RoundInfo {
  p1Commit: Hex;
  p2Commit: Hex;
  bothCommittedAt: bigint;
  p1Revealed: boolean;
  p2Revealed: boolean;
  p1Attack: number;
  p1Defend: number;
  p1Invest: number;
  p2Attack: number;
  p2Defend: number;
  p2Invest: number;
}

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

function decodeDuel(raw: readonly unknown[] | undefined): DuelInfo | null {
  if (!raw) return null;
  const r = raw as any[];
  return {
    player1: r[0],
    player2: r[1],
    token: r[2],
    stakePerPlayer: r[3],
    startTime: r[4],
    currentRound: Number(r[5]),
    p1YieldScore: r[6],
    p2YieldScore: r[7],
    p1Shield: r[8],
    p2Shield: r[9],
    state: Number(r[10]) as DuelState,
  };
}

function decodeRound(raw: readonly unknown[] | undefined): RoundInfo | null {
  if (!raw) return null;
  const r = raw as any[];
  return {
    p1Commit: r[0],
    p2Commit: r[1],
    bothCommittedAt: r[2],
    p1Revealed: r[3],
    p2Revealed: r[4],
    p1Attack: Number(r[5]),
    p1Defend: Number(r[6]),
    p1Invest: Number(r[7]),
    p2Attack: Number(r[8]),
    p2Defend: Number(r[9]),
    p2Invest: Number(r[10]),
  };
}

/**
 * Live duel + current-round state. Polls every few seconds so the war room
 * reflects the opponent's commits/reveals and round advances without a refresh.
 */
export function useDuelData(duelId?: bigint) {
  const enabled = duelId !== undefined && duelId > 0n;

  const { data: duelRaw, refetch: refetchDuel } = useReadContract({
    address: DUEL_MANAGER_ADDRESS,
    abi: DUEL_MANAGER_ABI,
    functionName: 'duels',
    args: enabled ? [duelId!] : undefined,
    query: { enabled, refetchInterval: 4000 },
  });

  const duel = decodeDuel(duelRaw as readonly unknown[] | undefined);
  const round = duel?.currentRound ?? 0;

  const { data: roundRaw, refetch: refetchRound } = useReadContract({
    address: DUEL_MANAGER_ADDRESS,
    abi: DUEL_MANAGER_ABI,
    functionName: 'duelRounds',
    args: enabled && round > 0 ? [duelId!, round] : undefined,
    query: { enabled: enabled && round > 0, refetchInterval: 4000 },
  });

  const roundInfo = decodeRound(roundRaw as readonly unknown[] | undefined);

  const refetch = useCallback(() => {
    refetchDuel();
    refetchRound();
  }, [refetchDuel, refetchRound]);

  return { duel, round: roundInfo, refetch };
}

/** The duelId (if any) the connected wallet is currently locked into. */
export function useActiveDuel() {
  const { address } = useAccount();
  const { data, refetch } = useReadContract({
    address: DUEL_MANAGER_ADDRESS,
    abi: DUEL_MANAGER_ABI,
    functionName: 'activeDuel',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });
  const active = (data as bigint | undefined) ?? 0n;
  return { activeDuelId: active > 0n ? active : undefined, refetch };
}

/**
 * ERC-20 allowance/balance for staking a non-native token into the DuelManager.
 * Returns nulls for native CELO (no approval needed).
 */
export function useTokenApproval(token?: Address, amount?: bigint) {
  const { address } = useAccount();
  const isNative = !token || token.toLowerCase() === NATIVE_CELO;

  const { data, refetch } = useReadContracts({
    contracts:
      address && token && !isNative
        ? [
            {
              address: token,
              abi: ERC20_ABI,
              functionName: 'allowance',
              args: [address, DUEL_MANAGER_ADDRESS],
            },
            {
              address: token,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [address],
            },
          ]
        : [],
    query: { enabled: !!address && !!token && !isNative },
  });

  const allowance = (data?.[0]?.result as bigint | undefined) ?? 0n;
  const balance = (data?.[1]?.result as bigint | undefined) ?? 0n;
  const needsApproval = !isNative && amount !== undefined && allowance < amount;

  return { isNative, allowance, balance, needsApproval, refetch };
}

/**
 * Write-side of the duel: one shared write hook plus typed action helpers and a
 * single receipt-wait so callers get consistent pending/confirming/error state.
 */
export function useDuelActions() {
  const { writeContractAsync, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const approve = useCallback(
    (token: Address, amount: bigint) =>
      writeContractAsync({
        address: token,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DUEL_MANAGER_ADDRESS, amount],
      }),
    [writeContractAsync],
  );

  const createDuel = useCallback(
    (token: Address, stake: bigint) => {
      const isNative = token.toLowerCase() === NATIVE_CELO;
      return writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'createDuel',
        args: [token, stake],
        value: isNative ? stake : 0n,
      });
    },
    [writeContractAsync],
  );

  const joinDuel = useCallback(
    (duelId: bigint, token: Address, stake: bigint) => {
      const isNative = token.toLowerCase() === NATIVE_CELO;
      return writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'joinDuel',
        args: [duelId],
        value: isNative ? stake : 0n,
      });
    },
    [writeContractAsync],
  );

  const commitRound = useCallback(
    (duelId: bigint, commitHash: Hex) =>
      writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'commitRound',
        args: [duelId, commitHash],
      }),
    [writeContractAsync],
  );

  const revealRound = useCallback(
    (duelId: bigint, attack: number, defend: number, invest: number, salt: Hex) =>
      writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'revealRound',
        args: [duelId, attack, defend, invest, salt],
      }),
    [writeContractAsync],
  );

  const forfeitRound = useCallback(
    (duelId: bigint) =>
      writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'forfeitRound',
        args: [duelId],
      }),
    [writeContractAsync],
  );

  const cancelDuel = useCallback(
    (duelId: bigint) =>
      writeContractAsync({
        address: DUEL_MANAGER_ADDRESS,
        abi: DUEL_MANAGER_ABI,
        functionName: 'cancelDuel',
        args: [duelId],
      }),
    [writeContractAsync],
  );

  return useMemo(
    () => ({
      approve,
      createDuel,
      joinDuel,
      commitRound,
      revealRound,
      forfeitRound,
      cancelDuel,
      hash,
      isPending,
      isConfirming,
      isConfirmed,
      error,
      reset,
    }),
    [
      approve,
      createDuel,
      joinDuel,
      commitRound,
      revealRound,
      forfeitRound,
      cancelDuel,
      hash,
      isPending,
      isConfirming,
      isConfirmed,
      error,
      reset,
    ],
  );
}

export { ZERO_BYTES32 };
