import { storage } from "./storage";
import { getCoinIdFromPair, fetchCoinPrice } from "./coingecko";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export async function evaluateSignals(): Promise<void> {
  if (isRunning) {
    console.log('[SignalEngine] Already running, skipping...');
    return;
  }
  
  isRunning = true;
  
  try {
    const signals = await storage.getAllSignals();
    const activeSignals = signals.filter(s => s.status === 'ACTIVE');
    
    if (activeSignals.length === 0) {
      return;
    }
    
    console.log(`[SignalEngine] Evaluating ${activeSignals.length} active signals...`);
    
    for (const signal of activeSignals) {
      try {
        await evaluateSingleSignal(signal);
      } catch (error) {
        console.error(`[SignalEngine] Error evaluating signal ${signal.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[SignalEngine] Error in signal evaluation:', error);
  } finally {
    isRunning = false;
  }
}

async function evaluateSingleSignal(signal: any): Promise<void> {
  const coinId = signal.coinId || getCoinIdFromPair(signal.pair);
  
  if (!coinId) {
    console.log(`[SignalEngine] Unknown coin for pair: ${signal.pair}`);
    return;
  }
  
  const currentPrice = await fetchCoinPrice(coinId);
  
  if (currentPrice === null) {
    console.log(`[SignalEngine] Could not fetch price for ${coinId}`);
    return;
  }
  
  // Parse prices from signal
  const entryPrice = parseFloat(signal.entryPrice || signal.entry);
  const stopLossPrice = parseFloat(signal.stopLossPrice || signal.stopLoss);
  
  // Get first take profit target
  const takeProfitsStr = signal.takeProfits || '';
  const takeProfits = takeProfitsStr.split(',').map((tp: string) => parseFloat(tp.trim())).filter((tp: number) => !isNaN(tp));
  const takeProfitPrice = parseFloat(signal.takeProfitPrice) || takeProfits[0];
  
  if (isNaN(entryPrice) || isNaN(stopLossPrice) || isNaN(takeProfitPrice)) {
    console.log(`[SignalEngine] Invalid prices for signal ${signal.id}`);
    return;
  }
  
  const isLong = signal.direction === 'LONG';
  let newStatus: 'HIT' | 'SL' | null = null;
  let profitPercent: number | null = null;
  let lossPercent: number | null = null;
  
  if (isLong) {
    // LONG: Price goes up = win, price goes down = loss
    if (currentPrice >= takeProfitPrice) {
      newStatus = 'HIT';
      profitPercent = ((takeProfitPrice - entryPrice) / entryPrice) * 100;
    } else if (currentPrice <= stopLossPrice) {
      newStatus = 'SL';
      lossPercent = ((entryPrice - stopLossPrice) / entryPrice) * 100;
    }
  } else {
    // SHORT: Price goes down = win, price goes up = loss
    if (currentPrice <= takeProfitPrice) {
      newStatus = 'HIT';
      profitPercent = ((entryPrice - takeProfitPrice) / entryPrice) * 100;
    } else if (currentPrice >= stopLossPrice) {
      newStatus = 'SL';
      lossPercent = ((stopLossPrice - entryPrice) / entryPrice) * 100;
    }
  }
  
  if (newStatus) {
    console.log(`[SignalEngine] Signal ${signal.id} (${signal.pair}) closed with status: ${newStatus} at price $${currentPrice}`);
    
    await storage.closeSignal(signal.id, {
      status: newStatus,
      exitPrice: currentPrice.toString(),
      profitPercent: profitPercent !== null ? profitPercent.toFixed(2) : null,
      lossPercent: lossPercent !== null ? lossPercent.toFixed(2) : null,
      closedAt: new Date(),
    });
  }
}

export function startSignalEngine(intervalMs: number = 30000): void {
  if (intervalId) {
    console.log('[SignalEngine] Already started');
    return;
  }
  
  console.log(`[SignalEngine] Starting with ${intervalMs}ms interval...`);
  
  // Run immediately on start
  evaluateSignals();
  
  // Then run on interval
  intervalId = setInterval(evaluateSignals, intervalMs);
}

export function stopSignalEngine(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[SignalEngine] Stopped');
  }
}
