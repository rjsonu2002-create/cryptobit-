import { Navbar } from "@/components/Navbar";
import { SignalCard } from "@/components/SignalCard";
import { useSignalsWithPrices } from "@/hooks/use-signals";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";

export default function FreeSignals() {
  const { data, isLoading } = useSignalsWithPrices("FREE");
  const signals = data?.signals || [];
  const livePrices = data?.livePrices || {};

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Free Signals</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Free trading signals available to all users. Updated regularly with market opportunities.
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
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Free Signals Yet</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon for new trading opportunities.
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
