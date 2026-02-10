import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target, Shield, BarChart3 } from "lucide-react";

export default function BTCLongTerm() {
  const indicators = [
    {
      name: "200-Day Moving Average",
      value: "$42,850",
      signal: "BULLISH",
      description: "Price is above the 200 DMA indicating long-term uptrend",
      trend: "up"
    },
    {
      name: "MVRV Z-Score",
      value: "2.1",
      signal: "NEUTRAL",
      description: "Market value vs realized value suggests fair valuation",
      trend: "neutral"
    },
    {
      name: "Stock-to-Flow Model",
      value: "$85,000",
      signal: "BULLISH",
      description: "Current price below model target, room for growth",
      trend: "up"
    },
    {
      name: "Pi Cycle Top Indicator",
      value: "No Signal",
      signal: "BULLISH",
      description: "No cycle top detected, bull market continues",
      trend: "up"
    },
    {
      name: "Puell Multiple",
      value: "1.2",
      signal: "NEUTRAL",
      description: "Miner profitability in healthy range",
      trend: "neutral"
    },
    {
      name: "Reserve Risk",
      value: "0.0021",
      signal: "BULLISH",
      description: "Low risk zone - good time to accumulate",
      trend: "up"
    },
    {
      name: "RHODL Ratio",
      value: "15,420",
      signal: "NEUTRAL",
      description: "Balance between short and long-term holders",
      trend: "neutral"
    },
    {
      name: "Realized Cap HODL Waves",
      value: "45%",
      signal: "BULLISH",
      description: "High percentage of coins held long-term",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">BTC Long-Term Indicators</h1>
          </div>
          <p className="text-muted-foreground">
            On-chain and macro indicators for long-term Bitcoin investment decisions (weeks to years)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {indicators.map((indicator, index) => (
            <Card key={index} className="hover-elevate transition-all" data-testid={`indicator-card-${index}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{indicator.name}</CardTitle>
                  <Badge 
                    variant={indicator.signal === "BULLISH" ? "default" : "secondary"}
                    className={indicator.signal === "BULLISH" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
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
                    <BarChart3 className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-2xl font-bold">{indicator.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{indicator.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Long-Term Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-sm text-muted-foreground mb-1">Bullish Indicators</div>
                <div className="text-2xl font-bold text-green-500">5</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-sm text-muted-foreground mb-1">Neutral Indicators</div>
                <div className="text-2xl font-bold text-yellow-500">3</div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-sm text-muted-foreground mb-1">Bearish Indicators</div>
                <div className="text-2xl font-bold text-red-500">0</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Overall long-term outlook: <span className="text-green-500 font-semibold">Bullish</span> - 
              Majority of long-term indicators suggest favorable conditions for accumulation.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
