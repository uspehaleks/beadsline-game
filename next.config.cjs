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
  // Включаем bundle analyzer для анализа размера бандла
  experimental: {
    instrumentationHook: true,
  },
  // Убираем кастомную webpack конфигурацию, чтобы упростить сборку
};

// Условно включаем bundle analyzer при необходимости
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}