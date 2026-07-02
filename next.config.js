/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return {
        beforeFiles: [
          {
            source: '/api/:path*',
            destination: 'http://127.0.0.1:3001/api/:path*',
          },
        ],
      };
    }
    return {};
  },
};

export default nextConfig;
