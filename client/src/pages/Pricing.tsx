import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Upload, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import paymentQrCode from "@/assets/payment-qr.jpeg";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PaymentSubmission } from "@shared/schema";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isPro = user?.role === "PRO" || user?.role === "ADMIN";

  const { data: submissions } = useQuery<PaymentSubmission[]>({
    queryKey: ["/api/payments/my-submissions"],
    enabled: isAuthenticated && !isPro,
  });

  const submitPayment = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("screenshot", file);
      const response = await fetch("/api/payments/submit", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit payment");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Submitted",
        description: `Reference: ${data.referenceNumber}. Admin will verify and upgrade your account.`,
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ["/api/payments/my-submissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      submitPayment.mutate(selectedFile);
    }
  };

  const hasPendingSubmission = submissions?.some(s => s.status === "PENDING");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Choose Your Plan</h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Unlock premium trading signals and get ahead of the market with our Pro subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-card rounded-2xl border border-border p-5 sm:p-8 relative">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Free</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Basic access</p>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold">₹0</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <Feature text="Access to free trading signals" />
              <Feature text="Basic market overview" />
              <Feature text="Real-time cryptocurrency prices" />
              <Feature text="Limited signal details (blurred)" />
            </ul>

            {!isPro && (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-200 dark:border-amber-800 p-5 sm:p-8 relative">
            <div className="absolute -top-3 right-4">
              <span className="px-2 sm:px-3 py-1 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                RECOMMENDED
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Pro</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Premium access</p>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold">₹499</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <Feature text="All free features included" />
              <Feature text="Full signal details (unblurred)" highlight />
              <Feature text="Exclusive Pro trading signals" highlight />
              <Feature text="Priority signal delivery" highlight />
              <Feature text="Advanced market analysis" />
              <Feature text="Full signal history access" />
            </ul>

            {isPro ? (
              <Button variant="outline" className="w-full bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" disabled>
                <Check className="w-4 h-4 mr-2" />
                You are a Pro Member
              </Button>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white dark:bg-card rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs sm:text-sm font-medium text-center mb-2 sm:mb-3">Step 1: Scan QR to pay ₹499</p>
                  <div className="flex justify-center">
                    <img 
                      src={paymentQrCode} 
                      alt="PhonePe Payment QR Code" 
                      className="w-36 h-36 sm:w-48 sm:h-48 object-contain rounded-lg"
                      data-testid="img-payment-qr"
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2">
                    Pay to: CHIRAG DAHIYA via PhonePe
                  </p>
                </div>
                
                {isAuthenticated ? (
                  <div className="bg-white dark:bg-card rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs sm:text-sm font-medium text-center mb-2 sm:mb-3">Step 2: Upload Payment Screenshot</p>
                    
                    {hasPendingSubmission ? (
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Payment Under Review</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">Your payment is being verified. Check back soon!</p>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          data-testid="input-screenshot"
                        />
                        
                        {previewUrl ? (
                          <div className="space-y-3">
                            <div className="relative">
                              <img 
                                src={previewUrl} 
                                alt="Payment screenshot preview" 
                                className="w-full max-h-48 object-contain rounded-lg border border-border"
                              />
                              <button 
                                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full text-xs"
                                data-testid="button-remove-screenshot"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                            <Button 
                              onClick={handleSubmit}
                              disabled={submitPayment.isPending}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                              data-testid="button-submit-payment"
                            >
                              {submitPayment.isPending ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                              ) : (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Submit for Verification</>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-4 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            data-testid="button-upload-screenshot"
                          >
                            <Upload className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Click to upload screenshot</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-400 text-center">
                      Please log in to submit your payment screenshot
                    </p>
                  </div>
                )}

                {submissions && submissions.length > 0 && (
                  <div className="bg-white dark:bg-card rounded-xl p-3 sm:p-4 border border-border">
                    <p className="text-xs font-medium mb-2">Your Submissions:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                          <span className="font-mono">{sub.referenceNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            sub.status === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            sub.status === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Need help? Contact the admin for any payment-related queries.
          </p>
        </div>
      </main>
    </div>
  );
}

function Feature({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <Check className={`w-5 h-5 ${highlight ? "text-amber-600" : "text-green-600"}`} />
      <span className={highlight ? "font-medium" : ""}>{text}</span>
    </li>
  );
}
