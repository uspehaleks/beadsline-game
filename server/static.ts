import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // В продакшене сервер запускается из корня проекта, поэтому путь к public должен быть относительно корня
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    // Don't redirect API calls to index.html
    if (req.path.startsWith('/api/')) {
      res.status(404).send('API endpoint not found');
      return;
    }

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
