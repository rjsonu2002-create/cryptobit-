import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LineChart, BarChart2, Activity, Target } from "lucide-react";

export default function ClassicIndicators() {
  const indicators = [
    {
      name: "Fear & Greed Index",
      value: "68",
      signal: "GREED",
      description: "Market sentiment showing greed, be cautious",
      trend: "up",
      category: "Sentiment"
    },
    {
      name: "Bitcoin Dominance",
      value: "52.3%",
      signal: "NEUTRAL",
      description: "BTC market share relatively stable",
      trend: "neutral",
      category: "Market Structure"
    },
    {
      name: "NVT Ratio",
      value: "45.2",
      signal: "UNDERVALUED",
      description: "Network value vs transaction value suggests undervaluation",
      trend: "up",
      category: "On-Chain"
    },
    {
      name: "Hash Rate",
      value: "520 EH/s",
      signal: "ATH",
      description: "Network security at all-time high",
      trend: "up",
      category: "Network"
    },
    {
      name: "Active Addresses",
      value: "1.2M",
      signal: "GROWING",
      description: "Daily active addresses increasing",
      trend: "up",
      category: "On-Chain"
    },
    {
      name: "Exchange Reserves",
      value: "2.1M BTC",
      signal: "DECREASING",
      description: "Coins moving off exchanges - bullish",
      trend: "up",
      category: "Exchange"
    },
    {
      name: "Miner Outflows",
      value: "Low",
      signal: "BULLISH",
      description: "Miners holding, not selling",
      trend: "up",
      category: "Mining"
    },
    {
      name: "Long/Short Ratio",
      value: "1.15",
      signal: "NEUTRAL",
      description: "Slightly more longs than shorts",
      trend: "neutral",
      category: "Derivatives"
    },
    {
      name: "Whale Accumulation",
      value: "High",
      signal: "BULLISH",
      description: "Large holders accumulating",
      trend: "up",
      category: "On-Chain"
    },
    {
      name: "Network Difficulty",
      value: "75.5T",
      signal: "RISING",
      description: "Difficulty increasing, network growing",
      trend: "up",
      category: "Mining"
    },
    {
      name: "SOPR",
      value: "1.02",
      signal: "PROFIT",
      description: "Coins moving at slight profit on average",
      trend: "neutral",
      category: "On-Chain"
    },
    {
      name: "Realized Price",
      value: "$28,450",
      signal: "SUPPORT",
      description: "Average acquisition cost of all BTC",
      trend: "up",
      category: "On-Chain"
    }
  ];

  const categories = Array.from(new Set(indicators.map(i => i.category)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <LineChart className="w-6 h-6 text-purple-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Classic Crypto Indicators</h1>
          </div>
          <p className="text-muted-foreground">
            Essential on-chain, network, and market structure indicators for crypto analysis
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {indicators
                .filter((i) => i.category === category)
                .map((indicator, index) => (
                  <Card key={index} className="hover-elevate transition-all" data-testid={`indicator-card-${category}-${index}`}>
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
        ))}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overall Market Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: "72%" }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold text-green-500">72%</div>
                <div className="text-sm text-muted-foreground">Bullish Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
