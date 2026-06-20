import { useState, useEffect } from "react";

export function useCeloPrice() {
  const [celoPrice, setCeloPrice] = useState<number>(0.62); // Fallback

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Source 1: CoinGecko
        let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd");
        if (res.ok) {
          const data = await res.json();
          if (data?.celo?.usd) return setCeloPrice(data.celo.usd);
        }

        // Source 2: Binance
        res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=CELOUSDT");
        if (res.ok) {
          const data = await res.json();
          if (data?.price) return setCeloPrice(parseFloat(data.price));
        }

        // Source 3: KuCoin
        res = await fetch("https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=CELO-USDT");
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.price) return setCeloPrice(parseFloat(data.data.price));
        }
      } catch (error) {
        console.error("Failed to fetch CELO price:", error);
      }
    };

    fetchPrice();
    // Refetch every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return celoPrice;
}
