import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Определяем путь к папке public в зависимости от среды
  let distPath = path.resolve(__dirname, "..", "..", "dist", "public");

  // Проверяем, возможно, сборка находится в другой структуре (например, в Vercel)
  if (!fs.existsSync(distPath)) {
    // Попробуем найти папку public в других возможных местах
    const possiblePaths = [
      path.resolve(__dirname, "..", "dist", "public"), // server/../dist/public
      path.resolve(__dirname, "..", "..", "..", "dist", "public"), // server/../../dist/public
      path.resolve(process.cwd(), "dist", "public"), // текущая рабочая директория
      path.resolve(__dirname, "dist", "public"), // server/dist/public
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        distPath = possiblePath;
        break;
      }
    }
  }

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

  // fall through to index.html if the non-API request doesn't match any static file
  app.use("*", (req, res) => {
    // Only redirect non-API calls to index.html
    // API calls should be handled by Express routes and return 404 if not found elsewhere
    if (req.path.startsWith('/api/')) {
      // If we reach this point, it means the API route was not found in Express
      // Let Express handle the 404 normally
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    // For non-API routes, serve index.html for client-side routing
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
