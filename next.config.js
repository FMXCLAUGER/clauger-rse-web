const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias.canvas = false;

    // CRITICAL: Disable eval() in production for CSP compliance
    if (!dev) {
      // Production: use hidden-source-map (no eval, good for error monitoring)
      config.devtool = 'hidden-source-map';
    }
    // Development: Next.js uses eval-source-map by default (fastest rebuilds)

    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
          },
        },
      }
    }

    return config;
  },
  compress: true,
  optimizeFonts: true,
  swcMinify: true,
}

module.exports = withBundleAnalyzer(nextConfig)
