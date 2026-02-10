import { ArrowUp, ArrowDown, Target, ShieldAlert, Trash2, TrendingUp, TrendingDown, Lock } from "lucide-react";
import type { Signal } from "@shared/schema";
import { useDeleteSignal, useUpdateSignalStatus } from "@/hooks/use-signals";
import { useAuth } from "@/hooks/use-auth";

interface SignalCardProps {
  signal: Signal;
  livePrice?: number;
}

export function SignalCard({ signal, livePrice }: SignalCardProps) {
  const { user } = useAuth();
  const deleteSignal = useDeleteSignal();
  const updateStatus = useUpdateSignalStatus();

  const isLong = signal.direction === "LONG";
  const statusColors = {
    ACTIVE: "bg-blue-100 text-blue-700",
    HIT: "bg-green-100 text-green-700",
    SL: "bg-red-100 text-red-700",
    STOPPED: "bg-red-100 text-red-700",
  };

  const isProSignal = signal.tier === "PRO";
  const isProUser = user?.role === "PRO" || user?.role === "ADMIN";
  const shouldBlur = isProSignal && !isProUser;

  const entryPrice = parseFloat(signal.entry);
  const stopLossPrice = parseFloat(signal.stopLoss);
  const takeProfits = signal.takeProfits.split(",").map(tp => parseFloat(tp.trim())).filter(tp => !isNaN(tp));
  const firstTP = takeProfits[0] || 0;
  const leverage = parseInt(signal.leverage?.replace('x', '') || '1') || 1;
  
  const priceChange = livePrice !== undefined && entryPrice ? ((livePrice - entryPrice) / entryPrice) * 100 : null;
  const isProfit = priceChange !== null && (isLong ? priceChange >= 0 : priceChange <= 0);
  
  // Calculate potential profit based on entry price to TP, multiplied by leverage
  const potentialProfitRemaining = entryPrice && firstTP ? (() => {
    const rawProfit = isLong 
      ? ((firstTP - entryPrice) / entryPrice) * 100
      : ((entryPrice - firstTP) / entryPrice) * 100;
    return rawProfit * leverage;
  })() : null;
  
  // Calculate risk to SL based on entry price to stop loss, multiplied by leverage
  const riskPercent = entryPrice && stopLossPrice ? (() => {
    const rawRisk = isLong
      ? ((entryPrice - stopLossPrice) / entryPrice) * 100
      : ((stopLossPrice - entryPrice) / entryPrice) * 100;
    return rawRisk * leverage;
  })() : null;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this signal?")) {
      deleteSignal.mutate(signal.id);
    }
  };

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: signal.id, status });
  };

  return (
    <div 
      className="bg-white dark:bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow relative overflow-hidden"
      data-testid={`card-signal-${signal.id}`}
    >
      {shouldBlur && (
        <div className="absolute inset-0 bg-white/60 dark:bg-card/60 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-1">Pro Signal</h3>
          <p className="text-sm text-muted-foreground mb-4">Upgrade to Pro to unlock this high-probability trading setup.</p>
          <a href="/pricing" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
            Upgrade Now
          </a>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{signal.pair}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${isLong ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isLong ? <ArrowUp className="w-3 h-3 inline mr-1" /> : <ArrowDown className="w-3 h-3 inline mr-1" />}
            {signal.direction}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isProSignal && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
              PRO
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[signal.status as keyof typeof statusColors] || statusColors.ACTIVE}`}>
            {signal.status}
          </span>
        </div>
      </div>

      {signal.status === "ACTIVE" && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
          {livePrice && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Live Price</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg" data-testid={`text-live-price-${signal.id}`}>
                  ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: livePrice < 1 ? 6 : 2 })}
                </span>
                {priceChange !== null && (
                  <span className={`flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isProfit ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className={`grid grid-cols-2 gap-2 ${livePrice ? 'pt-2 border-t border-border/50' : ''}`}>
            {potentialProfitRemaining !== null && potentialProfitRemaining > 0 && (
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Potential Profit</div>
                <div className="text-sm font-bold text-green-600" data-testid={`text-potential-profit-${signal.id}`}>
                  +{potentialProfitRemaining.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">({leverage}x leverage)</div>
              </div>
            )}
            {riskPercent !== null && riskPercent > 0 && (
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Risk to SL</div>
                <div className="text-sm font-bold text-red-600" data-testid={`text-risk-percent-${signal.id}`}>
                  -{riskPercent.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">({leverage}x leverage)</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Target className="w-4 h-4" /> Entry
          </span>
          <span className="font-mono font-medium">${signal.entry}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Stop Loss
          </span>
          <span className="font-mono font-medium text-red-600">${signal.stopLoss}</span>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Take Profits:</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {signal.takeProfits.split(",").map((tp, i) => (
              <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-mono">
                TP{i + 1}: ${tp.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Leverage</span>
          <span className="font-bold text-primary">{signal.leverage}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex gap-1">
          <button
            onClick={() => handleStatusChange("HIT")}
            className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            data-testid="button-mark-hit"
          >
            Mark Hit
          </button>
          <button
            onClick={() => handleStatusChange("SL")}
            className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            data-testid="button-mark-sl"
          >
            Mark SL
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
          data-testid="button-delete-signal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {new Date(signal.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
