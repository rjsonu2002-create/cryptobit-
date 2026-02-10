import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, Target, Lock, MoreVertical, Play, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Signal {
  id: number;
  pair: string;
  direction: string;
  entry: string;
  stopLoss: string;
  takeProfits: string;
  leverage: string;
  status: string;
  tier: string;
  profitPercent: string | null;
  lossPercent: string | null;
  createdAt: string;
  closedAt: string | null;
}

interface Stats {
  totalTrades: number;
  closedTrades: number;
  winRate: number;
  totalProfitPercent: number;
  totalLossPercent: number;
}

interface SignalsResponse {
  signals: Signal[];
  stats: Stats;
  livePrices: Record<string, number>;
}

type TabType = "active" | "closed";
type FilterType = "all" | "bluechip" | "shortterm" | "longterm";

const BLUECHIP_COINS = ["BTC", "ETH", "BNB", "SOL", "XRP"];

export default function Signals() {
  const { user } = useAuth();
  const isPro = user?.role === "PRO" || user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [filter, setFilter] = useState<FilterType>("all");
  
  const { data, isLoading } = useQuery<SignalsResponse>({
    queryKey: ["/api/signals"],
    refetchInterval: 30000,
  });

  const signals = data?.signals || [];
  const stats = data?.stats || {
    totalTrades: 0,
    closedTrades: 0,
    winRate: 0,
    totalProfitPercent: 0,
    totalLossPercent: 0,
  };
  const livePrices = data?.livePrices || {};

  const activeSignals = signals.filter(s => s.status === "ACTIVE");
  const closedSignals = signals.filter(s => s.status === "HIT" || s.status === "SL");

  const filterSignals = (signalsList: Signal[]) => {
    if (filter === "all") return signalsList;
    if (filter === "bluechip") {
      return signalsList.filter(s => BLUECHIP_COINS.some(coin => s.pair.includes(coin)));
    }
    if (filter === "shortterm") {
      return signalsList.filter(s => s.direction === "SHORT");
    }
    if (filter === "longterm") {
      return signalsList.filter(s => s.direction === "LONG");
    }
    return signalsList;
  };

  const displayedSignals = filterSignals(activeTab === "active" ? activeSignals : closedSignals);

  const avgROI = stats.totalTrades > 0 
    ? ((stats.totalProfitPercent - stats.totalLossPercent) / Math.max(stats.closedTrades, 1)).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-4 py-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground mb-2">Success rate</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-copy-stats">
                  <Target className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-more-options">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${stats.winRate * 1.51} 151`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-500">{stats.winRate}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-lg font-bold">
                  {stats.closedTrades - Math.round(stats.closedTrades * (100 - stats.winRate) / 100)} / {stats.totalTrades} Trades
                </div>
                <div className="text-sm">
                  <span className="text-green-500 font-medium">{avgROI}%</span>
                  <span className="text-muted-foreground ml-1">Avg ROI / Trade</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("active")}
            className="shrink-0"
            data-testid="tab-active"
          >
            Active ({activeSignals.length})
          </Button>
          <Button
            variant={activeTab === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("closed")}
            className="shrink-0"
            data-testid="tab-closed"
          >
            Closed
          </Button>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="shrink-0"
            data-testid="filter-all"
          >
            All
          </Button>
          <Button
            variant={filter === "bluechip" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("bluechip")}
            className="shrink-0"
            data-testid="filter-bluechip"
          >
            Blue Chip
          </Button>
          <Button
            variant={filter === "shortterm" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("shortterm")}
            className="shrink-0"
            data-testid="filter-short"
          >
            Short Term
          </Button>
          <Button
            variant={filter === "longterm" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("longterm")}
            className="shrink-0"
            data-testid="filter-long"
          >
            Long
          </Button>
        </div>

        {isLoading ? (
          <SignalsLoadingSkeleton />
        ) : displayedSignals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === "active" ? "Calls coming soon" : "No closed trades"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === "active" ? "Your profit calls are almost here!" : "Closed trades will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                livePrice={livePrices[signal.pair]}
                isPro={isPro}
              />
            ))}
          </div>
        )}

        {!isPro && signals.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-amber-600" />
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Upgrade to Pro for full signal details
              </p>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="w-full" data-testid="button-upgrade-pro">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-8 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Expert Picks by <span className="font-bold">CRYPTOBIT</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium">Disclaimer:</span> The information, advice and/or views provided on this page are that of the respective expert and do not represent the views of CryptoBit.
          </div>
        </div>
      </main>

      {activeSignals.length > 0 && (
        <FloatingSignalBar signals={activeSignals} livePrices={livePrices} isPro={isPro} />
      )}
    </div>
  );
}

