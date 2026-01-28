/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Убираем статический экспорт для Vercel
  trailingSlash: false,
  images: {
    unoptimized: false // Включаем оптимизацию изображений для серверного рендеринга
  },
  experimental: {
    serverComponentsExternalPackages: ["pg", "drizzle-orm"]
  }
};

export default nextConfig;