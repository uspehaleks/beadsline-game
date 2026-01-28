/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убираем output: 'export' - это ломает динамические API-маршруты на Vercel
  trailingSlash: false, // Убираем проблему с маршрутами
  images: {
    unoptimized: false
  },
  serverExternalPackages: ["pg", "drizzle-orm"]
  // Убираем кастомную webpack конфигурацию, чтобы упростить сборку
};

export default nextConfig;