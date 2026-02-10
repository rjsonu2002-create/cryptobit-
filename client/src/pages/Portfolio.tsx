import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Briefcase, TrendingUp, TrendingDown, PieChart, Plus, Trash2, Edit2, X, Search, ArrowUp, ArrowDown 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useMarkets, type MarketCoin } from "@/hooks/use-coins";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface PortfolioHolding {
  id: number;
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string | null;
  quantity: string;
  buyPrice: string;
  createdAt: string;
  updatedAt: string;
}

export default function Portfolio() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<MarketCoin | null>(null);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: marketsData, isLoading: marketsLoading } = useMarkets();
  const coins = marketsData || [];

  const { data: portfolioData, isLoading: portfolioLoading } = useQuery<{ holdings: PortfolioHolding[] }>({
    queryKey: ["/api/portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const holdings = portfolioData?.holdings || [];

  const addMutation = useMutation({
    mutationFn: async (data: { coinId: string; coinName: string; coinSymbol: string; coinImage: string; quantity: string; buyPrice: string }) => {
      return apiRequest("POST", "/api/portfolio", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity, buyPrice }: { id: number; quantity: string; buyPrice: string }) => {
      return apiRequest("PUT", `/api/portfolio/${id}`, { quantity, buyPrice });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
  });

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingHolding(null);
    setSelectedCoin(null);
    setQuantity("");
    setBuyPrice("");
    setSearchQuery("");
  };

  const handleAddAsset = () => {
    if (!selectedCoin || !quantity || !buyPrice) return;
    
    addMutation.mutate({
      coinId: selectedCoin.id,
      coinName: selectedCoin.name,
      coinSymbol: selectedCoin.symbol,
      coinImage: selectedCoin.image,
      quantity,
      buyPrice,
    });
  };

  const handleUpdateAsset = () => {
    if (!editingHolding || !quantity || !buyPrice) return;
    
    updateMutation.mutate({
      id: editingHolding.id,
      quantity,
      buyPrice,
    });
  };

  const openEditModal = (holding: PortfolioHolding) => {
    setEditingHolding(holding);
    setQuantity(holding.quantity);
    setBuyPrice(holding.buyPrice);
    setIsAddModalOpen(true);
  };

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLivePrice = (coinId: string): number => {
    const coin = coins.find(c => c.id === coinId);
    return coin?.current_price || 0;
  };

  const get24hChange = (coinId: string): number => {
    const coin = coins.find(c => c.id === coinId);
    return coin?.price_change_percentage_24h || 0;
  };

  const calculatePnL = (holding: PortfolioHolding) => {
    const livePrice = getLivePrice(holding.coinId);
    const qty = parseFloat(holding.quantity) || 0;
    const buyPriceNum = parseFloat(holding.buyPrice) || 0;
    const currentValue = qty * livePrice;
    const costBasis = qty * buyPriceNum;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
    return { currentValue, costBasis, pnl, pnlPercent };
  };

  const totalValue = holdings.reduce((sum, h) => sum + calculatePnL(h).currentValue, 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + calculatePnL(h).costBasis, 0);
  const totalPnL = totalValue - totalCostBasis;
  const totalPnLPercent = totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0;
  
  const total24hChange = holdings.reduce((sum, h) => {
    const livePrice = getLivePrice(h.coinId);
    const change24h = get24hChange(h.coinId);
    const qty = parseFloat(h.quantity) || 0;
    const currentValue = qty * livePrice;
    const valueChange = currentValue * (change24h / 100);
    return sum + valueChange;
  }, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("portfolio.loginRequired")}</h2>
              <p className="text-muted-foreground mb-4">{t("portfolio.loginToAccess")}</p>
              <a href="/api/login">
                <Button data-testid="button-login-portfolio">{t("portfolio.loginToContinue")}</Button>
              </a>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("portfolio.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("portfolio.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-asset">
            <Plus className="w-4 h-4 mr-2" />
            {t("portfolio.addAsset")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("portfolio.totalValue")}</p>
                  <p className="text-2xl font-bold">
                    ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <PieChart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`text-2xl font-bold ${total24hChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {total24hChange >= 0 ? "+" : ""}${total24hChange.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                {total24hChange >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
                  <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                  </p>
                </div>
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioLoading || marketsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assets yet</h3>
                <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first crypto asset</p>
                <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-first-asset">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Asset
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => {
                  const { currentValue, pnl, pnlPercent } = calculatePnL(holding);
                  const livePrice = getLivePrice(holding.coinId);
                  const change24h = get24hChange(holding.coinId);
                  const qty = parseFloat(holding.quantity) || 0;

                  return (
                    <div 
                      key={holding.id} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      data-testid={`holding-${holding.coinId}`}
                    >
                      <img 
                        src={holding.coinImage || ""} 
                        alt={holding.coinName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{holding.coinName}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">
                            {holding.coinSymbol}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {qty.toLocaleString()} × ${livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-muted-foreground">24h</div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {change24h >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(change24h).toFixed(2)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-medium ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditModal(holding)}
                          data-testid={`button-edit-${holding.coinId}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteMutation.mutate(holding.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          data-testid={`button-delete-${holding.coinId}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHolding ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          
          {!editingHolding && !selectedCoin && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search coins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-coin"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredCoins.slice(0, 20).map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => {
                      setSelectedCoin(coin);
                      setBuyPrice(coin.current_price.toString());
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    data-testid={`coin-option-${coin.id}`}
                  >
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${coin.current_price.toLocaleString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(editingHolding || selectedCoin) && (
            <div className="space-y-4">
              {selectedCoin && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="font-bold">{selectedCoin.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{selectedCoin.symbol}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCoin(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {editingHolding && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <img src={editingHolding.coinImage || ""} alt={editingHolding.coinName} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="font-bold">{editingHolding.coinName}</div>
                    <div className="text-xs text-muted-foreground uppercase">{editingHolding.coinSymbol}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Buy Price (USD)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  data-testid="input-buy-price"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={editingHolding ? handleUpdateAsset : handleAddAsset}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-asset"
                >
                  {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
