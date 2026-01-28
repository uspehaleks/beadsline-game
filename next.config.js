/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined,
  trailingSlash: false,
  images: {
    unoptimized: false
  },
  serverExternalPackages: ["pg", "drizzle-orm"]
  // Убираем кастомную webpack конфигурацию, чтобы упростить сборку
};

export default nextConfig;