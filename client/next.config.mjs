import logger from './src/lib/logger.js';

/** @type {import('next').NextConfig} */

const nextConfig = {
  rewrites: async () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    logger.info('[Next.js Config] Initializing rewrites:', {
      backendUrl,
      env: process.env.NODE_ENV,
      time: new Date().toISOString()
    });
    return {
      beforeFiles: [],
      afterFiles: [
        // Proxy Socket.IO requests with explicit transport matching
        {
          source: '/socket.io/:path*',
          destination: `${backendUrl}/socket.io/:path*`,
          has: [
            {
              type: 'query',
              key: 'transport',
              value: '(?:polling|websocket)'
            }
          ]
        },
        // Fallback Socket.IO proxy for non-transport requests
        {
          source: '/socket.io/:path*',
          destination: `${backendUrl}/socket.io/:path*`
        },
        // Proxy API requests
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        }
      ]
    };
  },
  // Required for WebSocket proxy to work properly
  webpack: (config, { dev, isServer }) => {
    logger.info('[Next.js Config] Webpack configuration:', {
      isServer,
      isDev: dev,
      time: new Date().toISOString()
    });

    // Add WebSocket externals
    config.externals.push({
      bufferutil: 'bufferutil',
      'utf-8-validate': 'utf-8-validate',
      'supports-color': 'supports-color',
    });

    // Log middleware and server runtime configs
    if (isServer) {
      logger.info('[Next.js Config] Server runtime config:', {
        middleware: config.middleware,
        serverComponents: config.experimental?.serverComponents,
        time: new Date().toISOString()
      });
    }

    return config;
  },
  // Ensure WebSocket connections aren't handled as pages
  async headers() {
    logger.info('[Next.js Config] Setting up headers');
    return [
      {
        source: '/socket.io/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Accept, Connection, Upgrade, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions' },
          { key: 'Access-Control-Expose-Headers', value: 'Content-Type, Authorization, Accept, Connection, Upgrade, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions' }
        ],
      },
    ];
  }
};

export default nextConfig; 