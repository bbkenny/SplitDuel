'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import { ERC20ABI } from '@/lib/abi';
import { splitToast } from '@/components/ui/Toast';
import { useTransactionSimulation, TxStep, SimulationDetails } from '@/hooks/useTransactionSimulation';
import { useAutoSplitRouter } from '@/hooks/useAutoSplitRouter';
import { useTreasury } from '@/hooks/useTreasury';

interface Split {
  recipient: string;
  basisPoints: number;
  isVault: boolean;
}

interface Transaction {
  id: string;
  token: string;
  amount: string;
  recipients: string[];
  amounts: string[];
  timestamp: number;
}

interface SplitState {
  splits: Split[];
  amount: string;
  token: string;
  history: Transaction[];
  loading: boolean;
  setAmount: (value: string) => void;
  setToken: (value: string) => void;
  updateSplit: (index: number, field: keyof Split, value: any) => void;
  addSplit: () => void;
  removeSplit: (index: number) => void;
  totalBasisPoints: number;
  isReady: boolean;
  addTransaction: (tx: Transaction) => void;
  saveOnChainRules: () => Promise<void>;
  executeRoutePayment: () => Promise<void>;
  balances: {
    cUSD: number;
    CELO: number;
  };
  treasuryBalance: {
    cUSD: number;
    CELO: number;
  };
  depositTreasury: (tokenName: string, value: string) => Promise<void>;
  withdrawTreasury: (tokenName: string, value: string) => Promise<void>;
  refetchBalances: () => void;

  // Multi-stage TX and Simulation
  txStep: TxStep;
  txError: string | null;
  txHash: string | null;
  txSimulation: SimulationDetails | null;
  txReset: () => void;
  txSimulatePayment: (tokenName: string, totalAmount: string, splits: Split[]) => Promise<any>;
}

const AutoSplitContext = createContext<SplitState | undefined>(undefined);

export const AutoSplitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address, isConnected, chainId } = useAccount();
  const txSim = useTransactionSimulation();

  const getActiveAddresses = () => {
    if (chainId === 42220) {
      return {
        router: CONTRACT_ADDRESSES.celo.AUTO_SPLIT_ROUTER,
        cUSD: CONTRACT_ADDRESSES.celo.cUSD,
      };
    }
    return {
      router: CONTRACT_ADDRESSES.celoAlfajores.AUTO_SPLIT_ROUTER,
      cUSD: CONTRACT_ADDRESSES.celoAlfajores.cUSD,
    };
  };

  const activeAddrs = getActiveAddresses();
  const routerAddress = activeAddrs.router as `0x${string}`;
  const tokenAddress = activeAddrs.cUSD as `0x${string}`;

  const tokenAddresses: Record<string, `0x${string}`> = {
    cUSD: tokenAddress,
    CELO:
      chainId === 42220
        ? '0x471EcE3750Da237f93B8E29B7377C6Ba1574beb9'
        : '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
  };

  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine target chain (default to Alfajores if not on Mainnet)
  const targetChainId = chainId === 42220 ? 42220 : 44787;

  // Fetch balances
  const { data: cUSDBalanceData, refetch: refetchcUSDBalance } = useReadContract({
    address: tokenAddresses.cUSD,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address, refetchInterval: 2000 },
  });

  const { data: celoBalanceResult, refetch: refetchCeloBalance } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 2000 },
  });

  console.log("AutoSplit Debug - Address:", address, "Chain:", targetChainId);
  console.log("AutoSplit Debug - cUSD Data:", cUSDBalanceData);
  console.log("AutoSplit Debug - CELO Data:", celoBalanceResult);

  const balances = {
    cUSD: cUSDBalanceData ? Number(formatUnits(cUSDBalanceData as bigint, 18)) : 0,
    CELO: celoBalanceResult ? Number(formatUnits(celoBalanceResult.value, celoBalanceResult.decimals)) : 0,
  };

  const refetchBalances = () => {
    refetchcUSDBalance();
    refetchCeloBalance();
  };

  const addTransaction = (tx: Transaction) => {
    const newHistory = [tx, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('autosplit_history', JSON.stringify(newHistory));
  };

  useEffect(() => {
    const saved = localStorage.getItem('autosplit_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Initialize Router custom hook
  const routerHook = useAutoSplitRouter({
    routerAddress,
    cUSDAddress: tokenAddresses.cUSD,
    celoAddress: tokenAddresses.CELO,
    runTx: txSim.runTx,
    refetchBalances,
    addTransaction,
  });

  // Initialize Treasury custom hook
  const treasuryHook = useTreasury({
    routerAddress,
    cUSDAddress: tokenAddresses.cUSD,
    celoAddress: tokenAddresses.CELO,
    runTx: txSim.runTx,
    refetchBalances,
  });

  const handleSaveOnChainRules = async () => {
    setLoading(true);
    try {
      await routerHook.saveOnChainRules();
      splitToast.security('Rules synced with Celo ledger');
    } catch (err) {
      console.error(err);
      splitToast.error('Failed to save rules on-chain');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRoutePayment = async () => {
    setLoading(true);
    try {
      await routerHook.executeRoutePayment();
      splitToast.success('Revenue routed successfully');
    } catch (err) {
      console.error(err);
      splitToast.error('Payment routing failed. Approve rules first.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositTreasury = async (tok: string, val: string) => {
    setLoading(true);
    try {
      await treasuryHook.depositTreasury(tok, val);
      splitToast.security('Funds deposited in Shared Treasury');
    } catch (err) {
      console.error(err);
      splitToast.error('Failed to deposit treasury');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawTreasury = async (tok: string, val: string) => {
    setLoading(true);
    try {
      await treasuryHook.withdrawTreasury(tok, val);
      splitToast.security('Funds withdrawn from Treasury successfully');
    } catch (err) {
      console.error(err);
      splitToast.error('Failed to withdraw treasury');
    } finally {
      setLoading(false);
    }
  };

  const value: SplitState = {
    splits: routerHook.splits,
    amount: routerHook.amount,
    token: routerHook.token,
    history,
    loading,
    setAmount: routerHook.setAmount,
    setToken: routerHook.setToken,
    updateSplit: routerHook.updateSplit,
    addSplit: routerHook.addSplit,
    removeSplit: routerHook.removeSplit,
    totalBasisPoints: routerHook.totalBasisPoints,
    isReady: routerHook.isReady,
    addTransaction,
    saveOnChainRules: handleSaveOnChainRules,
    executeRoutePayment: handleExecuteRoutePayment,
    balances,
    treasuryBalance: treasuryHook.treasuryBalance,
    depositTreasury: handleDepositTreasury,
    withdrawTreasury: handleWithdrawTreasury,
    refetchBalances,

    // Expose simulation states
    txStep: txSim.step,
    txError: txSim.error,
    txHash: txSim.txHash,
    txSimulation: txSim.simulation,
    txReset: txSim.reset,
    txSimulatePayment: txSim.simulatePayment,
  };

  return (
    <AutoSplitContext.Provider value={value}>
      {children}
    </AutoSplitContext.Provider>
  );
};

export const useAutoSplit = (): SplitState => {
  const context = useContext(AutoSplitContext);
  if (!context)
    throw new Error('useAutoSplit must be used within AutoSplitProvider');
  return context;
};
