/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined,
  trailingSlash: false,
  images: {
    unoptimized: false
  },
  serverExternalPackages: ["pg", "drizzle-orm"],
  webpack: (config, { isServer }) => {
    // Добавляем алиасы для правильного импорта
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').join(__dirname, 'client/src'),
      '@shared': require('path').join(__dirname, 'shared'),
      '@/components': require('path').join(__dirname, 'client/src/components'),
      '@/contexts': require('path').join(__dirname, 'client/src/contexts'),
      '@/hooks': require('path').join(__dirname, 'client/src/hooks'),
      '@/lib': require('path').join(__dirname, 'client/src/lib'),
      '@/pages': require('path').join(__dirname, 'client/src/pages'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  }
  // Убираем все экспериментальные настройки, которые могут вызывать ошибки
};

export default nextConfig;