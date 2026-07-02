import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  allowedDevOrigins: ['127.0.0.1'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
=======
  /* config options here */
>>>>>>> 67da137888c1abf116aa640e6b5ae33acccf1be7
};

export default nextConfig;
