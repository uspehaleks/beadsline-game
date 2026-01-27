import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, copyFile } from "fs/promises";
import { createRequire } from "module";
import { copy } from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

async function buildAll() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  const publicDir = path.join(distDir, 'public');
  const vercelOutputDir = path.join(rootDir, '.vercel', 'output');
  const vercelStaticDir = path.join(vercelOutputDir, 'static');

  // 1. Очистка
  await rm(distDir, { recursive: true, force: true }).catch(() => {});
  await mkdir(publicDir, { recursive: true });

  // 2. Сборка клиента
  console.log("building client...");
  await viteBuild({
    root: path.join(rootDir, "client"),
    build: {
      outDir: publicDir, // Собираем фронтенд в dist/public
      emptyOutDir: true, // Vite очистит папку перед сборкой
    },
  });

  // 3. Сборка сервера
  console.log("building server...");
  const externalList = [
    ...Object.keys(pkg.dependencies || {}),
    "express",
    "pg",
    "drizzle-orm",
    "framer-motion"
  ];

  await esbuild({
    entryPoints: [path.join(rootDir, "server/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.join(distDir, "api/index.cjs"),
    external: externalList,
    minify: true,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    logLevel: "info",
  });

  // 4. Подготовка для Vercel (если мы в Vercel окружении)
  if (process.env.VERCEL) {
    // Создаем структуру для Vercel output
    await rm(vercelOutputDir, { recursive: true, force: true }).catch(() => {});
    await mkdir(vercelStaticDir, { recursive: true });

    // Копируем файлы из dist/public в .vercel/output/static
    const fs = await import('fs');
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
      const sourcePath = path.join(publicDir, file);
      const destPath = path.join(vercelStaticDir, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        await copy(sourcePath, destPath);
      } else {
        await copyFile(sourcePath, destPath);
      }
    }
  }

  // 5. Копирование дополнительных файлов сервера (если нужно)
  // Например, папки uploads
  const uploadsDir = path.join(rootDir, 'server', 'uploads');
  const destUploadsDir = path.join(distDir, 'uploads');
  await copy(uploadsDir, destUploadsDir, { recursive: true }).catch(err => console.log('No uploads folder to copy, skipping.'));
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});