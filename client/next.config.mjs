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
  // Ensure Next.js listens on the port provided by Heroku
  serverOptions: {
    port: parseInt(process.env.PORT, 10) || 3000
  }
};

export default nextConfig; 