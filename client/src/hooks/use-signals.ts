import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Signal } from "@shared/schema";

interface SignalsResponse {
  signals: Signal[];
  stats: {
    totalTrades: number;
    closedTrades: number;
    winRate: number;
    totalProfitPercent: number;
    totalLossPercent: number;
  };
  livePrices: Record<string, number>;
}

export function useSignals(tier?: "FREE" | "PRO") {
  return useQuery<Signal[], Error, Signal[], [string, string | undefined]>({
    queryKey: ["/api/signals", tier],
    queryFn: async () => {
      const url = tier ? `/api/signals?tier=${tier}` : "/api/signals";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch signals");
      const data: SignalsResponse = await res.json();
      return data.signals;
    },
    refetchInterval: 30000,
  });
}

export function useSignalsWithPrices(tier?: "FREE" | "PRO") {
  return useQuery<SignalsResponse>({
    queryKey: ["/api/signals/full", tier],
    queryFn: async () => {
      const url = tier ? `/api/signals?tier=${tier}` : "/api/signals";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch signals");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

export function useCreateSignal() {
  return useMutation({
    mutationFn: async (signal: Omit<Signal, "id" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/signals", signal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
  });
}

export function useUpdateSignalStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/signals/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
  });
}

export function useDeleteSignal() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/signals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
  });
}
