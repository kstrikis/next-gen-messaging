/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` : 'http://localhost:3001/api/:path*'
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  },
};

export default nextConfig; 