// server/routes/withdrawal.ts
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage.js";

// Middleware для проверки аутентификации
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export function registerWithdrawalRoutes(app: Express) {
  // Get withdrawal config
  app.get("/api/withdrawal/config", async (req, res) => {
    try {
      const config = await storage.getWithdrawalConfig();
      res.json(config);
    } catch (error) {
      console.error("Get withdrawal config error:", error);
      res.status(500).json({ error: "Failed to get withdrawal config" });
    }
  });

  // Create withdrawal request
  app.post("/api/withdrawal/request", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      const { cryptoType, network, amount, walletAddress } = req.body;

      const withdrawalSchema = z.object({
        cryptoType: z.enum(['btc', 'eth', 'usdt']),
        network: z.string().optional(), // Optional for BTC/ETH, required for USDT
        amount: z.number().positive(),
        walletAddress: z.string().min(1)
      });

      const validatedData = withdrawalSchema.parse({
        cryptoType,
        network: cryptoType === 'usdt' ? network : cryptoType,
        amount: Number(amount),
        walletAddress
      });

      const { cryptoType: validatedCryptoType, network: validatedNetwork, amount: withdrawAmount, walletAddress: validatedWalletAddress } = validatedData;

      // Validate crypto type and network
      if (validatedCryptoType === 'usdt' && !validatedNetwork) {
        return res.status(400).json({ error: "Network is required for USDT" });
      }

      if (withdrawAmount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Limit precision to prevent floating point exploitation
      const MAX_DECIMALS = validatedCryptoType === 'usdt' ? 2 : 8;
      const multiplier = Math.pow(10, MAX_DECIMALS);
      const cleanAmount = Math.floor(withdrawAmount * multiplier) / multiplier;

      if (cleanAmount <= 0) {
        return res.status(400).json({ error: "Amount too small" });
      }

      // Check user balance (fresh read)
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let userBalance = 0;
      if (validatedCryptoType === 'btc') userBalance = user.btcBalance;
      else if (validatedCryptoType === 'eth') userBalance = user.ethBalance;
      else if (validatedCryptoType === 'usdt') userBalance = user.usdtBalance;

      // Get config to check minimum and fee
      const config = await storage.getWithdrawalConfig();
      let minAmount = 0;
      let networkFee = 0;
      let enabled = false;

      if (validatedCryptoType === 'btc') {
        minAmount = config.btc.minAmount;
        networkFee = config.btc.networkFee;
        enabled = config.btc.enabled;
      } else if (validatedCryptoType === 'eth') {
        minAmount = config.eth.minAmount;
        networkFee = config.eth.networkFee;
        enabled = config.eth.enabled;
      } else if (validatedCryptoType === 'usdt') {
        const networkConfig = config.usdt[validatedNetwork as keyof typeof config.usdt];
        if (networkConfig) {
          minAmount = networkConfig.minAmount;
          networkFee = networkConfig.networkFee;
          enabled = networkConfig.enabled;
        }
      }

      if (!enabled) {
        return res.status(400).json({ error: "Withdrawal temporarily unavailable" });
      }

      if (cleanAmount < minAmount) {
        return res.status(400).json({ error: `Minimum withdrawal amount: ${minAmount} ${validatedCryptoType.toUpperCase()}` });
      }

      if (userBalance < cleanAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      // Create withdrawal request
      const withdrawal = await storage.createWithdrawalRequest({
        userId,
        cryptoType: validatedCryptoType,
        network: validatedCryptoType === 'usdt' ? validatedNetwork : validatedCryptoType,
        amount: String(cleanAmount),
        walletAddress: validatedWalletAddress.trim(),
        networkFee: String(networkFee),
      });

      // Deduct from user balance (use cleanAmount for consistency)
      const newBalance = userBalance - cleanAmount;
      const balanceUpdate: any = {};
      if (validatedCryptoType === 'btc') balanceUpdate.btcBalance = Math.max(0, newBalance);
      else if (validatedCryptoType === 'eth') balanceUpdate.ethBalance = Math.max(0, newBalance);
      else if (validatedCryptoType === 'usdt') balanceUpdate.usdtBalance = Math.max(0, newBalance);

      await storage.updateUser(userId, balanceUpdate);

      res.json({ success: true, withdrawal });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create withdrawal request error:", error);
      res.status(500).json({ error: "Failed to create withdrawal request" });
    }
  });

  // Get user's withdrawal requests
  app.get("/api/withdrawal/my", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const withdrawals = await storage.getUserWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Get user withdrawals error:", error);
      res.status(500).json({ error: "Failed to get withdrawals" });
    }
  });
}