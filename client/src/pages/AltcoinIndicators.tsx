import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Coins, Gem, Activity, Sparkles } from "lucide-react";

export default function AltcoinIndicators() {
  const altcoins = [
    {
      name: "Ethereum (ETH)",
      indicators: [
        { name: "ETH/BTC Ratio", value: "0.052", signal: "WEAK", trend: "down" },
        { name: "Gas Fees", value: "25 Gwei", signal: "LOW", trend: "up" },
        { name: "Staking Ratio", value: "26.8%", signal: "HEALTHY", trend: "up" }
      ]
    },
    {
      name: "Solana (SOL)",
      indicators: [
        { name: "SOL/BTC Ratio", value: "0.0018", signal: "NEUTRAL", trend: "neutral" },
        { name: "TPS", value: "4,200", signal: "HIGH", trend: "up" },
        { name: "TVL", value: "$8.2B", signal: "GROWING", trend: "up" }
      ]
    },
    {
      name: "XRP",
      indicators: [
        { name: "XRP/BTC Ratio", value: "0.000023", signal: "STABLE", trend: "neutral" },
        { name: "ODL Volume", value: "$1.2B", signal: "HIGH", trend: "up" },
        { name: "Active Accounts", value: "4.8M", signal: "GROWING", trend: "up" }
      ]
    },
    {
      name: "Cardano (ADA)",
      indicators: [
        { name: "ADA/BTC Ratio", value: "0.0000054", signal: "WEAK", trend: "down" },
        { name: "Stake Pool Count", value: "3,100", signal: "STABLE", trend: "neutral" },
        { name: "DeFi TVL", value: "$450M", signal: "GROWING", trend: "up" }
      ]
    }
  ];

  const marketIndicators = [
    {
      name: "Altcoin Season Index",
      value: "42",
      signal: "BTC SEASON",
      description: "Below 50 indicates Bitcoin outperforming altcoins",
      trend: "down"
    },
    {
      name: "Total Altcoin Market Cap",
      value: "$890B",
      signal: "NEUTRAL",
      description: "Altcoin market cap excluding BTC",
      trend: "neutral"
    },
    {
      name: "ETH Dominance",
      value: "17.2%",
      signal: "STABLE",
      description: "Ethereum's share of total crypto market",
      trend: "neutral"
    },
    {
      name: "Altcoin Volatility Index",
      value: "68",
      signal: "HIGH",
      description: "Altcoins showing elevated volatility",
      trend: "up"
    },
    {
      name: "DeFi TVL",
      value: "$85B",
      signal: "RECOVERING",
      description: "Total value locked in DeFi protocols",
      trend: "up"
    },
    {
      name: "Layer 2 Activity",
      value: "High",
      signal: "GROWING",
      description: "L2 solutions seeing increased adoption",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Coins className="w-6 h-6 text-cyan-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Altcoin Indicators</h1>
          </div>
          <p className="text-muted-foreground">
            Key metrics and indicators for major altcoins and the broader altcoin market
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Market-Wide Altcoin Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketIndicators.map((indicator, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`market-indicator-${index}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{indicator.name}</CardTitle>
                    <Badge 
                      variant="secondary"
                      className={
                        indicator.trend === "up" 
                          ? "bg-green-500/10 text-green-500" 
                          : indicator.trend === "down"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }
                    >
                      {indicator.signal}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {indicator.trend === "up" ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : indicator.trend === "down" ? (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <Activity className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-2xl font-bold">{indicator.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {altcoins.map((coin) => (
          <div key={coin.name} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gem className="w-4 h-4" />
              {coin.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coin.indicators.map((indicator, index) => (
                <Card key={index} className="hover-elevate transition-all" data-testid={`coin-indicator-${coin.name}-${index}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{indicator.name}</CardTitle>
                      <Badge 
                        variant="secondary"
                        className={
                          indicator.trend === "up" 
                            ? "bg-green-500/10 text-green-500" 
                            : indicator.trend === "down"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }
                      >
                        {indicator.signal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {indicator.trend === "up" ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : indicator.trend === "down" ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      ) : (
                        <Activity className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="text-2xl font-bold">{indicator.value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Altcoin Season Meter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-cyan-500"
                    style={{ width: "42%" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>BTC Season</span>
                  <span>Neutral</span>
                  <span>Altcoin Season</span>
                </div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-orange-500">42</div>
                <div className="text-sm text-muted-foreground">BTC Season</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Current market favors Bitcoin. Altcoins may underperform in the short term. 
              Consider focusing on BTC or accumulating quality alts at lower prices.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
