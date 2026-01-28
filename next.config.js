/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Убираем статический экспорт для Vercel
  trailingSlash: false,
  images: {
    unoptimized: false // Включаем оптимизацию изображений для серверного рендеринга
  },
  experimental: {
    serverComponentsExternalPackages: ["pg", "drizzle-orm"]
  },
  // Указываем, что исходники находятся в директории client/src
  // Но для Next.js нужно переместить App.tsx и pages в корень
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Конфигурация для клиентской сборки
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  }
};

export default nextConfig;