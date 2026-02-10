export function GlobalStats() {
  // Static dummy data as requested
  const stats = [
    { label: "Cryptos", value: "2.4M+", color: "text-blue-600" },
    { label: "Market Cap", value: "$2.34T", change: "+1.2%", isUp: true },
    { label: "24h Vol", value: "$82.41B", change: "-5.4%", isUp: false },
    { label: "Dominance", value: "BTC: 54.1% ETH: 17.2%", color: "text-orange-500" },
  ];

  return (
    <div className="w-full bg-white dark:bg-card border-b border-border py-3 hidden md:block">
      <div className="container mx-auto px-4 flex items-center gap-8 text-xs font-medium text-muted-foreground overflow-x-auto no-scrollbar">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-muted-foreground/70">{stat.label}:</span>
            <span className={stat.color || "text-foreground"}>{stat.value}</span>
            {stat.change && (
              <span className={stat.isUp ? "text-positive" : "text-negative"}>
                {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
