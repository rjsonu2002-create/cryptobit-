import { db } from "./db";
import { coins, signals, paymentSubmissions, portfolioHoldings, type Coin, type InsertCoin, type Signal, type InsertSignal, type PaymentSubmission, type InsertPaymentSubmission, type PortfolioHolding, type InsertPortfolioHolding } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface CloseSignalData {
  status: string;
  exitPrice: string;
  profitPercent: string | null;
  lossPercent: string | null;
  closedAt: Date;
}

export interface IStorage {
  getAllCoins(): Promise<Coin[]>;
  getCoinBySymbol(symbol: string): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  seedCoins(): Promise<void>;
  
  getAllSignals(): Promise<Signal[]>;
  getSignalById(id: number): Promise<Signal | undefined>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  updateSignalStatus(id: number, status: string): Promise<Signal | undefined>;
  closeSignal(id: number, data: CloseSignalData): Promise<Signal | undefined>;
  deleteSignal(id: number): Promise<void>;

  getAllPaymentSubmissions(): Promise<PaymentSubmission[]>;
  getPaymentSubmissionsByUser(userId: string): Promise<PaymentSubmission[]>;
  createPaymentSubmission(submission: InsertPaymentSubmission): Promise<PaymentSubmission>;
  updatePaymentSubmissionStatus(id: number, status: string, adminNotes?: string): Promise<PaymentSubmission | undefined>;

  getPortfolioByUser(userId: string): Promise<PortfolioHolding[]>;
  addPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, userId: string, quantity: string, buyPrice: string): Promise<PortfolioHolding | undefined>;
  deletePortfolioHolding(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllCoins(): Promise<Coin[]> {
    return await db.select().from(coins).orderBy(coins.id);
  }

  async getCoinBySymbol(symbol: string): Promise<Coin | undefined> {
    const [coin] = await db.select().from(coins).where(eq(coins.symbol, symbol.toUpperCase()));
    return coin;
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const [coin] = await db.insert(coins).values(insertCoin).returning();
    return coin;
  }

  async seedCoins(): Promise<void> {
    const existing = await this.getAllCoins();
    if (existing.length > 0) return;
  }

  async getAllSignals(): Promise<Signal[]> {
    return await db.select().from(signals).orderBy(desc(signals.createdAt));
  }

  async getSignalById(id: number): Promise<Signal | undefined> {
    const [signal] = await db.select().from(signals).where(eq(signals.id, id));
    return signal;
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const [signal] = await db.insert(signals).values(insertSignal).returning();
    return signal;
  }

  async updateSignalStatus(id: number, status: string): Promise<Signal | undefined> {
    const [signal] = await db.update(signals).set({ status }).where(eq(signals.id, id)).returning();
    return signal;
  }

  async closeSignal(id: number, data: CloseSignalData): Promise<Signal | undefined> {
    const [signal] = await db.update(signals)
      .set({
        status: data.status,
        exitPrice: data.exitPrice,
        profitPercent: data.profitPercent,
        lossPercent: data.lossPercent,
        closedAt: data.closedAt,
      })
      .where(eq(signals.id, id))
      .returning();
    return signal;
  }

  async deleteSignal(id: number): Promise<void> {
    await db.delete(signals).where(eq(signals.id, id));
  }

  async getAllPaymentSubmissions(): Promise<PaymentSubmission[]> {
    return await db.select().from(paymentSubmissions).orderBy(desc(paymentSubmissions.createdAt));
  }

  async getPaymentSubmissionsByUser(userId: string): Promise<PaymentSubmission[]> {
    return await db.select().from(paymentSubmissions).where(eq(paymentSubmissions.userId, userId)).orderBy(desc(paymentSubmissions.createdAt));
  }

  async createPaymentSubmission(submission: InsertPaymentSubmission): Promise<PaymentSubmission> {
    const [result] = await db.insert(paymentSubmissions).values(submission).returning();
    return result;
  }

  async updatePaymentSubmissionStatus(id: number, status: string, adminNotes?: string): Promise<PaymentSubmission | undefined> {
    const [result] = await db.update(paymentSubmissions)
      .set({ 
        status, 
        adminNotes,
        processedAt: status !== "PENDING" ? new Date() : null 
      })
      .where(eq(paymentSubmissions.id, id))
      .returning();
    return result;
  }

  async getPortfolioByUser(userId: string): Promise<PortfolioHolding[]> {
    return await db.select().from(portfolioHoldings).where(eq(portfolioHoldings.userId, userId)).orderBy(desc(portfolioHoldings.createdAt));
  }

  async addPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const [result] = await db.insert(portfolioHoldings).values(holding).returning();
    return result;
  }

  async updatePortfolioHolding(id: number, userId: string, quantity: string, buyPrice: string): Promise<PortfolioHolding | undefined> {
    const [result] = await db.update(portfolioHoldings)
      .set({ quantity, buyPrice, updatedAt: new Date() })
      .where(and(eq(portfolioHoldings.id, id), eq(portfolioHoldings.userId, userId)))
      .returning();
    return result;
  }

  async deletePortfolioHolding(id: number, userId: string): Promise<void> {
    await db.delete(portfolioHoldings).where(and(eq(portfolioHoldings.id, id), eq(portfolioHoldings.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
