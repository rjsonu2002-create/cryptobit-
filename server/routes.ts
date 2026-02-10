import type { Express } from "express";
import type { Server } from "http";
import { fetchMarkets, fetchCoinById, fetchCoinChart, fetchGlobalData, fetchGlobalMarketCapChart, getCoinIdFromPair, fetchCoinPrice } from "./coingecko";
import { storage } from "./storage";
import { insertSignalSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { userService } from "./userService";
import { startSignalEngine } from "./signalEngine";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "payments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

function generateReferenceNumber(): string {
  const prefix = "PAY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// No-op webhook route (Stripe removed)
export async function registerWebhookRoute(_app: Express): Promise<void> {
  // Stripe integration removed - using manual payment via QR code
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // GET /api/global - fetch global market data
  app.get("/api/global", async (_req, res) => {
    try {
      const globalData = await fetchGlobalData();
      res.json(globalData);
    } catch (error) {
      console.error("Error fetching global data:", error);
      res.status(500).json({ message: "Failed to fetch global data" });
    }
  });

  // GET /api/global/chart - fetch global market cap chart
  app.get("/api/global/chart", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const chartData = await fetchGlobalMarketCapChart(days);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching global chart:", error);
      res.status(500).json({ message: "Failed to fetch global chart data" });
    }
  });

  // GET /api/markets - fetch top 100 coins from CoinGecko
  app.get("/api/markets", async (_req, res) => {
    try {
      const markets = await fetchMarkets();
      const formatted = markets.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        total_volume: coin.total_volume,
        price_change_percentage_24h: coin.price_change_percentage_24h,
      }));
      res.json(formatted);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // GET /api/coin/:id - fetch single coin details
  app.get("/api/coin/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const coin = await fetchCoinById(id);
      res.json({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image.large,
        current_price: coin.market_data.current_price.usd,
        market_cap: coin.market_data.market_cap.usd,
        total_volume: coin.market_data.total_volume.usd,
        price_change_percentage_24h: coin.market_data.price_change_percentage_24h,
        description: coin.description.en,
      });
    } catch (error) {
      console.error("Error fetching coin:", error);
      res.status(500).json({ message: "Failed to fetch coin data" });
    }
  });

  // GET /api/coin/:id/chart - fetch coin chart data
  app.get("/api/coin/:id/chart", async (req, res) => {
    try {
      const { id } = req.params;
      const period = (req.query.period as string) || "24H";
      const chartData = await fetchCoinChart(id, period);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Portfolio API routes
  app.get("/api/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const holdings = await storage.getPortfolioByUser(userId);
      res.json({ holdings });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { coinId, coinName, coinSymbol, coinImage, quantity, buyPrice } = req.body;
      
      if (!coinId || !coinName || !coinSymbol || !quantity || !buyPrice) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const holding = await storage.addPortfolioHolding({
        userId,
        coinId,
        coinName,
        coinSymbol,
        coinImage: coinImage || null,
        quantity: String(quantity),
        buyPrice: String(buyPrice),
      });
      
      res.json({ holding });
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      res.status(500).json({ message: "Failed to add to portfolio" });
    }
  });

  app.put("/api/portfolio/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      const { quantity, buyPrice } = req.body;
      
      if (!quantity || !buyPrice) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const holding = await storage.updatePortfolioHolding(
        parseInt(id),
        userId,
        String(quantity),
        String(buyPrice)
      );
      
      if (!holding) {
        return res.status(404).json({ message: "Holding not found" });
      }
      
      res.json({ holding });
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Failed to update portfolio" });
    }
  });

  app.delete("/api/portfolio/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      
      await storage.deletePortfolioHolding(parseInt(id), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting from portfolio:", error);
      res.status(500).json({ message: "Failed to delete from portfolio" });
    }
  });

  // GET /api/polymarket - fetch prediction markets from Polymarket
  app.get("/api/polymarket", async (_req, res) => {
    try {
      const response = await fetch("https://gamma-api.polymarket.com/events?closed=false&limit=20&order=volume&ascending=false");
      if (!response.ok) {
        throw new Error("Failed to fetch from Polymarket");
      }
      const data = await response.json();
      
      // Format the market data
      const markets = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        image: event.image,
        volume: event.volume || 0,
        liquidity: event.liquidity || 0,
        endDate: event.endDate,
        outcomes: event.markets?.[0]?.outcomes || ["Yes", "No"],
        outcomePrices: event.markets?.[0]?.outcomePrices 
          ? JSON.parse(event.markets[0].outcomePrices) 
          : [0.5, 0.5],
        category: event.tags?.[0]?.label || "General",
      })) || [];
      
      res.json({ markets });
    } catch (error) {
      console.error("Error fetching Polymarket data:", error);
      res.status(500).json({ message: "Failed to fetch prediction markets" });
    }
  });

  // GET /api/news - fetch crypto news from CryptoCompare
  app.get("/api/news", async (_req, res) => {
    try {
      const response = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest");
      if (!response.ok) {
        throw new Error("Failed to fetch news from CryptoCompare");
      }
      const data = await response.json();
      
      // Format the news data
      const news = data.Data?.slice(0, 20).map((item: any) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        source: item.source_info?.name || item.source,
        url: item.url,
        imageUrl: item.imageurl,
        publishedAt: item.published_on,
        categories: item.categories,
        tags: item.tags?.split("|").filter(Boolean) || [],
      })) || [];
      
      res.json({ news });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // GET /api/signals - with stats, role-based filtering, and live prices
  app.get("/api/signals", async (req, res) => {
    try {
      const { tier, role } = req.query;
      const allSignals = await storage.getAllSignals();
      
      // Filter by tier if provided
      const filtered = tier 
        ? allSignals.filter(s => s.tier === tier)
        : allSignals;
      
      // Calculate stats
      const totalTrades = allSignals.length;
      const closedSignals = allSignals.filter(s => s.status === "HIT" || s.status === "SL" || s.status === "STOPPED");
      const closedTrades = closedSignals.length;
      const hitSignals = allSignals.filter(s => s.status === "HIT");
      const slSignals = allSignals.filter(s => s.status === "SL" || s.status === "STOPPED");
      
      const winRate = closedTrades > 0 ? (hitSignals.length / closedTrades) * 100 : 0;
      
      // Calculate profit percentages - use stored value or calculate from prices
      const totalProfitPercent = hitSignals.reduce((sum, s) => {
        if (s.profitPercent && parseFloat(s.profitPercent) > 0) {
          return sum + parseFloat(s.profitPercent);
        }
        // Calculate from entry and take profit if not stored
        const entry = parseFloat(s.entry || s.entryPrice || "0");
        const takeProfits = (s.takeProfits || "").split(",").map((tp: string) => parseFloat(tp.trim())).filter((tp: number) => !isNaN(tp));
        const takeProfit = takeProfits[0] || 0;
        if (entry > 0 && takeProfit > 0) {
          const isLong = s.direction === "LONG";
          const profit = isLong 
            ? ((takeProfit - entry) / entry) * 100
            : ((entry - takeProfit) / entry) * 100;
          return sum + Math.abs(profit);
        }
        return sum;
      }, 0);
      
      // Calculate loss percentages - use stored value or calculate from prices
      const totalLossPercent = slSignals.reduce((sum, s) => {
        if (s.lossPercent && parseFloat(s.lossPercent) > 0) {
          return sum + parseFloat(s.lossPercent);
        }
        // Calculate from entry and stop loss if not stored
        const entry = parseFloat(s.entry || s.entryPrice || "0");
        const stopLoss = parseFloat(s.stopLoss || s.stopLossPrice || "0");
        if (entry > 0 && stopLoss > 0) {
          const isLong = s.direction === "LONG";
          const loss = isLong 
            ? ((entry - stopLoss) / entry) * 100
            : ((stopLoss - entry) / entry) * 100;
          return sum + Math.abs(loss);
        }
        return sum;
      }, 0);
      
      const stats = {
        totalTrades,
        closedTrades,
        winRate: Math.round(winRate * 10) / 10,
        totalProfitPercent: Math.round(totalProfitPercent * 10) / 10,
        totalLossPercent: Math.round(totalLossPercent * 10) / 10,
      };
      
      // Fetch live prices for all signal pairs
      const livePrices: Record<string, number> = {};
      try {
        const markets = await fetchMarkets();
        for (const signal of filtered) {
          const coinId = signal.coinId || getCoinIdFromPair(signal.pair);
          if (coinId) {
            const coin = markets.find(m => m.id === coinId);
            if (coin) {
              livePrices[signal.pair] = coin.current_price;
            }
          }
        }
      } catch (priceError) {
        // Fallback: try to fetch individual prices for pairs without cached prices
        console.log("Markets fetch failed, trying individual price lookups");
        for (const signal of filtered) {
          if (!livePrices[signal.pair]) {
            const coinId = signal.coinId || getCoinIdFromPair(signal.pair);
            if (coinId) {
              try {
                const price = await fetchCoinPrice(coinId);
                if (price !== null) {
                  livePrices[signal.pair] = price;
                }
              } catch (e) {
                // Individual price fetch failed, continue
              }
            }
          }
        }
      }
      
      res.json({ signals: filtered, stats, livePrices });
    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  // POST /api/signals - Admin only (moved to admin routes below)

  // PATCH /api/signals/:id/status
  app.patch("/api/signals/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["ACTIVE", "HIT", "SL"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const signal = await storage.updateSignalStatus(parseInt(id), status);
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      res.json(signal);
    } catch (error) {
      console.error("Error updating signal:", error);
      res.status(500).json({ message: "Failed to update signal" });
    }
  });

  // DELETE /api/signals/:id
  app.delete("/api/signals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSignal(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting signal:", error);
      res.status(500).json({ message: "Failed to delete signal" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", (await import("express")).default.static(uploadDir));

  // ============ PAYMENT SUBMISSION ROUTES ============
  
  // POST /api/payments/submit - Submit payment screenshot
  app.post("/api/payments/submit", isAuthenticated, upload.single("screenshot"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Screenshot file is required" });
      }
      
      const user = req.user;
      const referenceNumber = generateReferenceNumber();
      const screenshotUrl = `/uploads/${req.file.filename}`;
      
      const submission = await storage.createPaymentSubmission({
        userId: user.id,
        userEmail: user.email || null,
        userName: user.username || user.name || null,
        referenceNumber,
        screenshotUrl,
        status: "PENDING",
      });
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting payment:", error);
      res.status(500).json({ message: "Failed to submit payment" });
    }
  });

  // GET /api/payments/my-submissions - Get current user's submissions
  app.get("/api/payments/my-submissions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const submissions = await storage.getPaymentSubmissionsByUser(user.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // ============ ADMIN ROUTES ============
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cryptobit2024";

  // Admin authentication middleware - requires valid admin password in header
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const adminAuth = req.headers["x-admin-auth"];
      
      if (adminAuth !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Unauthorized: Admin access required" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  // POST /api/admin/login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });

  // GET /api/admin/stats
  app.get("/api/admin/stats", isAdmin, async (_req, res) => {
    try {
      const users = await userService.getAllUsers();
      const signals = await storage.getAllSignals();
      
      const stats = {
        totalUsers: users.length,
        proUsers: users.filter((u: { role: string }) => u.role === "PRO").length,
        freeUsers: users.filter((u: { role: string }) => u.role === "FREE").length,
        totalSignals: signals.length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // GET /api/admin/users
  app.get("/api/admin/users", isAdmin, async (_req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // POST /api/admin/users/role
  app.post("/api/admin/users/role", isAdmin, async (req, res) => {
    try {
      const { userId, role } = req.body;
      if (!["FREE", "PRO", "ADMIN"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await userService.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // GET /api/admin/payments - Get all payment submissions
  app.get("/api/admin/payments", isAdmin, async (_req, res) => {
    try {
      const submissions = await storage.getAllPaymentSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // POST /api/admin/payments/:id/approve - Approve payment and upgrade user
  app.post("/api/admin/payments/:id/approve", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      const submissions = await storage.getAllPaymentSubmissions();
      const submission = submissions.find(s => s.id === parseInt(id));
      
      if (!submission) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Update payment status
      await storage.updatePaymentSubmissionStatus(parseInt(id), "APPROVED", adminNotes);
      
      // Upgrade user to PRO
      await userService.updateUserRole(submission.userId, "PRO");
      
      res.json({ message: "Payment approved and user upgraded to PRO" });
    } catch (error) {
      console.error("Error approving payment:", error);
      res.status(500).json({ message: "Failed to approve payment" });
    }
  });

  // POST /api/admin/payments/:id/reject - Reject payment
  app.post("/api/admin/payments/:id/reject", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      await storage.updatePaymentSubmissionStatus(parseInt(id), "REJECTED", adminNotes);
      
      res.json({ message: "Payment rejected" });
    } catch (error) {
      console.error("Error rejecting payment:", error);
      res.status(500).json({ message: "Failed to reject payment" });
    }
  });

  // GET /api/admin/signals
  app.get("/api/admin/signals", isAdmin, async (_req, res) => {
    try {
      const signals = await storage.getAllSignals();
      res.json(signals);
    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  // POST /api/admin/signals - Create new signal (admin only)
  app.post("/api/admin/signals", isAdmin, async (req, res) => {
    try {
      const parsed = insertSignalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid signal data", errors: parsed.error.errors });
      }
      const signal = await storage.createSignal(parsed.data);
      res.status(201).json(signal);
    } catch (error) {
      console.error("Error creating signal:", error);
      res.status(500).json({ message: "Failed to create signal" });
    }
  });

  // DELETE /api/admin/signals/:id - Delete signal (admin only)
  app.delete("/api/admin/signals/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSignal(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting signal:", error);
      res.status(500).json({ message: "Failed to delete signal" });
    }
  });

  // POST /api/admin/signal - Create signal with x-admin-key authentication
  const ADMIN_KEY = process.env.ADMIN_KEY || "admin-secret-key";
  
  app.post("/api/admin/signal", async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"];
      
      if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ message: "Unauthorized: Invalid admin key" });
      }
      
      const { pair, direction, entryPrice, stopLoss, takeProfit, leverage, visibility } = req.body;
      
      if (!pair || !direction || !entryPrice || !stopLoss || !takeProfit) {
        return res.status(400).json({ message: "Missing required fields: pair, direction, entryPrice, stopLoss, takeProfit" });
      }
      
      const coinId = getCoinIdFromPair(pair);
      
      const signalData = {
        pair: pair.toUpperCase(),
        coinId,
        direction: direction.toUpperCase(),
        entry: entryPrice.toString(),
        stopLoss: stopLoss.toString(),
        takeProfits: takeProfit.toString(),
        leverage: leverage || "1x",
        entryPrice: entryPrice.toString(),
        stopLossPrice: stopLoss.toString(),
        takeProfitPrice: takeProfit.toString(),
        status: "ACTIVE",
        tier: visibility || "FREE",
        visibility: visibility || "FREE",
      };
      
      const signal = await storage.createSignal(signalData);
      res.status(201).json(signal);
    } catch (error) {
      console.error("Error creating signal:", error);
      res.status(500).json({ message: "Failed to create signal" });
    }
  });

  // Start the signal engine (runs every 30 seconds)
  startSignalEngine(30000);

  return httpServer;
}
