import { Navbar } from "@/components/Navbar";
import { useMarkets } from "@/hooks/use-coins";
import { ArrowUp, ArrowDown, Info, Loader2, BarChart2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

interface GlobalData {
  total_market_cap: number;
  total_volume: number;
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h: number;
}

interface ChartPoint {
  date: string;
  value: number;
  timestamp: number;
}

export default function MarketOverview() {
  const { data: coins, isLoading } = useMarkets();
  const [, setLocation] = useLocation();
  const { theme } = useTheme();

  const { data: globalData } = useQuery<GlobalData>({
    queryKey: ["/api/global"],
    staleTime: 60000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartPoint[]>({
    queryKey: ["/api/global/chart"],
    staleTime: 60000,
  });

  const topCoins = coins?.slice(0, 5) || [];

  const formatValue = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">Crypto Market Overview</h1>
            <button className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
              Live Data
            </button>
          </div>
          <p className="text-sm text-muted-foreground max-w-4xl">
            Stay updated on the latest cryptocurrency market trends, including Bitcoin dominance, altcoin season, ETF net flows, and real-time market sentiment, all conveniently accessible in one place.
          </p>
        </div>

        {isLoading ? (
          <TopCoinsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {topCoins.map((coin) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              return (
                <div 
                  key={coin.id}
                  onClick={() => setLocation(`/coin/${coin.id}`)}
                  className="bg-white dark:bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`card-coin-${coin.id}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                    <span className="font-semibold text-sm truncate">{coin.name}</span>
                  </div>
                  <div className="text-lg font-bold font-mono">
                    ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <FearGreedCard value={globalData?.market_cap_change_percentage_24h || 0} />
            <AltcoinSeasonCard btcDominance={globalData?.market_cap_percentage?.btc || 54} />
            <IndexCard 
              title="Total Market Cap" 
              value={globalData?.total_market_cap || 0} 
              change={globalData?.market_cap_change_percentage_24h || 0} 
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MarketCapChart 
              data={chartData || []} 
              isLoading={chartLoading}
              globalData={globalData}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VolumeCard volume={globalData?.total_volume || 0} />
              <BitcoinDominanceCard dominanceData={globalData?.market_cap_percentage} />
            </div>
          </div>
        </div>

        <PolymarketSection />
      </main>
    </div>
  );
}

function FearGreedCard({ value }: { value: number }) {
  // Convert market change to fear/greed (simplified)
  const fearGreedValue = Math.min(100, Math.max(0, 50 + value * 5));
  
  const getLabel = (v: number) => {
    if (v <= 25) return "Extreme Fear";
    if (v <= 45) return "Fear";
    if (v <= 55) return "Neutral";
    if (v <= 75) return "Greed";
    return "Extreme Greed";
  };

  const getColor = (v: number) => {
    if (v <= 25) return "#ef4444";
    if (v <= 45) return "#f97316";
    if (v <= 55) return "#eab308";
    if (v <= 75) return "#84cc16";
    return "#22c55e";
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-foreground">Fear & Greed Index</h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={getColor(fearGreedValue)}
              strokeWidth="12"
              strokeDasharray={`${fearGreedValue * 2.51} 251`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(fearGreedValue)}</span>
          </div>
        </div>
        <div>
          <div className="text-lg font-bold" style={{ color: getColor(fearGreedValue) }}>
            {getLabel(fearGreedValue)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Based on market sentiment</div>
        </div>
      </div>
    </div>
  );
}

function AltcoinSeasonCard({ btcDominance }: { btcDominance: number }) {
  const altcoinValue = Math.max(0, 100 - btcDominance * 1.5);

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-foreground">Altcoin Season Index</h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{Math.round(altcoinValue)}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${altcoinValue}%`,
              background: altcoinValue > 50 ? 'linear-gradient(90deg, #f97316, #22c55e)' : 'linear-gradient(90deg, #3b82f6, #f97316)'
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Bitcoin Season</span>
          <span>Altcoin Season</span>
        </div>
      </div>
    </div>
  );
}

function IndexCard({ title, value, change }: { title: string; value: number; change: number }) {
  const isPositive = change >= 0;
  
  const formatValue = (v: number) => {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-foreground">{title}</h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold font-mono">{formatValue(value)}</span>
        <span className={`flex items-center text-sm font-medium mb-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">24h change</div>
    </div>
  );
}

function MarketCapChart({ data, isLoading, globalData }: { 
  data: ChartPoint[]; 
  isLoading: boolean;
  globalData?: GlobalData;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown">("overview");
  
  const formatValue = (v: number) => {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    return `$${v.toLocaleString()}`;
  };

  const breakdownData = globalData?.market_cap_percentage 
    ? Object.entries(globalData.market_cap_percentage)
        .slice(0, 10)
        .map(([symbol, percentage]) => ({
          name: symbol.toUpperCase(),
          value: percentage,
          marketCap: (globalData.total_market_cap * percentage) / 100
        }))
    : [];

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground">Crypto Market Cap</h3>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Market Cap</span>
              <div className="text-2xl font-bold font-mono">
                {globalData ? formatValue(globalData.total_market_cap) : '-'}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Volume</span>
              <div className="text-2xl font-bold font-mono">
                {globalData ? formatValue(globalData.total_volume) : '-'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex bg-muted/30 rounded-lg p-1 gap-1">
          {(["overview", "breakdown"] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all capitalize ${tab === activeTab ? "bg-white dark:bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-background/50"}`}
              data-testid={`button-tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-card/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {activeTab === "overview" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMcap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} 
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} 
                tickFormatter={(v) => `$${(v / 1e12).toFixed(1)}T`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => [formatValue(value), 'Market Cap']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMcap)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData} layout="vertical">
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}}
                width={50}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(2)}% (${formatValue(props.payload.marketCap)})`,
                  'Dominance'
                ]}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function VolumeCard({ volume }: { volume: number }) {
  const formatValue = (v: number) => {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-foreground">24h Trading Volume</h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="text-3xl font-bold font-mono mb-2">
        {formatValue(volume)}
      </div>
      <p className="text-xs text-muted-foreground">
        Total trading volume across all cryptocurrencies in the last 24 hours
      </p>
    </div>
  );
}

function BitcoinDominanceCard({ dominanceData }: { dominanceData?: { [key: string]: number } }) {
  const data = dominanceData ? [
    { name: 'Bitcoin', value: dominanceData.btc || 0, color: '#f7931a' },
    { name: 'Ethereum', value: dominanceData.eth || 0, color: '#627eea' },
    { name: 'Others', value: 100 - (dominanceData.btc || 0) - (dominanceData.eth || 0), color: '#94a3b8' },
  ] : [
    { name: 'Bitcoin', value: 54, color: '#f7931a' },
    { name: 'Ethereum', value: 18, color: '#627eea' },
    { name: 'Others', value: 28, color: '#94a3b8' },
  ];

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-foreground">Market Dominance</h3>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
              <span className="text-xs font-medium">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopCoinsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  volume: number;
  liquidity: number;
  endDate: string;
  outcomes: string[];
  outcomePrices: number[];
  category: string;
}

function PolymarketSection() {
  const { data, isLoading } = useQuery<{ markets: PolymarketEvent[] }>({
    queryKey: ["/api/polymarket"],
    queryFn: async () => {
      const res = await fetch("/api/polymarket");
      if (!res.ok) throw new Error("Failed to fetch markets");
      return res.json();
    },
    staleTime: 60000,
  });

  const markets = data?.markets?.slice(0, 6) || [];

  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-foreground">Polymarket - Prediction Markets</h3>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <a 
            href="/polymarket"
            className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Trade on the outcome of real-world events. Prices reflect the market's probability assessment of each outcome.
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => {
              const yesPrice = market.outcomePrices?.[0] || 0.5;
              const yesPercent = Math.round(yesPrice * 100);
              
              return (
                <a
                  key={market.id}
                  href={`https://polymarket.com/event/${market.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted/30 hover:bg-muted/50 rounded-lg p-4 transition-colors block"
                  data-testid={`polymarket-card-${market.id}`}
                >
                  <div className="flex items-start gap-3">
                    {market.image && (
                      <img 
                        src={market.image} 
                        alt="" 
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">{market.title}</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${yesPercent >= 50 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-lg font-bold ${yesPercent >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {yesPercent}%
                          </span>
                          <span className="text-xs text-muted-foreground">Yes</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatVolume(market.volume)} vol
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
