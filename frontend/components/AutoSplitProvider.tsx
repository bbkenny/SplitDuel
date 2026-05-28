"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/constants";
import { AutoSplitRouterABI, ERC20ABI } from "@/lib/abi";
import { splitToast } from "@/components/ui/Toast";

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
}

const AutoSplitContext = createContext<SplitState | undefined>(undefined);

export const AutoSplitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Dynamic chain target detection (defaults to celoAlfajores if unknown)
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
  const routerAddress = activeAddrs.router;
  const tokenAddress = activeAddrs.cUSD;

  const [splits, setSplits] = useState<Split[]>([
    { recipient: "", basisPoints: 5000, isVault: false },
    { recipient: "", basisPoints: 5000, isVault: false },
  ]);
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("cUSD");
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Token contract addresses mapping
  const tokenAddresses: Record<string, `0x${string}`> = {
    cUSD: tokenAddress as `0x${string}`,
    CELO:
      chainId === 42220
        ? "0x471EcE3750Da237f93B8E29B7377C6Ba1574beb9"
        : "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
  };

  // Fetch balances for each token
  const { data: cUSDBalanceData } = useReadContract({
    address: tokenAddresses.cUSD,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: celoBalanceData } = useReadContract({
    address: tokenAddresses.CELO,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const balances = {
    cUSD: cUSDBalanceData
      ? Number(parseUnits(cUSDBalanceData as any, 18).toString()) / 1e18
      : 0,
    CELO: celoBalanceData
      ? Number(parseUnits(celoBalanceData as any, 18).toString()) / 1e18
      : 0,
  };

  // Fetch On-Chain Rules if connected
  const { data: onChainRules } = useReadContract({
    address: routerAddress,
    abi: AutoSplitRouterABI,
    functionName: "getSplitRules",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
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

  useEffect(() => {
    const saved = localStorage.getItem("autosplit_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addTransaction = (tx: Transaction) => {
    const newHistory = [tx, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem("autosplit_history", JSON.stringify(newHistory));
  };

  const updateSplit = (index: number, field: keyof Split, value: any) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setSplits(newSplits);
  };

  const addSplit = () => {
    if (splits.length < 10)
      setSplits([...splits, { recipient: "", basisPoints: 0, isVault: false }]);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const totalBasisPoints = splits.reduce(
    (sum, s) => sum + Number(s.basisPoints || 0),
    0,
  );
  const isReady =
    totalBasisPoints === 10000 &&
    splits.every(
      (s) => s.recipient.startsWith("0x") && s.recipient.length === 42,
    );

  // 1. Save local configurations onchain using setSplitRules
  const saveOnChainRules = async () => {
    if (!isReady || !isConnected) return;
    setLoading(true);
    try {
      const recipients = splits.map((s) => s.recipient);
      const basisPoints = splits.map((s) => BigInt(s.basisPoints));
      const isVault = splits.map((s) => s.isVault);

      console.log("Setting split rules on-chain...", {
        recipients,
        basisPoints,
        isVault,
      });

      const tx = await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: "setSplitRules",
        args: [recipients, basisPoints, isVault],
        type: "legacy", // CRITICAL: MiniPay EIP-1559 compatibility override
      });
      console.log("Splits rules set successfully. Tx Hash:", tx);
      splitToast.security("Rules synced with Celo ledger");
    } catch (err) {
      console.error("Failed to set split rules:", err);
      splitToast.error("Failed to save rules on-chain");
    } finally {
      setLoading(false);
    }
  };

  // 2. Approve cUSD and route payment
  const executeRoutePayment = async () => {
    if (!amount || !isReady || !isConnected) return;
    setLoading(true);
    try {
      const parsedAmount = parseUnits(amount, 18); // cUSD uses 18 decimals

      // 2a. Approve Router
      console.log("Approving cUSD for Router...", tokenAddress);
      const approveTx = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "approve",
        args: [routerAddress, parsedAmount],
        type: "legacy", // CRITICAL: MiniPay EIP-1559 compatibility override
      });
      console.log("Approval transaction submitted:", approveTx);

      // 2b. Execute routing
      console.log("Initiating payment split routing...");
      const routeTx = await writeContractAsync({
        address: routerAddress,
        abi: AutoSplitRouterABI,
        functionName: "routePayment",
        args: [tokenAddress, parsedAmount],
        type: "legacy", // CRITICAL: MiniPay EIP-1559 compatibility override
      });
      console.log("Split route successful. Tx Hash:", routeTx);

      // Log success locally
      addTransaction({
        id: routeTx,
        token,
        amount,
        recipients: splits.map((s) => s.recipient),
        amounts: splits.map((s) =>
          ((Number(amount) * s.basisPoints) / 10000).toFixed(2),
        ),
        timestamp: Date.now(),
      });
      setAmount("");
    } catch (err) {
      console.error("Failed to execute split payment:", err);
      alert(
        "Payment routing failed. Make sure you have approved the rules on-chain first.",
      );
    } finally {
      setLoading(false);
    }
  };

  const value: SplitState = {
    splits,
    amount,
    token,
    history,
    loading,
    setAmount,
    setToken,
    updateSplit,
    addSplit,
    removeSplit,
    totalBasisPoints,
    isReady,
    addTransaction,
    saveOnChainRules,
    executeRoutePayment,
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
    throw new Error("useAutoSplit must be used within AutoSplitProvider");
  return context;
};
