'use client';

import { useState, useEffect } from 'react';

export interface ClaimHistoryItem {
  id: string;
  amount: string;
  timestamp: number;
}

export function useHistory() {
  const [history, setHistory] = useState<ClaimHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating fetching from an indexer/subgraph
    const mockHistory: ClaimHistoryItem[] = [
      { id: '1', amount: '100', timestamp: Date.now() - 86400000 * 2 },
      { id: '2', amount: '100', timestamp: Date.now() - 86400000 * 1 },
      { id: '3', amount: '100', timestamp: Date.now() - 3600000 },
    ].reverse();

    const timer = setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { history, isLoading };
}
