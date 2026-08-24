/** @type {import('next').NextConfig} */
const allowedImageHosts = [
  process.env.NEXT_PUBLIC_CDN_HOST,
  'cdn.srcsazu.com',
  'assets.srcsazu.com',
  'srcsazu.com',
  'www.srcsazu.com',
].filter(Boolean);

const nextConfig = {
  images: {
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
      pathname: '/**',
    })),
    // Allow local internal URLs with query strings (used for backend proxy endpoints)
    // Next.js requires explicit localPatterns for relative/local image URLs that include query strings.
    // Use pathname-only patterns (Next validates only pathname for localPatterns).
    localPatterns: [
      // Allow the proxy endpoint and the user/attachment redirect endpoints
      { pathname: '/api/files/proxy' },
      { pathname: '/api/files/:path*' },
    ],
  },
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
