import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { CheckCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Welcome to Pro!</h1>
          
          <p className="text-muted-foreground mb-8">
            Your subscription has been activated. You now have access to all premium trading signals and features.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-amber-700">Pro Member</span>
            </div>
            <p className="text-sm text-amber-600">
              Your account has been upgraded to Pro status.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/signals/pro">
              <Button className="w-full" data-testid="button-view-pro-signals">
                View Pro Signals
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