interface SignalCardProps {
  signal: Signal;
  livePrice?: number;
  isPro: boolean;
}

function SignalCard({ signal, livePrice, isPro }: SignalCardProps) {
  const coinSymbol = signal.pair.split("/")[0];
  const entryPrice = parseFloat(signal.entry);
  const stopLossPrice = parseFloat(signal.stopLoss);
  const takeProfitPrices = signal.takeProfits.split(",").map(p => parseFloat(p.trim()));
  const firstTP = takeProfitPrices[0];
  const isLong = signal.direction === "LONG";
  
  const isClosed = signal.status === "HIT" || signal.status === "SL";
  const isWin = signal.status === "HIT";
  const leverage = parseInt(signal.leverage?.replace('x', '') || '1') || 1;
  
  const profitPercent = signal.profitPercent ? parseFloat(signal.profitPercent) : null;
  const lossPercent = signal.lossPercent ? parseFloat(signal.lossPercent) : null;
  
  // Calculate potential profit based on entry price to TP, multiplied by leverage
  const potentialProfitRemaining = entryPrice && firstTP ? (() => {
    const rawProfit = isLong 
      ? ((firstTP - entryPrice) / entryPrice) * 100
      : ((entryPrice - firstTP) / entryPrice) * 100;
    return rawProfit * leverage;
  })() : null;
  
  // Calculate risk to SL based on entry price to stop loss, multiplied by leverage
  const riskToSL = entryPrice && stopLossPrice ? (() => {
    const rawRisk = isLong
      ? ((entryPrice - stopLossPrice) / entryPrice) * 100
      : ((stopLossPrice - entryPrice) / entryPrice) * 100;
    return rawRisk * leverage;
  })() : null;
  
  const currentPrice = livePrice || entryPrice;
  const priceRange = Math.abs(stopLossPrice - firstTP);
  const slPosition = signal.direction === "LONG" ? 0 : 100;
  const tpPosition = signal.direction === "LONG" ? 100 : 0;
  
  let currentPosition = 50;
  if (priceRange > 0) {
    if (signal.direction === "LONG") {
      currentPosition = ((currentPrice - stopLossPrice) / priceRange) * 100;
    } else {
      currentPosition = ((stopLossPrice - currentPrice) / priceRange) * 100;
    }
    currentPosition = Math.max(0, Math.min(100, currentPosition));
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" }) + " " + 
           date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <Card className="overflow-hidden" data-testid={`card-signal-${signal.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold">{coinSymbol.slice(0, 2)}</span>
            </div>
            <div>
              <div className="font-semibold">{coinSymbol}</div>
              <div className="text-xs text-muted-foreground">
                {signal.direction === "LONG" ? "Long" : "Short"} {signal.leverage}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {isClosed ? (
              <div>
                {isWin ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    +{profitPercent?.toFixed(0) || 0}%
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                    -{lossPercent?.toFixed(0) || 0}%
                  </Badge>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {isWin ? "Profit Booked" : "Loss exited"}
                </div>
              </div>
            ) : livePrice ? (
              <div>
                <div className="font-mono font-medium">
                  ${livePrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: livePrice < 1 ? 6 : 2 
                  })}
                </div>
                <div className="text-xs text-muted-foreground">Live Price</div>
              </div>
            ) : null}
          </div>
        </div>

        {isClosed && (
          <div className="text-xs text-muted-foreground mb-3">
            Closed on {signal.closedAt ? formatDate(signal.closedAt) : formatDate(signal.createdAt)}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Stop loss</div>
            <BlurredValue 
              value={formatPrice(stopLossPrice)} 
              isPro={isPro} 
              className="font-mono text-sm"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Entry range</div>
            <BlurredValue 
              value={formatPrice(entryPrice)} 
              isPro={isPro} 
              className="font-mono text-sm"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Take profit</div>
            <BlurredValue 
              value={formatPrice(firstTP)} 
              isPro={isPro} 
              className="font-mono text-sm"
            />
          </div>
        </div>

        <div className="relative h-2 bg-muted rounded-full mb-3">
          <div 
            className="absolute top-0 h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
            style={{ width: "100%" }}
          />
          <div 
            className="absolute -top-1 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"
            style={{ left: `${slPosition}%`, transform: "translateX(-50%)" }}
          />
          <div 
            className="absolute -top-1 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-500"
            style={{ left: `${tpPosition}%`, transform: "translateX(-50%)" }}
          />
          {!isClosed && (
            <div 
              className="absolute -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-primary"
              style={{ left: `${currentPosition}%`, transform: "translateX(-50%)" }}
            />
          )}
        </div>

        {!isClosed && (potentialProfitRemaining !== null || riskToSL !== null) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {potentialProfitRemaining !== null && potentialProfitRemaining > 0 && (
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xs text-muted-foreground">Potential Profit</div>
                <div className="text-sm font-bold text-green-600" data-testid={`text-potential-profit-${signal.id}`}>
                  +{potentialProfitRemaining.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">({leverage}x leverage)</div>
              </div>
            )}
            {riskToSL !== null && riskToSL > 0 && (
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-xs text-muted-foreground">Risk to SL</div>
                <div className="text-sm font-bold text-red-600" data-testid={`text-risk-sl-${signal.id}`}>
                  -{riskToSL.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">({leverage}x leverage)</div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {isClosed ? (
            <Badge 
              variant="outline" 
              className={isWin ? "text-green-600 border-green-300" : "text-red-600 border-red-300"}
            >
              <Play className="w-3 h-3 mr-1" />
              {isWin ? "Target Hit" : "SL Hit"}
            </Badge>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(signal.createdAt)}
            </div>
          )}
          
          <Badge variant="outline">
            {isClosed ? "Closed" : "Active"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface FloatingSignalBarProps {
  signals: Signal[];
  livePrices: Record<string, number>;
  isPro: boolean;
}

function FloatingSignalBar({ signals, livePrices, isPro }: FloatingSignalBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const signal = signals[currentIndex];
  if (!signal) return null;
  
  const livePrice = livePrices[signal.pair];
  const coinSymbol = signal.pair.split("/")[0];
  const entryPrice = parseFloat(signal.entry);
  const priceChange = livePrice && entryPrice ? ((livePrice - entryPrice) / entryPrice) * 100 : null;
  const isProfit = signal.direction === "LONG" ? (priceChange && priceChange > 0) : (priceChange && priceChange < 0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % signals.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + signals.length) % signals.length);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40">
      <Card className="shadow-lg border-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold">{coinSymbol.slice(0, 2)}</span>
              </div>
              <div>
                <div className="font-semibold text-sm">{signal.pair}</div>
                <div className="text-xs text-muted-foreground">
                  {signal.direction} {signal.leverage}
                </div>
              </div>
            </div>
            
            {livePrice && (
              <div className="text-right">
                <div className="font-mono font-medium text-sm">
                  ${livePrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: livePrice < 1 ? 6 : 2 
                  })}
                </div>
                {priceChange !== null && (
                  <div className={`text-xs font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfit ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Entry: </span>
              <BlurredValue value={`$${signal.entry}`} isPro={isPro} className="font-mono" />
            </div>
            <div>
              <span className="text-muted-foreground">TP: </span>
              <BlurredValue value={signal.takeProfits.split(",")[0]} isPro={isPro} className="font-mono" />
            </div>
          </div>
          
          {signals.length > 1 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={handlePrev} data-testid="button-prev-signal">
                <TrendingDown className="w-4 h-4 rotate-90" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {signals.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNext} data-testid="button-next-signal">
                <TrendingUp className="w-4 h-4 rotate-90" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BlurredValue({ value, isPro, className = "" }: { value: string; isPro: boolean; className?: string }) {
  if (isPro) {
    return <span className={className}>{value}</span>;
  }
  
  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      <span className="blur-sm select-none">{value}</span>
      <Lock className="w-3 h-3 text-muted-foreground absolute left-1/2 -translate-x-1/2" />
    </span>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (price >= 1) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function SignalsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
