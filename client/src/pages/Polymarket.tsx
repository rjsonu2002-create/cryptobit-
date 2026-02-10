import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, BarChart2, RefreshCw, DollarSign, Calendar } from "lucide-react";

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

function formatVolume(volume: number): string {
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Polymarket() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<{ markets: PolymarketEvent[] }>({
    queryKey: ["/api/polymarket"],
    queryFn: async () => {
      const res = await fetch("/api/polymarket");
      if (!res.ok) throw new Error("Failed to fetch markets");
      return res.json();
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });

  const markets = data?.markets || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/10">
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Polymarket</h1>
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-xs">LIVE</Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real-time prediction markets - Trade on the outcome of real-world events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white" data-testid="button-visit-polymarket">
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visit Polymarket</span>
              </Button>
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Failed to load prediction markets</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}

        {!isLoading && markets.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card className="hover-elevate">
              <CardContent className="p-3 sm:pt-6 sm:px-6">
                <div className="text-center">
                  <div className="text-sm sm:text-xl font-bold text-violet-500 mb-0.5 sm:mb-1">{markets.length}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Active Markets</div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-3 sm:pt-6 sm:px-6">
                <div className="text-center">
                  <div className="text-sm sm:text-xl font-bold text-green-500 mb-0.5 sm:mb-1">
                    {formatVolume(markets.reduce((sum, m) => sum + (m.volume || 0), 0))}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Total Volume</div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-3 sm:pt-6 sm:px-6">
                <div className="text-center">
                  <div className="text-sm sm:text-xl font-bold text-blue-500 mb-0.5 sm:mb-1">
                    {formatVolume(markets.reduce((sum, m) => sum + (m.liquidity || 0), 0))}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Total Liquidity</div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-3 sm:pt-6 sm:px-6">
                <div className="text-center">
                  <div className="text-sm sm:text-xl font-bold text-amber-500 mb-0.5 sm:mb-1">Live</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Market Status</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function MarketCard({ market }: { market: PolymarketEvent }) {
  const yesPrice = market.outcomePrices?.[0] || 0.5;
  const noPrice = market.outcomePrices?.[1] || 0.5;
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-market-${market.id}`}>
      <a 
        href={`https://polymarket.com/event/${market.slug}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        {market.image && (
          <div className="h-32 overflow-hidden">
            <img 
              src={market.image} 
              alt={market.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">{market.title}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {market.category || "General"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">Yes</div>
              <div className="text-lg font-bold text-green-600">{yesPercent}¢</div>
              <div className="text-xs text-muted-foreground">{yesPercent}% chance</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">No</div>
              <div className="text-lg font-bold text-red-600">{noPercent}¢</div>
              <div className="text-xs text-muted-foreground">{noPercent}% chance</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>{formatVolume(market.volume)} vol</span>
            </div>
            {market.endDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(market.endDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </a>
    </Card>
  );
}
