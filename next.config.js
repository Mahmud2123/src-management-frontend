/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001/api').replace(/\/$/, '');
    const uploadBase = apiBase.replace(/\/api$/, '');

    const rules = [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${uploadBase}/uploads/:path*`,
      },
    ];

    return {
      beforeFiles: rules,
    };
  },
};

export default nextConfig;
