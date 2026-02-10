import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, Info, Coins, Droplets, Lock, Vault } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

export default function ProIndicator() {
  const btcGoldRef = useRef<HTMLDivElement>(null);
  const altcoinRef = useRef<HTMLDivElement>(null);
  const liquidityRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const isPro = user?.role === "PRO" || user?.role === "ADMIN";

  useEffect(() => {
    if (!btcGoldRef.current || !isPro) return;

    btcGoldRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.height = '100%';
    container.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/symbols/BTCUSD%2FXAUUSD/" rel="noopener nofollow" target="_blank"><span class="blue-text">BTCUSD/XAUUSD chart</span></a><span class="trademark"> by TradingView</span>';
    container.appendChild(copyright);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "allow_symbol_change": false,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": true,
      "hide_legend": true,
      "hide_volume": true,
      "hotlist": false,
      "interval": "W",
      "locale": "en",
      "save_image": true,
      "style": "3",
      "symbol": "CRYPTO:BTCUSD/OANDA:XAUUSD",
      "theme": theme === "dark" ? "dark" : "light",
      "timezone": "Etc/UTC",
      "backgroundColor": theme === "dark" ? "#1a1a2e" : "#ffffff",
      "gridColor": "rgba(46, 46, 46, 0.06)",
      "watchlist": [],
      "withdateranges": false,
      "compareSymbols": [
        {
          "symbol": "CRYPTO:BTCUSD",
          "position": "NewPane"
        }
      ],
      "studies": [],
      "autosize": true
    });
    container.appendChild(script);

    btcGoldRef.current.appendChild(container);

    return () => {
      if (btcGoldRef.current) {
        btcGoldRef.current.innerHTML = '';
      }
    };
  }, [theme, isPro]);

  useEffect(() => {
    if (!altcoinRef.current || !isPro) return;

    altcoinRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.height = '100%';
    container.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/symbols/TOTAL2%2FNASDAQ%2FGOLD/" rel="noopener nofollow" target="_blank"><span class="blue-text">TOTAL2/NASDAQ/GOLD chart</span></a><span class="trademark"> by TradingView</span>';
    container.appendChild(copyright);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "allow_symbol_change": false,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": true,
      "hide_top_toolbar": true,
      "hide_legend": true,
      "hide_volume": true,
      "hotlist": false,
      "interval": "W",
      "locale": "en",
      "save_image": false,
      "style": "3",
      "symbol": "CRYPTOCAP:TOTAL2/IG:NASDAQ/TVC:GOLD",
      "theme": theme === "dark" ? "dark" : "light",
      "timezone": "Etc/UTC",
      "backgroundColor": theme === "dark" ? "#1a1a2e" : "rgba(219, 219, 219, 1)",
      "gridColor": "rgba(46, 46, 46, 0.06)",
      "watchlist": [],
      "withdateranges": false,
      "compareSymbols": [],
      "studies": [
        "STD;Average%Day%Range"
      ],
      "autosize": true
    });
    container.appendChild(script);

    altcoinRef.current.appendChild(container);

    return () => {
      if (altcoinRef.current) {
        altcoinRef.current.innerHTML = '';
      }
    };
  }, [theme, isPro]);

  useEffect(() => {
    if (!liquidityRef.current || !isPro) return;

    liquidityRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    container.style.height = '100%';
    container.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = 'calc(100% - 32px)';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/heatmap/crypto/" rel="noopener nofollow" target="_blank"><span class="blue-text">Crypto Heatmap</span></a><span class="trademark"> by TradingView</span>';
    container.appendChild(copyright);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "dataSource": "Crypto",
      "blockSize": "market_cap_calc",
      "blockColor": "24h_close_change|5",
      "locale": "en",
      "symbolUrl": "",
      "colorTheme": theme === "dark" ? "dark" : "light",
      "hasTopBar": false,
      "isDataSetEnabled": false,
      "isZoomEnabled": true,
      "hasSymbolTooltip": true,
      "isMonoSize": false,
      "width": "100%",
      "height": "100%"
    });
    container.appendChild(script);

    liquidityRef.current.appendChild(container);

    return () => {
      if (liquidityRef.current) {
        liquidityRef.current.innerHTML = '';
      }
    };
  }, [theme, isPro]);

  const LockedOverlay = () => (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-lg">
      <div className="p-4 rounded-full bg-amber-500/10 mb-4">
        <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 text-center px-4">Pro Feature Locked</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center px-4 max-w-sm">
        Upgrade to Pro to unlock premium indicators and advanced market analysis
      </p>
      <Link href="/pricing">
        <Button className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="button-upgrade-pro">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro - ₹499/mo
        </Button>
      </Link>
    </div>
  );

  const LockedPlaceholder = ({ height }: { height: string }) => (
    <div className={`relative w-full rounded-lg border border-border bg-muted/30 ${height}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-amber-500/50" />
          </div>
          <p className="text-sm text-muted-foreground">Chart locked for Pro members</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">Pro Indicator</h1>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">PRO</Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Premium Long-Term Trend Analysis
          </p>
        </div>

        {!isPro && (
          <Card className="mb-4 sm:mb-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">Unlock Pro Indicators</h3>
                  <p className="text-sm text-muted-foreground">
                    Get access to premium BTC/Gold ratio analysis, altcoin macro trends, and real-time liquidity heatmaps.
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto" data-testid="button-unlock-pro">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4 sm:mb-6 relative">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span className="truncate">BTC/XAU Long-Term Trend</span>
              {!isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3 sm:mb-4">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">Bitcoin vs Gold Ratio</p>
                <p className="text-muted-foreground hidden sm:block">
                  This chart shows Bitcoin priced in ounces of gold. Rising trend indicates BTC outperforming gold as a store of value. 
                  Weekly timeframe helps identify long-term macro trends.
                </p>
                <p className="text-muted-foreground sm:hidden">
                  Bitcoin priced in gold. Rising = BTC outperforming gold.
                </p>
              </div>
            </div>
            {isPro ? (
              <div 
                ref={btcGoldRef} 
                className="w-full rounded-lg overflow-hidden border border-border h-[300px] sm:h-[400px] md:h-[500px]"
                data-testid="tradingview-btc-gold-chart"
              />
            ) : (
              <div className="relative">
                <LockedPlaceholder height="h-[300px] sm:h-[400px] md:h-[500px]" />
                <LockedOverlay />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4 sm:mb-6 relative">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
              <span className="truncate">Altcoin Macro (TOTAL2/NASDAQ/GOLD)</span>
              {!isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-3 sm:mb-4">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-cyan-700 dark:text-cyan-400">Altcoin Market vs NASDAQ & Gold</p>
                <p className="text-muted-foreground hidden sm:block">
                  TOTAL2 represents the total altcoin market cap (excluding BTC). This ratio shows altcoin performance 
                  relative to NASDAQ and Gold, helping identify altcoin season potential and macro risk appetite.
                </p>
                <p className="text-muted-foreground sm:hidden">
                  Altcoin market vs traditional assets. Identifies altcoin season potential.
                </p>
              </div>
            </div>
            {isPro ? (
              <div 
                ref={altcoinRef} 
                className="w-full rounded-lg overflow-hidden border border-border h-[300px] sm:h-[400px] md:h-[500px]"
                data-testid="tradingview-altcoin-macro-chart"
              />
            ) : (
              <div className="relative">
                <LockedPlaceholder height="h-[300px] sm:h-[400px] md:h-[500px]" />
                <LockedOverlay />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4 sm:mb-6 relative">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="truncate">Liquidity - Market Heatmap</span>
              {!isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-3 sm:mb-4">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Market Liquidity Visualization</p>
                <p className="text-muted-foreground hidden sm:block">
                  Interactive heatmap showing crypto market liquidity by market cap. Block sizes represent market cap, 
                  colors indicate 24h price changes. Zoom and hover for detailed insights on individual assets.
                </p>
                <p className="text-muted-foreground sm:hidden">
                  Heatmap by market cap. Colors show 24h changes. Tap to zoom.
                </p>
              </div>
            </div>
            {isPro ? (
              <div 
                ref={liquidityRef} 
                className="w-full rounded-lg overflow-hidden border border-border h-[350px] sm:h-[450px] md:h-[600px]"
                data-testid="tradingview-liquidity-heatmap"
              />
            ) : (
              <div className="relative">
                <LockedPlaceholder height="h-[350px] sm:h-[450px] md:h-[600px]" />
                <LockedOverlay />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4 sm:mb-6 relative">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Vault className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <span className="truncate">Total Value Locked (TVL)</span>
              {!isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-3 sm:mb-4">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-purple-700 dark:text-purple-400">DeFi Total Value Locked</p>
                <p className="text-muted-foreground hidden sm:block">
                  Track the total value of assets locked in DeFi protocols. TVL is a key metric for measuring 
                  DeFi adoption and market health. Higher TVL indicates stronger confidence in the ecosystem.
                </p>
                <p className="text-muted-foreground sm:hidden">
                  DeFi assets locked across protocols. Key adoption metric.
                </p>
              </div>
            </div>
            {isPro ? (
              <div className="w-full rounded-lg overflow-hidden border border-border">
                <iframe 
                  src={`https://defillama.com/chart/?stablecoinsMcap=false&dexsVolume=false&theme=${theme === "dark" ? "dark" : "light"}`}
                  title="DefiLlama TVL Chart"
                  className="w-full h-[300px] sm:h-[360px] md:h-[400px]"
                  frameBorder="0"
                  data-testid="defillama-tvl-chart"
                />
              </div>
            ) : (
              <div className="relative">
                <LockedPlaceholder height="h-[300px] sm:h-[360px] md:h-[400px]" />
                <LockedOverlay />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          <Card className="hover-elevate">
            <CardContent className="p-3 sm:pt-6 sm:px-6">
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold text-foreground mb-0.5 sm:mb-1">Weekly</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Timeframe</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-3 sm:pt-6 sm:px-6">
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold text-amber-500 mb-0.5 sm:mb-1">BTC/XAU</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">vs Gold</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-3 sm:pt-6 sm:px-6">
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold text-cyan-500 mb-0.5 sm:mb-1">TOTAL2</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Altcoins</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate hidden md:block">
            <CardContent className="p-3 sm:pt-6 sm:px-6">
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold text-blue-500 mb-0.5 sm:mb-1">Heatmap</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">Liquidity</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate hidden md:block">
            <CardContent className="p-3 sm:pt-6 sm:px-6">
              <div className="text-center">
                <div className="text-sm sm:text-xl font-bold text-purple-500 mb-0.5 sm:mb-1">TVL</div>
                <div className="text-[10px] sm:text-sm text-muted-foreground">DeFi</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
