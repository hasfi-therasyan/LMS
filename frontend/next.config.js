/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    // Add your Supabase project domain here
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '*.supabase.co',
    //   },
    // ],
  },
}

module.exports = nextConfig
