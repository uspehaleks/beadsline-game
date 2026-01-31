// next.config.bundle-analyze.js
import nextConfig from './next.config.js';
import { withBundleAnalyzer } from '@next/bundle-analyzer';

const bundleAnalyzerConfig = {
  webpack: (config, { isServer }) => {
    // Добавляем конфигурацию webpack
    return config;
  },
};

export default withBundleAnalyzer({
  experimental: {
    ...nextConfig.experimental,
  },
  ...bundleAnalyzerConfig,
  env: nextConfig.env,
  images: nextConfig.images,
  async redirects() {
    return nextConfig.redirects ? await nextConfig.redirects() : [];
  },
  async headers() {
    return nextConfig.headers ? await nextConfig.headers() : [];
  },
});