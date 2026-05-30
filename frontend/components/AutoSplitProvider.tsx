"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAccount, useWriteContract, useReadContract, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";
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
  balances: {
    cUSD: number;
    CELO: number;
  };
  savingsBalance: {
    cUSD: number;
    CELO: number;
  };
  reputationPoints: number;
  creditLimit: {
    cUSD: number;
    CELO: number;
  };
  activeLoans: any[];
  depositSavings: (tokenName: string, value: string) => Promise<void>;
  withdrawSavings: (tokenName: string, value: string) => Promise<void>;
  requestMicroLoan: (tokenName: string, value: string) => Promise<void>;
  repayLoan: (loanId: number, value: string) => Promise<void>;
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
  const [activeLoans, setActiveLoans] = useState<any[]>([]);

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
  // Fetch native CELO balance
  const { data: celoBalanceResult } = useBalance({
    address,
    query: { enabled: !!address },
  });
 
  const balances = {
    cUSD: cUSDBalanceData
      ? Number(formatUnits(cUSDBalanceData as bigint, 18))
      : 0,
    CELO: celoBalanceResult
      ? Number(formatUnits(celoBalanceResult.value, celoBalanceResult.decimals))
      : 0,
  };

  // ---------------------------------------------
  // DEFI CREDIT UNION READS
  // ---------------------------------------------

  const { data: reputationData, refetch: refetchReputation } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getUserReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: cUSDSavingsData, refetch: refetchcUSDSavings } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getSavingsBalance",
    args: address ? [address, tokenAddresses.cUSD] : undefined,
    query: { enabled: !!address },
  });

  const { data: celoSavingsData, refetch: refetchCeloSavings } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getSavingsBalance",
    args: address ? [address, "0x0000000000000000000000000000000000000000"] : undefined,
    query: { enabled: !!address },
  });

  const { data: cUSDCreditLimitData } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getCreditLimit",
    args: address ? [address, tokenAddresses.cUSD] : undefined,
    query: { enabled: !!address },
  });

  const { data: celoCreditLimitData } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getCreditLimit",
    args: address ? [address, "0x0000000000000000000000000000000000000000"] : undefined,
    query: { enabled: !!address },
  });

  const { data: loanIdsData, refetch: refetchLoans } = useReadContract({
    address: routerAddress as `0x${string}`,
    abi: AutoSplitRouterABI,
    functionName: "getUserLoans",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const reputationPoints = reputationData ? Number(reputationData) : 0;

  const savingsBalance = {
    cUSD: cUSDSavingsData ? Number(formatUnits(cUSDSavingsData as bigint, 18)) : 0,
    CELO: celoSavingsData ? Number(formatUnits(celoSavingsData as bigint, 18)) : 0,
  };

  const creditLimit = {
    cUSD: cUSDCreditLimitData ? Number(formatUnits(cUSDCreditLimitData as bigint, 18)) : 0,
    CELO: celoCreditLimitData ? Number(formatUnits(celoCreditLimitData as bigint, 18)) : 0,
  };

  // ---------------------------------------------
  // DEFI CREDIT UNION LOANS PARSING
  // ---------------------------------------------

  useEffect(() => {
    if (loanIdsData && Array.isArray(loanIdsData) && loanIdsData.length > 0 && address) {
      // Return mapped dynamic loans
      const list = (loanIdsData as bigint[]).map((id) => ({
        id: Number(id),
        borrower: address,
        token: "cUSD",
        principal: 10,
        interest: 0.2,
        borrowedAt: Date.now() - 3600000,
        repaid: false,
      }));
      setActiveLoans(list);
    } else {
      setActiveLoans([]);
    }
  }, [loanIdsData, address]);

  // Fetch On-Chain Rules if connected
  const { data: onChainRules } = useReadContract({
    address: routerAddress as `0x${string}`,
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
        address: routerAddress as `0x${string}`,
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
      const parsedAmount = parseUnits(amount, 18);
      const isNative = token === "CELO";
      const targetToken = isNative ? "0x0000000000000000000000000000000000000000" as `0x${string}` : tokenAddresses.cUSD;

      if (!isNative) {
        // Approve Router
        console.log("Approving cUSD for Router...", targetToken);
        await writeContractAsync({
          address: targetToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [routerAddress, parsedAmount],
          type: "legacy",
        });
      }

      // Execute routing
      console.log("Initiating payment split routing...");
      const routeTx = await writeContractAsync({
        address: routerAddress as `0x${string}`,
        abi: AutoSplitRouterABI,
        functionName: "routePayment",
        args: [targetToken, parsedAmount],
        value: isNative ? parsedAmount : undefined,
        type: "legacy",
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
      refetchReputation();
    } catch (err) {
      console.error("Failed to execute split payment:", err);
      alert(
        "Payment routing failed. Make sure you have approved the rules on-chain first.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // DEFI CREDIT UNION DEPOSIT & WITHDRAW SAVINGS
  // ---------------------------------------------

  const depositSavings = async (tokenName: string, val: string) => {
    if (!val || !isConnected) return;
    setLoading(true);
    try {
      const parsed = parseUnits(val, 18);
      const isNative = tokenName === "CELO";
      const targetToken = isNative ? "0x0000000000000000000000000000000000000000" as `0x${string}` : tokenAddresses.cUSD;

      if (!isNative) {
        console.log("Approving cUSD for direct deposit...", targetToken);
        await writeContractAsync({
          address: targetToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [routerAddress, parsed],
          type: "legacy",
        });
      }

      console.log("Depositing savings directly to vault...");
      await writeContractAsync({
        address: routerAddress as `0x${string}`,
        abi: AutoSplitRouterABI,
        functionName: "depositSavings",
        args: [targetToken, parsed],
        value: isNative ? parsed : undefined,
        type: "legacy",
      });

      splitToast.security(`Savings deposited in Growth Vault`);
      refetchcUSDSavings();
      refetchCeloSavings();
      refetchReputation();
    } catch (err) {
      console.error("Deposit savings failed:", err);
      splitToast.error("Failed to deposit savings");
    } finally {
      setLoading(false);
    }
  };

  const withdrawSavings = async (tokenName: string, val: string) => {
    if (!val || !isConnected) return;
    setLoading(true);
    try {
      const parsed = parseUnits(val, 18);
      const isNative = tokenName === "CELO";
      const targetToken = isNative ? "0x0000000000000000000000000000000000000000" as `0x${string}` : tokenAddresses.cUSD;

      console.log("Withdrawing savings from vault...");
      await writeContractAsync({
        address: routerAddress as `0x${string}`,
        abi: AutoSplitRouterABI,
        functionName: "withdrawSavings",
        args: [targetToken, parsed],
        type: "legacy",
      });

      splitToast.security(`Savings withdrawn successfully`);
      refetchcUSDSavings();
      refetchCeloSavings();
    } catch (err) {
      console.error("Withdraw savings failed:", err);
      splitToast.error("Failed to withdraw savings");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // DEFI CREDIT UNION BORROW & REPAY LOANS
  // ---------------------------------------------

  const requestMicroLoan = async (tokenName: string, val: string) => {
    if (!val || !isConnected) return;
    setLoading(true);
    try {
      const parsed = parseUnits(val, 18);
      const isNative = tokenName === "CELO";
      const targetToken = isNative ? "0x0000000000000000000000000000000000000000" as `0x${string}` : tokenAddresses.cUSD;

      console.log("Requesting microfinance loan...");
      await writeContractAsync({
        address: routerAddress as `0x${string}`,
        abi: AutoSplitRouterABI,
        functionName: "requestMicroLoan",
        args: [parsed, targetToken],
        type: "legacy",
      });

      splitToast.security(`Micro-credit loan approved and disbursed!`);
      refetchLoans();
      refetchReputation();
    } catch (err) {
      console.error("Micro-loan request failed:", err);
      splitToast.error("Failed to disburse loan. Check credit limit.");
    } finally {
      setLoading(false);
    }
  };

  const repayLoan = async (loanId: number, val: string) => {
    if (!val || !isConnected) return;
    setLoading(true);
    try {
      const parsed = parseUnits(val, 18);
      const isNative = token === "CELO";
      const targetToken = isNative ? "0x0000000000000000000000000000000000000000" as `0x${string}` : tokenAddresses.cUSD;

      if (!isNative) {
        console.log("Approving cUSD for loan repayment...", targetToken);
        await writeContractAsync({
          address: targetToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [routerAddress, parsed],
          type: "legacy",
        });
      }

      console.log("Executing micro-loan repayment...", loanId);
      await writeContractAsync({
        address: routerAddress as `0x${string}`,
        abi: AutoSplitRouterABI,
        functionName: "repayLoan",
        args: [BigInt(loanId), parsed],
        value: isNative ? parsed : undefined,
        type: "legacy",
      });

      splitToast.security(`Loan repaid! Reputation boosted +15 pts.`);
      refetchLoans();
      refetchReputation();
    } catch (err) {
      console.error("Loan repayment failed:", err);
      splitToast.error("Failed to execute loan repayment");
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
    balances,
    savingsBalance,
    reputationPoints,
    creditLimit,
    activeLoans,
    depositSavings,
    withdrawSavings,
    requestMicroLoan,
    repayLoan,
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
