import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap, Activity, AlertTriangle, BarChart3 } from "lucide-react";

export default function BTCShortTerm() {
  const indicators = [
    {
      name: "RSI (14)",
      value: "62.5",
      signal: "NEUTRAL",
      description: "Relative Strength Index shows balanced momentum",
      trend: "neutral"
    },
    {
      name: "MACD",
      value: "Bullish Cross",
      signal: "BULLISH",
      description: "MACD line crossed above signal line",
      trend: "up"
    },
    {
      name: "Bollinger Bands",
      value: "Upper Band",
      signal: "CAUTION",
      description: "Price near upper band, potential pullback",
      trend: "down"
    },
    {
      name: "Funding Rate",
      value: "0.015%",
      signal: "NEUTRAL",
      description: "Slightly positive funding, balanced market",
      trend: "neutral"
    },
    {
      name: "Open Interest",
      value: "$18.2B",
      signal: "BULLISH",
      description: "Rising OI with price, confirms trend",
      trend: "up"
    },
    {
      name: "Stochastic RSI",
      value: "78",
      signal: "CAUTION",
      description: "Approaching overbought territory",
      trend: "down"
    },
    {
      name: "Volume Profile",
      value: "Above Avg",
      signal: "BULLISH",
      description: "Strong volume supporting current move",
      trend: "up"
    },
    {
      name: "EMA 9/21 Cross",
      value: "Bullish",
      signal: "BULLISH",
      description: "Short-term EMAs in bullish alignment",
      trend: "up"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">BTC Short-Term Indicators</h1>
          </div>
          <p className="text-muted-foreground">
            Technical indicators for short-term Bitcoin trading decisions (hours to days)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {indicators.map((indicator, index) => (
            <Card key={index} className="hover-elevate transition-all" data-testid={`indicator-card-${index}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{indicator.name}</CardTitle>
                  <Badge 
                    variant="secondary"
                    className={
                      indicator.signal === "BULLISH" 
                        ? "bg-green-500/10 text-green-500" 
                        : indicator.signal === "CAUTION"
                        ? "bg-orange-500/10 text-orange-500"
                        : ""
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
                    <TrendingDown className="w-5 h-5 text-orange-500" />
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Short-Term Trading Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-sm text-muted-foreground mb-1">Bullish Signals</div>
                <div className="text-2xl font-bold text-green-500">4</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-sm text-muted-foreground mb-1">Neutral Signals</div>
                <div className="text-2xl font-bold text-yellow-500">2</div>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-sm text-muted-foreground mb-1">Caution Signals</div>
                <div className="text-2xl font-bold text-orange-500">2</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Short-term bias: <span className="text-green-500 font-semibold">Moderately Bullish</span> - 
              Momentum is positive but watch for potential pullback near resistance levels.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
