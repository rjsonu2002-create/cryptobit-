import { Navbar } from "@/components/Navbar";
import { GlobalStats } from "@/components/GlobalStats";
import { CoinTable } from "@/components/CoinTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <GlobalStats />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Today's Cryptocurrency Prices by Market Cap
          </h1>
        </div>

        <CoinTable />
      </main>

      <footer className="bg-white dark:bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 CryptoMarket. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
