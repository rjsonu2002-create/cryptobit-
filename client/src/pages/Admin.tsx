import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Users, TrendingUp, DollarSign, Shield, Loader2, Trash2, CreditCard, CheckCircle, XCircle, Image, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentSubmission } from "@shared/schema";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
}

interface Signal {
  id: number;
  pair: string;
  direction: string;
  entry: string;
  stopLoss: string;
  takeProfits: string;
  leverage: string;
  status: string;
  tier: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalSignals: number;
}

// Helper to make admin API requests with auth header
async function adminFetch(url: string, options: RequestInit = {}) {
  const adminPassword = localStorage.getItem("adminPassword");
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      "x-admin-auth": adminPassword || "",
    },
  });
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminPassword", password);
        toast({ title: "Access granted" });
      } else {
        toast({ title: "Invalid password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Login failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    const storedPassword = localStorage.getItem("adminPassword");
    if (auth === "true" && storedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Access</CardTitle>
              <p className="text-sm text-muted-foreground">Enter admin password to continue</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                />
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-admin-login">
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Access Admin Panel
                </Button>
              </form>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Manage users, signals, and subscriptions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem("adminAuth");
              localStorage.removeItem("adminPassword");
              setIsAuthenticated(false);
            }}
            data-testid="button-admin-logout"
          >
            Logout
          </Button>
        </div>

        <AdminDashboard />
      </main>
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          loading={statsLoading}
        />
        <StatCard 
          title="Pro Subscribers" 
          value={stats?.proUsers || 0} 
          icon={DollarSign} 
          loading={statsLoading}
          color="text-amber-600"
        />
        <StatCard 
          title="Free Users" 
          value={stats?.freeUsers || 0} 
          icon={Users} 
          loading={statsLoading}
          color="text-blue-600"
        />
        <StatCard 
          title="Total Signals" 
          value={stats?.totalSignals || 0} 
          icon={TrendingUp} 
          loading={statsLoading}
          color="text-green-600"
        />
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments" data-testid="tab-payments">Payments</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="signals" data-testid="tab-signals">Signals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-6">
          <PaymentsTable />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <UsersTable />
        </TabsContent>
        
        <TabsContent value="signals" className="mt-6">
          <SignalsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, color = "text-primary" }: { 
  title: string; 
  value: number; 
  icon: any; 
  loading: boolean;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-6 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            {loading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mt-1" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold">{value.toLocaleString()}</p>
            )}
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UsersTable() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
  const { toast } = useToast();

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await adminFetch("/api/admin/users/role", {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({users?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Subscription</th>
                <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b last:border-0" data-testid={`row-user-${user.id}`}>
                  <td className="py-3 px-2">
                    <div className="font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">{user.email}</div>
                  </td>
                  <td className="py-3 px-2 text-sm hidden sm:table-cell">{user.email}</td>
                  <td className="py-3 px-2">
                    <Badge 
                      variant={user.role === "ADMIN" ? "default" : user.role === "PRO" ? "secondary" : "outline"}
                      className={user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : user.role === "PRO" ? "bg-amber-100 text-amber-700" : ""}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-sm hidden md:table-cell">
                    {user.stripeSubscriptionId ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <Select 
                      value={user.role} 
                      onValueChange={(role) => updateRole.mutate({ userId: user.id, role })}
                    >
                      <SelectTrigger className="w-20 sm:w-28 h-8 text-xs sm:text-sm" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">FREE</SelectItem>
                        <SelectItem value="PRO">PRO</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SignalsTable() {
  const { data: signals, isLoading } = useQuery<Signal[]>({
    queryKey: ["/api/admin/signals"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/signals");
      if (!res.ok) throw new Error("Failed to fetch signals");
      return res.json();
    },
  });
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pair: "",
    direction: "LONG",
    entry: "",
    stopLoss: "",
    takeProfits: "",
    leverage: "1x",
    tier: "FREE",
  });

  const createSignal = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await adminFetch("/api/admin/signals", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create signal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Signal created successfully" });
      setShowForm(false);
      setFormData({ pair: "", direction: "LONG", entry: "", stopLoss: "", takeProfits: "", leverage: "1x", tier: "FREE" });
    },
    onError: () => {
      toast({ title: "Failed to create signal", variant: "destructive" });
    },
  });

  const deleteSignal = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminFetch(`/api/admin/signals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete signal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Signal deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete signal", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSignal.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Signal</CardTitle>
          <Button 
            variant={showForm ? "outline" : "default"} 
            onClick={() => setShowForm(!showForm)}
            data-testid="button-toggle-signal-form"
          >
            {showForm ? "Cancel" : "New Signal"}
          </Button>
        </CardHeader>
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pair</label>
                <Input 
                  placeholder="BTC/USDT, ETH/USDT..." 
                  value={formData.pair} 
                  onChange={(e) => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                  required
                  data-testid="input-signal-pair"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Direction</label>
                <Select value={formData.direction} onValueChange={(v) => setFormData({...formData, direction: v})}>
                  <SelectTrigger data-testid="select-signal-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LONG">LONG</SelectItem>
                    <SelectItem value="SHORT">SHORT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tier</label>
                <Select value={formData.tier} onValueChange={(v) => setFormData({...formData, tier: v})}>
                  <SelectTrigger data-testid="select-signal-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Leverage</label>
                <Select value={formData.leverage} onValueChange={(v) => setFormData({...formData, leverage: v})}>
                  <SelectTrigger data-testid="select-signal-leverage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x">1x</SelectItem>
                    <SelectItem value="2x">2x</SelectItem>
                    <SelectItem value="5x">5x</SelectItem>
                    <SelectItem value="10x">10x</SelectItem>
                    <SelectItem value="20x">20x</SelectItem>
                    <SelectItem value="50x">50x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Price</label>
                <Input 
                  placeholder="80000" 
                  value={formData.entry} 
                  onChange={(e) => setFormData({...formData, entry: e.target.value})}
                  required
                  data-testid="input-signal-entry"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stop Loss</label>
                <Input 
                  placeholder="78000" 
                  value={formData.stopLoss} 
                  onChange={(e) => setFormData({...formData, stopLoss: e.target.value})}
                  required
                  data-testid="input-signal-stoploss"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Take Profits (comma separated)</label>
                <Input 
                  placeholder="82000, 85000, 90000" 
                  value={formData.takeProfits} 
                  onChange={(e) => setFormData({...formData, takeProfits: e.target.value})}
                  required
                  data-testid="input-signal-takeprofits"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button type="submit" disabled={createSignal.isPending} data-testid="button-create-signal">
                  {createSignal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Signal
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Trading Signals ({signals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">ID</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Pair</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Dir</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Entry</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Leverage</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Tier</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {signals?.map((signal) => (
                  <tr key={signal.id} className="border-b last:border-0" data-testid={`row-signal-${signal.id}`}>
                    <td className="py-3 px-2 text-xs sm:text-sm font-mono hidden sm:table-cell">{signal.id}</td>
                    <td className="py-3 px-2 font-medium text-sm">{signal.pair}</td>
                    <td className="py-3 px-2">
                      <Badge variant={signal.direction === "LONG" ? "default" : "destructive"} className={`text-xs ${signal.direction === "LONG" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {signal.direction === "LONG" ? "L" : "S"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-xs sm:text-sm font-mono hidden md:table-cell">${signal.entry}</td>
                    <td className="py-3 px-2 text-xs sm:text-sm font-mono hidden lg:table-cell">{signal.leverage}</td>
                    <td className="py-3 px-2">
                      <Badge variant={signal.tier === "PRO" ? "secondary" : "outline"} className={`text-xs ${signal.tier === "PRO" ? "bg-amber-100 text-amber-700" : ""}`}>
                        {signal.tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <Badge variant={signal.status === "ACTIVE" ? "default" : "outline"} className={`text-xs ${signal.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : ""}`}>
                        {signal.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteSignal.mutate(signal.id)}
                        disabled={deleteSignal.isPending}
                        data-testid={`button-delete-signal-${signal.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentsTable() {
  const { data: payments, isLoading } = useQuery<PaymentSubmission[]>({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const approvePayment = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminFetch(`/api/admin/payments/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Payment approved, user upgraded to PRO" });
    },
    onError: () => {
      toast({ title: "Failed to approve payment", variant: "destructive" });
    },
  });

  const rejectPayment = useMutation({
    mutationFn: async (id: number) => {
      const res = await adminFetch(`/api/admin/payments/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ adminNotes: "Payment rejected by admin" }),
      });
      if (!res.ok) throw new Error("Failed to reject payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({ title: "Payment rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject payment", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingPayments = payments?.filter(p => p.status === "PENDING") || [];
  const processedPayments = payments?.filter(p => p.status !== "PENDING") || [];

  return (
    <div className="space-y-6">
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh]">
            <img src={selectedImage} alt="Payment screenshot" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full"
            >
              <XCircle className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pending Payments ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending payments to review
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-muted/20"
                  data-testid={`payment-${payment.id}`}
                >
                  <button 
                    onClick={() => setSelectedImage(payment.screenshotUrl)}
                    className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors shrink-0"
                  >
                    <img 
                      src={payment.screenshotUrl} 
                      alt="Payment screenshot" 
                      className="w-full h-full object-cover"
                    />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold">{payment.referenceNumber}</span>
                      <Badge className="bg-amber-100 text-amber-700">PENDING</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      User: {payment.userName || payment.userEmail || payment.userId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      size="sm"
                      onClick={() => setSelectedImage(payment.screenshotUrl)}
                      variant="outline"
                      data-testid={`button-view-${payment.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approvePayment.mutate(payment.id)}
                      disabled={approvePayment.isPending}
                      data-testid={`button-approve-${payment.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectPayment.mutate(payment.id)}
                      disabled={rejectPayment.isPending}
                      data-testid={`button-reject-${payment.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processed Payments ({processedPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No processed payments yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">User</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Processed</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-muted-foreground">Screenshot</th>
                  </tr>
                </thead>
                <tbody>
                  {processedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 px-2 font-mono text-xs">{payment.referenceNumber}</td>
                      <td className="py-3 px-2 text-sm hidden sm:table-cell truncate max-w-[150px]">
                        {payment.userName || payment.userEmail || payment.userId}
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={payment.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground hidden md:table-cell">
                        {payment.processedAt ? new Date(payment.processedAt).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedImage(payment.screenshotUrl)}
                        >
                          <Image className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
