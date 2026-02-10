import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, TrendingUp, Zap, Briefcase, User, Crown, X, Clock, Activity, LineChart, Coins, BarChart3, LogIn, LogOut, Globe, History, Bell, BarChart2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type MenuType = "signals" | "market" | "indicators" | "menu" | null;

export function MobileFooter() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);

  const isSignalsActive = location.startsWith("/signals");
  const isIndicatorsActive = location.startsWith("/indicators");
  const isMarketActive = location === "/market-overview" || location === "/";

  const closeMenu = () => setActiveMenu(null);

  const toggleMenu = (menu: MenuType) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <>
      {activeMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}
      
      {activeMenu === "market" && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-xl rounded-t-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Market</h3>
              <button onClick={closeMenu} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-cryptocurrencies"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Cryptocurrencies</div>
                  <div className="text-xs text-muted-foreground">All coins & prices</div>
                </div>
              </Link>
              
              <Link
                href="/market-overview"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-market-overview"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Market Overview</div>
                  <div className="text-xs text-muted-foreground">Market stats & trends</div>
                </div>
              </Link>
              
            </div>
          </div>
        </div>
      )}

      {activeMenu === "signals" && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-xl rounded-t-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t("nav.signals")}</h3>
              <button onClick={closeMenu} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/signals"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-all-signals"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">All Signals</div>
                  <div className="text-xs text-muted-foreground">Performance & stats</div>
                </div>
              </Link>
              
              <Link
                href="/signals/free"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-free-signals"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t("signals.free")}</div>
                  <div className="text-xs text-muted-foreground">Open to everyone</div>
                </div>
              </Link>
              
              <Link
                href="/signals/pro"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-pro-signals"
              >
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    {t("signals.pro")}
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">PRO</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Premium members</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMenu === "indicators" && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-xl rounded-t-2xl animate-in slide-in-from-bottom-5 duration-200 max-h-[60vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-card">
              <h3 className="font-semibold text-foreground">Indicators</h3>
              <button onClick={closeMenu} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/indicators/btc-long-term"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-btc-long-term"
              >
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">BTC Long-Term</div>
                  <div className="text-xs text-muted-foreground">Macro indicators</div>
                </div>
              </Link>
              
              <Link
                href="/indicators/btc-short-term"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-btc-short-term"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">BTC Short-Term</div>
                  <div className="text-xs text-muted-foreground">Technical signals</div>
                </div>
              </Link>
              
              <Link
                href="/indicators/classic"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-classic"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <LineChart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Classic Indicators</div>
                  <div className="text-xs text-muted-foreground">On-chain & market</div>
                </div>
              </Link>
              
              <Link
                href="/indicators/altcoin"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-altcoin"
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Coins className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">Altcoin Indicators</div>
                  <div className="text-xs text-muted-foreground">ETH, SOL, XRP & more</div>
                </div>
              </Link>
              
              <Link
                href="/indicators/pro"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid="footer-link-pro-indicator"
              >
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    Pro Indicator
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">PRO</span>
                  </div>
                  <div className="text-xs text-muted-foreground">BTC/Gold Long Trend</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMenu === "menu" && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-xl rounded-t-2xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{isAuthenticated ? "Account" : t("nav.login")}</h3>
              <button onClick={closeMenu} className="p-1 rounded-full hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {!isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <a href="/api/login" className="flex-1">
                    <Button variant="outline" className="w-full" data-testid="footer-button-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Log in
                    </Button>
                  </a>
                  <a href="/api/login" className="flex-1">
                    <Button className="w-full" data-testid="footer-button-signup">
                      Sign up
                    </Button>
                  </a>
                </div>
                
                <div className="border-t border-border pt-3">
                  <Link
                    href="/pricing"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid="footer-link-pricing"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Upgrade to Pro</div>
                      <div className="text-xs text-muted-foreground">Premium features</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/polymarket"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid="footer-link-polymarket"
                  >
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <BarChart2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Polymarket</div>
                      <div className="text-xs text-muted-foreground">Prediction markets</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/language"
                    onClick={closeMenu}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid="footer-link-language"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Language</div>
                      <div className="text-xs text-muted-foreground">Change app language</div>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || "User"} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    user?.role === "PRO" 
                      ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400" 
                      : user?.role === "ADMIN" 
                        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {user?.role || "FREE"}
                  </span>
                </div>
                
                <Link
                  href="/pricing"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid="footer-link-pricing"
                >
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Upgrade to Pro</div>
                    <div className="text-xs text-muted-foreground">Premium features</div>
                  </div>
                </Link>
                
                <Link
                  href="/history"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid="footer-link-history"
                >
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <History className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">History</div>
                    <div className="text-xs text-muted-foreground">View your activity</div>
                  </div>
                </Link>
                
                <Link
                  href="/reminders"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid="footer-link-reminders"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Reminders</div>
                    <div className="text-xs text-muted-foreground">Price alerts & notifications</div>
                  </div>
                </Link>
                
                <Link
                  href="/polymarket"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid="footer-link-polymarket"
                >
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                    <BarChart2 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Polymarket</div>
                    <div className="text-xs text-muted-foreground">Prediction markets</div>
                  </div>
                </Link>
                
                <Link
                  href="/language"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid="footer-link-language"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Language</div>
                    <div className="text-xs text-muted-foreground">Change app language</div>
                  </div>
                </Link>
                
                <a
                  href="/api/logout"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600"
                  data-testid="footer-link-logout"
                >
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Log out</div>
                    <div className="text-xs text-muted-foreground">Sign out of your account</div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => toggleMenu("market")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              isMarketActive || activeMenu === "market" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mobile-footer-market"
          >
            <TrendingUp className={`w-5 h-5 ${isMarketActive || activeMenu === "market" ? "text-primary" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">Market</span>
          </button>

          <button
            onClick={() => toggleMenu("signals")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              isSignalsActive || activeMenu === "signals" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mobile-footer-signals"
          >
            <Zap className={`w-5 h-5 ${isSignalsActive || activeMenu === "signals" ? "text-primary" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">{t("nav.signals")}</span>
          </button>

          <button
            onClick={() => toggleMenu("indicators")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              isIndicatorsActive || activeMenu === "indicators" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mobile-footer-indicators"
          >
            <LineChart className={`w-5 h-5 ${isIndicatorsActive || activeMenu === "indicators" ? "text-primary" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">Indicators</span>
          </button>

          <Link
            href="/portfolio"
            onClick={closeMenu}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              location === "/portfolio" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mobile-footer-portfolio"
          >
            <Briefcase className={`w-5 h-5 ${location === "/portfolio" ? "text-primary" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">{t("nav.portfolio")}</span>
          </Link>

          <button
            onClick={() => toggleMenu("menu")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              activeMenu === "menu" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="mobile-footer-menu"
          >
            <User className={`w-5 h-5 ${activeMenu === "menu" ? "text-primary" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">{isAuthenticated ? "Menu" : t("nav.login")}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
