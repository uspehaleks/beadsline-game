import pkg from '@next/bundle-analyzer';
const { withBundleAnalyzer } = pkg;

const nextConfig = {
  // Убираем output: 'export' - это ломает динамические API-маршруты на Vercel
  trailingSlash: false, // Убираем проблему с маршрутами
  images: {
    unoptimized: false,
    formats: ['image/webp'], // Поддержка WebP формата
    minimumCacheTTL: 60, // Минимальное время кеширования в секундах
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Разрешаем все домены для удаленных изображений
      },
    ],
  },
  serverExternalPackages: ["pg", "drizzle-orm"],
  // Передаем переменные окружения в runtime
  env: {
    DIRECT_URL: process.env.DIRECT_URL,
  },
  // Включаем bundle analyzer для анализа размера бандла
  // Убираем кастомную webpack конфигурацию, чтобы упростить сборку
};

// Условно включаем bundle analyzer при необходимости
const config = process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer({
      enabled: true,
    })(nextConfig)
  : nextConfig;

export default config;