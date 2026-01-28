/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Используем статическую экспортируемую версию
  trailingSlash: true,
  images: {
    unoptimized: true // Отключаем оптимизацию изображений для статической сборки
  },
  experimental: {
    serverComponentsExternalPackages: ["pg", "drizzle-orm"]
  }
};

export default nextConfig;