import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";
import pkg from "../package.json"; // Импортируем package.json

async function buildAll() {
  // Очистка предыдущих сборок
  await rm("dist", { recursive: true, force: true }).catch(() => {});
  await rm("api", { recursive: true, force: true }).catch(() => {});

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "api/index.cjs",
    // Автоматически исключаем ВСЕ зависимости из бандла
    external: Object.keys(pkg.dependencies || {}), 
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
