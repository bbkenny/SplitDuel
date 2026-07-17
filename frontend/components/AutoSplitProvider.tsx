'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits, erc20Abi } from 'viem';
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
  isAdmin: boolean;
  addTransaction: (tx: Transaction) => void;
  saveOnChainRules: () => Promise<void>;
  executeRoutePayment: () => Promise<void>;
  balances: {
    tokenBalance: number;
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
        USDm: CONTRACT_ADDRESSES.celo.USDm,
        EURm: CONTRACT_ADDRESSES.celo.EURm,
        USDT: CONTRACT_ADDRESSES.celo.USDT,
        USDC: CONTRACT_ADDRESSES.celo.USDC,
        CELO: CONTRACT_ADDRESSES.celo.CELO,
      };
    }
    return {
      router: CONTRACT_ADDRESSES.celoAlfajores.AUTO_SPLIT_ROUTER,
      USDm: CONTRACT_ADDRESSES.celoAlfajores.USDm,
      EURm: CONTRACT_ADDRESSES.celoAlfajores.EURm,
      USDT: CONTRACT_ADDRESSES.celoAlfajores.USDT,
      USDC: CONTRACT_ADDRESSES.celoAlfajores.USDC,
      CELO: CONTRACT_ADDRESSES.celoAlfajores.CELO,
    };
  };

  const activeAddrs = getActiveAddresses();
  const routerAddress = activeAddrs.router as `0x${string}`;

  const tokenAddresses: Record<string, `0x${string}`> = {
    USDm: activeAddrs.USDm as `0x${string}`,
    EURm: activeAddrs.EURm as `0x${string}`,
    USDT: activeAddrs.USDT as `0x${string}`,
    USDC: activeAddrs.USDC as `0x${string}`,
    CELO: activeAddrs.CELO as `0x${string}`,
  };

  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Determine target chain (default to Alfajores if not on Mainnet)
  const targetChainId = chainId === 42220 ? 42220 : 44787;

  const addTransaction = (tx: Transaction) => {
    const newHistory = [tx, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('autosplit_history', JSON.stringify(newHistory));
  };

  useEffect(() => {
    const saved = localStorage.getItem('autosplit_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);  // Initialize Router custom hook
  const routerHook = useAutoSplitRouter({
    routerAddress,
    tokenAddresses,
    runTx: txSim.runTx,
    refetchBalances,
    addTransaction,
  });

  // Initialize Treasury custom hook
  const treasuryHook = useTreasury({
    routerAddress,
    tokenAddresses,
    runTx: txSim.runTx,
    refetchBalances,
  });
  // Native CELO balance
  const { data: celoBalanceResult, refetch: refetchCeloBalance } = useBalance({
    address,
    chainId: targetChainId,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Custom ERC20 token balances for selected token
  const { data: tokenBalanceRaw, refetch: refetchTokenBalance } = useReadContract({
    address: tokenAddresses[routerHook?.token || 'USDm'] as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    chainId: targetChainId,
    query: { enabled: !!address && !!tokenAddresses[routerHook?.token || 'USDm'], refetchInterval: 5000 },
  });

  const balances = {
    tokenBalance: tokenBalanceRaw != null ? Number(formatUnits(tokenBalanceRaw as bigint, (routerHook?.token === 'USDT' || routerHook?.token === 'USDC') ? 6 : 18)) : 0,
    CELO: celoBalanceResult ? Number(formatUnits(celoBalanceResult.value, celoBalanceResult.decimals)) : 0,
  };

  function refetchBalances() {
    if (typeof refetchTokenBalance === 'function') refetchTokenBalance();
    if (typeof refetchCeloBalance === 'function') refetchCeloBalance();
  }



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
    isAdmin: routerHook.isAdmin,
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
