import { useState } from "react";
import { useMarkets } from "@/hooks/use-coins";
import { useLocation } from "wouter";
import { ArrowUp, ArrowDown, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "gainers" | "losers";

export function CoinTable() {
  const { data: coins, isLoading, isError } = useMarkets();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 20;

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError || !coins) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-muted-foreground bg-white dark:bg-card rounded-2xl border border-border shadow-sm">
        <p>Failed to load market data</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
          data-testid="button-retry"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredCoins = coins.filter(coin => {
    if (filter === "gainers") return coin.price_change_percentage_24h > 0;
    if (filter === "losers") return coin.price_change_percentage_24h < 0;
    return true;
  });

  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const startIndex = (currentPage - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;
  const paginatedCoins = filteredCoins.slice(startIndex, endIndex);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button 
          onClick={() => handleFilterChange("all")}
          className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filter === "all" 
              ? "bg-primary text-white shadow-sm" 
              : "bg-white dark:bg-card border border-border text-muted-foreground hover:bg-muted/20"
          }`}
          data-testid="button-filter-all"
        >
          All Assets
        </button>
        <button 
          onClick={() => handleFilterChange("gainers")}
          className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
            filter === "gainers" 
              ? "bg-green-600 text-white shadow-sm" 
              : "bg-white dark:bg-card border border-border text-muted-foreground hover:bg-muted/20"
          }`}
          data-testid="button-filter-gainers"
        >
          <ArrowUp className="w-3 h-3" />
          Gainers
        </button>
        <button 
          onClick={() => handleFilterChange("losers")}
          className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
            filter === "losers" 
              ? "bg-red-600 text-white shadow-sm" 
              : "bg-white dark:bg-card border border-border text-muted-foreground hover:bg-muted/20"
          }`}
          data-testid="button-filter-losers"
        >
          <ArrowDown className="w-3 h-3" />
          Losers
        </button>
        <div className="flex-1" />
        <span className="text-sm text-muted-foreground hidden sm:block">
          {filteredCoins.length} coins
        </span>
      </div>

      <div className="w-full bg-white dark:bg-card rounded-2xl border border-border/60 shadow-lg shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="py-4 pl-6 pr-4 text-xs font-semibold text-muted-foreground w-12 text-center">#</th>
                <th className="py-4 px-4 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="py-4 px-4 text-xs font-semibold text-muted-foreground text-right">Price</th>
                <th className="py-4 px-4 text-xs font-semibold text-muted-foreground text-right">24h Change</th>
                <th className="py-4 px-4 text-xs font-semibold text-muted-foreground text-right hidden md:table-cell">Market Cap</th>
                <th className="py-4 px-4 text-xs font-semibold text-muted-foreground text-right hidden lg:table-cell">Volume (24h)</th>
                <th className="py-4 pr-6 pl-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedCoins.map((coin, index) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(coin.current_price);
                const formattedMarketCap = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(coin.market_cap);
                const formattedVolume = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(coin.total_volume);
                const displayIndex = startIndex + index + 1;

                return (
                  <tr 
                    key={coin.id} 
                    onClick={() => setLocation(`/coin/${coin.id}`)}
                    className="group hover:bg-muted/30 cursor-pointer transition-colors"
                    data-testid={`row-coin-${coin.id}`}
                  >
                    <td className="py-4 pl-6 pr-4 text-sm text-muted-foreground text-center font-medium">
                      {displayIndex}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="w-8 h-8 rounded-full object-cover shadow-sm" 
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-bold text-foreground">{coin.name}</span>
                          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono-numbers font-medium text-foreground">
                      {formattedPrice}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-medium text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-foreground font-mono-numbers hidden md:table-cell">
                      {formattedMarketCap}
                    </td>
                    <td className="py-4 px-4 text-right text-foreground font-mono-numbers hidden lg:table-cell">
                      {formattedVolume}
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-border/50 bg-muted/10">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCoins.length)} of {filteredCoins.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16 hidden md:block" />
          <Skeleton className="h-4 w-24 hidden lg:block" />
        </div>
      ))}
    </div>
  );
}
