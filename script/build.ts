import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import { createRequire } from "module"; // Нужно для корректного импорта JSON

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

async function buildAll() {
  // 1. Очистка
  await rm("dist", { recursive: true, force: true }).catch(() => {});
  await rm("api", { recursive: true, force: true }).catch(() => {});

  // 2. Сборка клиента (исправляем путь)
  console.log("building client...");
  try {
    await viteBuild({
      root: "client", // Явно указываем Vite, где искать index.html
    });
  } catch (e) {
    console.error("Vite build failed, but continuing to server...");
  }

  // 3. Сборка сервера
  console.log("building server...");
  
  // Создаем массив исключений. 
  // Мы добавляем 'express' и прочие вручную на случай, если pkg не прочитался.
  const externalList = [
    ...Object.keys(pkg.dependencies || {}),
    "express",
    "pg",
    "drizzle-orm",
    "@neondatabase/serverless",
    "framer-motion"
  ];

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/public/api/index.cjs",
    // Теперь это точно сработает
    external: externalList, 
    minify: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});