import { useQuery } from "@tanstack/react-query";

export interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  description: string;
}

export function useMarkets() {
  return useQuery<MarketCoin[]>({
    queryKey: ["/api/markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error("Failed to fetch markets");
      return res.json();
    },
    refetchInterval: 60000,
  });
}

export function useCoin(id: string) {
  return useQuery<CoinDetail>({
    queryKey: ["/api/coin", id],
    queryFn: async () => {
      const res = await fetch(`/api/coin/${id}`);
      if (!res.ok) throw new Error("Failed to fetch coin");
      return res.json();
    },
    enabled: !!id,
  });
}
