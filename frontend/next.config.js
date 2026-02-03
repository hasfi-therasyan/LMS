const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
  // Add headers for PDF viewing
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
  // Ensure TypeScript path aliases work
  webpack: (config) => {
    // Get the absolute path to the frontend directory
    const frontendDir = path.resolve(__dirname);
    const srcDir = path.resolve(frontendDir, 'src');
    
    // Resolve path aliases - must be absolute paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcDir,
    };
    
    return config;
  },
}

module.exports = nextConfig
