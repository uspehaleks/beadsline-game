import type { Express } from "express";

export async function registerDebugRoutes(app: Express) {
  // Debug logs endpoint - просто логгирует полученные данные
  app.post("/debug-logs", async (req, res) => {
    try {
      console.log("Debug log received:", req.body);
      res.status(200).json({ success: true, message: "Debug log received" });
    } catch (error) {
      console.error("Debug log error:", error);
      res.status(500).json({ error: "Failed to process debug log" });
    }
  });
}