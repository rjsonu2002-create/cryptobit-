import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import { MobileFooter } from "@/components/MobileFooter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CoinDetail from "@/pages/CoinDetail";
import MarketOverview from "@/pages/MarketOverview";
import FreeSignals from "@/pages/FreeSignals";
import ProSignals from "@/pages/ProSignals";
import Signals from "@/pages/Signals";
import Pricing from "@/pages/Pricing";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import Admin from "@/pages/Admin";
import BTCLongTerm from "@/pages/BTCLongTerm";
import BTCShortTerm from "@/pages/BTCShortTerm";
import ClassicIndicators from "@/pages/ClassicIndicators";
import AltcoinIndicators from "@/pages/AltcoinIndicators";
import ProIndicator from "@/pages/ProIndicator";
import Portfolio from "@/pages/Portfolio";
import News from "@/pages/News";
import HistoryReminder from "@/pages/HistoryReminder";
import Language from "@/pages/Language";
import Polymarket from "@/pages/Polymarket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/market-overview" component={MarketOverview} />
      <Route path="/signals" component={Signals} />
      <Route path="/signals/free" component={FreeSignals} />
      <Route path="/signals/pro" component={ProSignals} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/admin" component={Admin} />
      <Route path="/coin/:id" component={CoinDetail} />
      <Route path="/indicators/btc-long-term" component={BTCLongTerm} />
      <Route path="/indicators/btc-short-term" component={BTCShortTerm} />
      <Route path="/indicators/classic" component={ClassicIndicators} />
      <Route path="/indicators/altcoin" component={AltcoinIndicators} />
      <Route path="/indicators/pro" component={ProIndicator} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/news" component={News} />
      <Route path="/history" component={HistoryReminder} />
      <Route path="/language" component={Language} />
      <Route path="/polymarket" component={Polymarket} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <div className="pb-16 md:pb-0">
              <Router />
            </div>
            <MobileFooter />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
