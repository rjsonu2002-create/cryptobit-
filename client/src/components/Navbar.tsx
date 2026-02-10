import { Link, useLocation } from "wouter";
import { Search, ChevronDown, Zap, Crown, User, LogOut, Clock, Activity, LineChart, Coins, Newspaper, History, Globe, Briefcase, BarChart2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImage from "@assets/ChatGPT_Image_Feb_3,_2026,_05_17_33_PM_1770119269571.png";

export function Navbar() {
  const [location] = useLocation();
  const [tradeMenuOpen, setTradeMenuOpen] = useState(false);
  const [indicatorsMenuOpen, setIndicatorsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const indicatorsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTradeMenuOpen(false);
      }
      if (indicatorsMenuRef.current && !indicatorsMenuRef.current.contains(event.target as Node)) {
        setIndicatorsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTradeActive = location.startsWith("/signals");
  const isIndicatorsActive = location.startsWith("/indicators");

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src={logoImage} 
              alt="CryptoBit Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              CryptoBit
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${location === "/" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              Cryptocurrencies
            </Link>
            
            <Link 
              href="/market-overview"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${location === "/market-overview" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              Market Overview
            </Link>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setTradeMenuOpen(!tradeMenuOpen)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${isTradeActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                data-testid="button-trade-ideas"
              >
                Trade Ideas
                <ChevronDown className={`w-4 h-4 transition-transform ${tradeMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {tradeMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                  <Link
                    href="/signals"
                    onClick={() => setTradeMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-all-signals"
                  >
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">All Signals</div>
                      <div className="text-xs text-muted-foreground">Performance & stats</div>
                    </div>
                  </Link>
                  <Link
                    href="/signals/free"
                    onClick={() => setTradeMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-free-signals"
                  >
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Zap className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Free Signals</div>
                      <div className="text-xs text-muted-foreground">Open to everyone</div>
                    </div>
                  </Link>
                  <Link
                    href="/signals/pro"
                    onClick={() => setTradeMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-pro-signals"
                  >
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Crown className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        Pro Signals
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">PRO</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Premium members</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="relative" ref={indicatorsMenuRef}>
              <button
                onClick={() => setIndicatorsMenuOpen(!indicatorsMenuOpen)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${isIndicatorsActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                data-testid="button-indicators"
              >
                Indicators
                <ChevronDown className={`w-4 h-4 transition-transform ${indicatorsMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {indicatorsMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                  <Link
                    href="/indicators/btc-long-term"
                    onClick={() => setIndicatorsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-btc-long-term"
                  >
                    <div className="p-1.5 bg-orange-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">BTC Long-Term</div>
                      <div className="text-xs text-muted-foreground">Macro indicators</div>
                    </div>
                  </Link>
                  <Link
                    href="/indicators/btc-short-term"
                    onClick={() => setIndicatorsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-btc-short-term"
                  >
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">BTC Short-Term</div>
                      <div className="text-xs text-muted-foreground">Technical signals</div>
                    </div>
                  </Link>
                  <Link
                    href="/indicators/classic"
                    onClick={() => setIndicatorsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-classic-indicators"
                  >
                    <div className="p-1.5 bg-purple-500/10 rounded-lg">
                      <LineChart className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Classic Indicators</div>
                      <div className="text-xs text-muted-foreground">On-chain & market</div>
                    </div>
                  </Link>
                  <Link
                    href="/indicators/altcoin"
                    onClick={() => setIndicatorsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-altcoin-indicators"
                  >
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                      <Coins className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Altcoin Indicators</div>
                      <div className="text-xs text-muted-foreground">ETH, SOL, XRP & more</div>
                    </div>
                  </Link>
                  <div className="border-t border-border my-1" />
                  <Link
                    href="/indicators/pro"
                    onClick={() => setIndicatorsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-pro-indicator"
                  >
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                      <Crown className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        Pro Indicator
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">PRO</span>
                      </div>
                      <div className="text-xs text-muted-foreground">BTC/Gold Long Trend</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-muted/50 border border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                data-testid="input-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="hidden md:flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted/50 transition-colors"
                data-testid="button-user-menu"
              >
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.firstName || "User"} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium">
                  {user.firstName || user.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-card rounded-xl border border-border shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="font-medium text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${user.role === "PRO" ? "bg-amber-100 text-amber-700" : user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                        {user.role || "FREE"}
                      </span>
                    </div>
                  </div>
                  
                  {user.role !== "PRO" && user.role !== "ADMIN" && (
                    <Link
                      href="/pricing"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors text-amber-600"
                      data-testid="link-upgrade"
                    >
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Upgrade to Pro</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-border my-1" />
                  
                  <Link
                    href="/portfolio"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-portfolio"
                  >
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{t("nav.portfolio")}</span>
                  </Link>
                  
                  <Link
                    href="/news"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-news"
                  >
                    <Newspaper className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{t("nav.news")}</span>
                  </Link>
                  
                  <Link
                    href="/history"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-history"
                  >
                    <History className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{t("nav.history")}</span>
                  </Link>
                  
                  <Link
                    href="/polymarket"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-polymarket"
                  >
                    <BarChart2 className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium">Polymarket</span>
                  </Link>
                  
                  <Link
                    href="/language"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                    data-testid="link-language"
                  >
                    <Globe className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{t("nav.language")}</span>
                  </Link>
                  
                  <div className="border-t border-border my-1" />
                  
                  <a
                    href="/api/logout"
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/50 transition-colors text-red-600"
                    data-testid="link-logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("nav.logout")}</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <a href="/api/login">
                <Button variant="ghost" size="sm" data-testid="button-login">
                  {t("nav.login")}
                </Button>
              </a>
              <a href="/api/login">
                <Button size="sm" data-testid="button-signup">
                  {t("nav.login")}
                </Button>
              </a>
            </div>
          )}
          
          <ThemeToggle />
        </div>
      </div>

    </nav>
  );
}
