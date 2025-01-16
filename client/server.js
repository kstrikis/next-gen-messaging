import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from './src/lib/logger.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Handle Socket.IO requests
      if (pathname?.startsWith('/socket.io')) {
        const proxy = createProxyMiddleware({
          target: backendUrl,
          changeOrigin: true,
          ws: true,
          logLevel: 'debug'
        });
        return proxy(req, res);
      }

      // Handle Next.js requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Handle WebSocket upgrade
  const wsProxy = createProxyMiddleware({
    target: backendUrl,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  });
  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/socket.io')) {
      wsProxy.upgrade(req, socket, head);
    }
  });

  server.listen(port, () => {
    logger.info(`> Ready on http://${hostname}:${port}`);
  });
}); 