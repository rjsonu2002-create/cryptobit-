import { Navbar } from "@/components/Navbar";
import { SignalCard } from "@/components/SignalCard";
import { useSignalsWithPrices } from "@/hooks/use-signals";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown } from "lucide-react";

export default function ProSignals() {
  const { data, isLoading } = useSignalsWithPrices("PRO");
  const signals = data?.signals || [];
  const livePrices = data?.livePrices || {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Pro Signals</h1>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              PREMIUM
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Exclusive premium trading signals with higher accuracy and detailed analysis.
          </p>
        </div>

        {isLoading ? (
          <SignalsSkeleton />
        ) : signals && signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} livePrice={livePrices[signal.pair]} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-border">
            <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pro Signals Yet</h3>
            <p className="text-sm text-muted-foreground">
              Premium signals will be posted here. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SignalsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
