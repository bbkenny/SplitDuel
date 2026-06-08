'use client';

import { useState } from 'react';
import { usePublicClient } from 'wagmi';

export type TxStep = 'idle' | 'preparing' | 'broadcasting' | 'confirming' | 'confirmed' | 'failed';

export interface SimulationDetails {
  tokenName: string;
  totalAmount: string;
  recipients: string[];
  percentages: number[];
  amounts: string[];
  isVault: boolean[];
  estimatedGasFee: string;
}

export function useTransactionSimulation() {
  const [step, setStep] = useState<TxStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationDetails | null>(null);
  const publicClient = usePublicClient();

  const reset = () => {
    setStep('idle');
    setError(null);
    setTxHash(null);
    setSimulation(null);
  };

  const runTx = async (writeFn: () => Promise<`0x${string}`>) => {
    setStep('preparing');
    setError(null);
    setTxHash(null);
    try {
      // 1. Preparing (signature request)
      const hash = await writeFn();
      
      // 2. Broadcasting (hash received)
      setTxHash(hash);
      setStep('broadcasting');

      // 3. Confirming (waiting for receipt)
      setStep('confirming');
      
      if (!publicClient) {
        throw new Error('Web3 public client is not initialized');
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.status === 'success') {
        setStep('confirmed');
        return receipt;
      } else {
        throw new Error('Transaction reverted on-chain');
      }
    } catch (err: any) {
      console.error('Transaction execution failed:', err);
      const userMessage = err.shortMessage || err.message || 'Transaction failed';
      setError(userMessage);
      setStep('failed');
      throw err;
    }
  };

  const simulatePayment = async (
    tokenName: string,
    totalAmount: string,
    splits: Array<{ recipient: string; basisPoints: number; isVault: boolean }>
  ) => {
    const numericAmount = parseFloat(totalAmount || '0');
    if (isNaN(numericAmount) || numericAmount <= 0) return null;

    const recipients = splits.map(s => s.recipient);
    const percentages = splits.map(s => s.basisPoints / 100);
    const amounts = splits.map(s => ((numericAmount * s.basisPoints) / 10000).toFixed(4));
    const isVault = splits.map(s => s.isVault);

    // Hardcode Celo's ultra-low gas fee simulation for user readability
    const estimatedGasFee = '0.0005 CELO';

    const sim: SimulationDetails = {
      tokenName,
      totalAmount,
      recipients,
      percentages,
      amounts,
      isVault,
      estimatedGasFee,
    };
    
    setSimulation(sim);
    return sim;
  };

  return {
    step,
    setStep,
    error,
    setError,
    txHash,
    simulation,
    simulatePayment,
    runTx,
    reset,
  };
}
