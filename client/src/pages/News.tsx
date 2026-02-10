import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, ExternalLink, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: number;
  categories: string;
  tags: string[];
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export default function News() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<{ news: NewsItem[] }>({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const news = data?.news || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Newspaper className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Crypto News</h1>
              <p className="text-sm text-muted-foreground">Latest updates from CryptoCompare</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-news"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="w-full sm:w-32 h-24 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card>
            <CardContent className="p-8 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load news</h3>
              <p className="text-muted-foreground mb-4">Unable to fetch the latest crypto news</p>
              <Button onClick={() => refetch()} data-testid="button-retry-news">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && news.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No news available</h3>
              <p className="text-muted-foreground">Check back later for the latest updates</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && news.length > 0 && (
          <div className="space-y-4">
            {news.map((item) => (
              <a 
                key={item.id} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
                data-testid={`news-item-${item.id}`}
              >
                <Card className="hover-elevate cursor-pointer transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {item.imageUrl && (
                        <div className="w-full sm:w-40 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {item.categories && (
                            <Badge variant="secondary" className="text-xs">
                              {item.categories.split("|")[0]}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(item.publishedAt)}
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {truncateText(item.body, 200)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{item.source}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-primary">
                            Read more
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.slice(0, 4).map((tag, i) => (
                              <span 
                                key={i}
                                className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            News powered by CryptoCompare. Auto-refreshes every 5 minutes.
          </p>
        </div>
      </main>
    </div>
  );
}
