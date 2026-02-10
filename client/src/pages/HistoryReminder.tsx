import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Bell, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HistoryReminder() {
  const { isAuthenticated } = useAuth();

  const historyItems = [
    {
      id: 1,
      date: "Feb 3, 2025",
      event: "Bitcoin ATH Anniversary",
      description: "1 year ago Bitcoin reached $69,000 for the first time",
      type: "milestone"
    },
    {
      id: 2,
      date: "Feb 5, 2025",
      event: "Ethereum Merge Anniversary",
      description: "Ethereum transitioned from PoW to PoS",
      type: "upgrade"
    },
    {
      id: 3,
      date: "Feb 10, 2025",
      event: "Market Correction Reminder",
      description: "2 years ago market dropped 30% - be prepared",
      type: "warning"
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">Please login to access history reminders</p>
              <a href="/api/login">
                <Button data-testid="button-login-history">Login to Continue</Button>
              </a>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <History className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">History Reminder</h1>
              <p className="text-sm text-muted-foreground">Important dates and market anniversaries</p>
            </div>
          </div>
          <Button variant="outline" data-testid="button-add-reminder">
            <Bell className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">Upcoming</span>
              </div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Events this week</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">Historical</span>
              </div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Major market events tracked</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-background">
                    {item.type === "milestone" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {item.type === "upgrade" && <History className="w-4 h-4 text-blue-500" />}
                    {item.type === "warning" && <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.event}</span>
                      <Badge variant="secondary" className="text-xs">{item.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
