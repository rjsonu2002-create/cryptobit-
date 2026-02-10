import { useCoin } from "@/hooks/use-coins";
import { Navbar } from "@/components/Navbar";
import { useRoute, Link } from "wouter";
import { ArrowUp, ArrowDown, Share2, Star, Globe, FileText, ExternalLink, Twitter, Loader2, ArrowRightLeft, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

export default function CoinDetail() {
  const [, params] = useRoute("/coin/:id");
  const id = params?.id || "";
  const [selectedPeriod, setSelectedPeriod] = useState("24H");
  
  const { data: coin, isLoading, isError } = useCoin(id);

  const { data: chartData, isLoading: chartLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/coin", id, "chart", selectedPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/coin/${id}/chart?period=${selectedPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch chart");
      return res.json();
    },
    enabled: !!id,
    staleTime: 60000,
  });

  if (isLoading) return <DetailSkeleton />;
  
  if (isError || !coin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Coin not found</h2>
          <p className="text-muted-foreground mb-6">Unable to load coin data. Please try again.</p>
          <Link href="/" className="text-primary hover:underline">Back to Markets</Link>
        </div>
      </div>
    );
  }

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? "hsl(142, 76%, 36%)" : "hsl(346, 84%, 61%)";

  const periods = ["1H", "24H", "7D", "1M", "1Y", "ALL"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground cursor-pointer">Cryptocurrencies</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{coin.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={coin.image} 
                  alt={coin.name} 
                  className="w-12 h-12 rounded-full shadow-md"
                />
                <div>
                  <h1 className="text-3xl font-bold text-foreground leading-none">{coin.name}</h1>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                    {coin.symbol}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors" data-testid="button-favorite">
                  <Star className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors" data-testid="button-share">
                  <Share2 className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-bold font-mono tracking-tight" data-testid="text-price">
                  ${coin.current_price.toLocaleString()}
                </span>
                <span className={`flex items-center px-2 py-1 rounded-lg text-sm font-bold mb-1.5 ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-6">
                <StatCard label="Market Cap" value={`$${coin.market_cap.toLocaleString()}`} />
                <StatCard label="Volume (24h)" value={`$${coin.total_volume.toLocaleString()}`} />
                <StatCard label="Circulating Supply" value={`${(coin.market_cap / coin.current_price).toLocaleString(undefined, {maximumFractionDigits: 0})} ${coin.symbol}`} />
              </div>

              <div className="pt-6">
                <CurrencyConverter coinSymbol={coin.symbol} coinPrice={coin.current_price} coinImage={coin.image} />
              </div>

              <div className="pt-6 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Official Links</h3>
                <div className="flex flex-wrap gap-2">
                  <LinkButton icon={<Globe className="w-3 h-3"/>} label="Website" />
                  <LinkButton icon={<FileText className="w-3 h-3"/>} label="Whitepaper" />
                  <LinkButton icon={<Twitter className="w-3 h-3"/>} label="Socials" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm p-6 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {coin.name} Price Chart ({coin.symbol}/USD)
                </h2>
                <div className="flex bg-muted/30 rounded-lg p-1 gap-1">
                  {periods.map(period => (
                    <button 
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${period === selectedPeriod ? "bg-white dark:bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-background/50"}`}
                      data-testid={`button-period-${period.toLowerCase()}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-0 relative">
                {chartLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-card/80 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} 
                        dy={10}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                        dx={-10}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={chartColor} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : !chartLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No chart data available
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold mb-2">What is {coin.name}?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {coin.description ? coin.description.replace(/<[^>]*>/g, '').slice(0, 300) + '...' : `${coin.name} is a decentralized digital currency that enables instant payments to anyone, anywhere in the world.`}
                </p>
              </div>
              <div className="bg-white dark:bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold mb-4">Market Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Low (24h)</span>
                    <span className="font-mono font-medium">${(coin.current_price * 0.95).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-foreground/20 h-full w-2/3 rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">High (24h)</span>
                    <span className="font-mono font-medium">${(coin.current_price * 1.05).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <TradingViewNews symbol={coin.symbol} coinName={coin.name} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border/50">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="font-bold font-mono">{value}</span>
    </div>
  );
}

function LinkButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 text-xs font-semibold text-muted-foreground rounded-lg hover:bg-muted hover:text-foreground transition-colors">
      {icon}
      {label}
      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-50" />
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencyConverter({ coinSymbol, coinPrice, coinImage }: { coinSymbol: string, coinPrice: number, coinImage: string }) {
  const [coinAmount, setCoinAmount] = useState("1");
  const [usdAmount, setUsdAmount] = useState(coinPrice.toString());

  const handleCoinChange = (value: string) => {
    setCoinAmount(value);
    const numValue = parseFloat(value) || 0;
    setUsdAmount((numValue * coinPrice).toFixed(2));
  };

  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    const numValue = parseFloat(value) || 0;
    setCoinAmount((numValue / coinPrice).toFixed(8));
  };

  const swapValues = () => {
    const tempCoin = coinAmount;
    const tempUsd = usdAmount;
    setCoinAmount((parseFloat(tempUsd) / coinPrice).toFixed(8));
    setUsdAmount((parseFloat(tempCoin) * coinPrice).toFixed(2));
  };

  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Currency Converter</h3>
        <button 
          onClick={swapValues}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          data-testid="button-swap-currency"
        >
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white dark:bg-card rounded-lg p-3 border border-border">
          <img src={coinImage} alt={coinSymbol} className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <input
              type="number"
              value={coinAmount}
              onChange={(e) => handleCoinChange(e.target.value)}
              className="w-full bg-transparent text-lg font-mono font-bold outline-none text-foreground"
              placeholder="0.00"
              data-testid="input-coin-amount"
            />
            <span className="text-xs text-muted-foreground">{coinSymbol.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">=</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-card rounded-lg p-3 border border-border">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              className="w-full bg-transparent text-lg font-mono font-bold outline-none text-foreground"
              placeholder="0.00"
              data-testid="input-usd-amount"
            />
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        1 {coinSymbol.toUpperCase()} = ${coinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function TradingViewNews({ symbol, coinName }: { symbol: string, coinName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoaded.current) return;

    const symbolMap: Record<string, string> = {
      'BTC': 'BITCOIN',
      'ETH': 'ETHEREUM',
      'XRP': 'XRP',
      'SOL': 'SOLANA',
      'BNB': 'BNB',
      'DOGE': 'DOGECOIN',
      'ADA': 'CARDANO',
      'AVAX': 'AVALANCHE',
      'DOT': 'POLKADOT',
      'MATIC': 'POLYGON',
      'LINK': 'CHAINLINK',
      'UNI': 'UNISWAP',
      'ATOM': 'COSMOS',
      'LTC': 'LITECOIN',
      'XLM': 'STELLAR',
    };

    const tradingViewSymbol = symbolMap[symbol.toUpperCase()] || 'CRYPTOCURRENCY';

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "symbol",
      symbol: tradingViewSymbol,
      isTransparent: false,
      displayMode: "regular",
      width: "100%",
      height: 400,
      colorTheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      locale: "en"
    });

    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      scriptLoaded.current = false;
    };
  }, [symbol]);

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">{coinName} News & Updates</h3>
        <p className="text-xs text-muted-foreground mt-1">Latest news from TradingView</p>
      </div>
      <div 
        ref={containerRef} 
        className="tradingview-widget-container"
        data-testid="tradingview-news-widget"
      >
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
