module.exports = {
  // Ensure the public directory is used for static content
  staticPageGenerationTimeout: 60,
  // Add empty turbopack config for Next.js 16 compatibility
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
