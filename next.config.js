/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Убираем статический экспорт для Vercel
  trailingSlash: false,
  images: {
    unoptimized: false // Включаем оптимизацию изображений для серверного рендеринга
  },
  serverExternalPackages: ["pg", "drizzle-orm"], // Обновленный параметр
  // Явно отключаем Turbopack и используем Webpack
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
      // Конфигурация для клиентской сборки
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Указываем, где искать pages
  // Но для этого нужно использовать другую стратегию
};

// Экспортируем конфигурацию
export default nextConfig;