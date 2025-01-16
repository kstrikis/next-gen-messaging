import { NextResponse } from 'next/server';
import logger from './lib/logger.js';

// VERY OBVIOUS LOGGING TO CHECK IF MIDDLEWARE IS RUNNING
logger.info('\n🚨 MIDDLEWARE FILE LOADED 🚨');

export function middleware(request) {
  // VERY OBVIOUS LOGGING FOR EACH REQUEST
  logger.info('\n🔥 MIDDLEWARE EXECUTED 🔥', {
    time: new Date().toISOString(),
    url: request.url
  });

  // Log all requests for debugging
  const headers = Object.fromEntries(request.headers);
  const query = Object.fromEntries(request.nextUrl.searchParams);
  
  // Enhanced WebSocket detection
  const hasUpgradeHeader = headers['upgrade']?.toLowerCase() === 'websocket';
  const hasConnectionUpgrade = headers['connection']?.toLowerCase().includes('upgrade');
  const hasWebSocketKey = !!headers['sec-websocket-key'];
  const hasWebSocketVersion = !!headers['sec-websocket-version'];
  
  const isWebSocket = hasUpgradeHeader && hasConnectionUpgrade && hasWebSocketKey && hasWebSocketVersion;
  const isSocketIO = request.nextUrl.pathname.startsWith('/socket.io');
  const isPolling = isSocketIO && query.transport === 'polling';

  // Log request details
  logger.info('\n[Next.js Middleware] Request:', {
    url: request.url,
    pathname: request.nextUrl.pathname,
    method: request.method,
    webSocketChecks: {
      hasUpgradeHeader,
      hasConnectionUpgrade,
      hasWebSocketKey,
      hasWebSocketVersion,
      isWebSocket
    },
    isSocketIO,
    isPolling,
    transport: query.transport,
    headers: {
      ...headers,
      connection: headers.connection,
      upgrade: headers.upgrade,
      'sec-websocket-key': headers['sec-websocket-key'],
      'sec-websocket-version': headers['sec-websocket-version'],
      'sec-websocket-extensions': headers['sec-websocket-extensions']
    },
    query,
    time: new Date().toISOString()
  });

  // Special handling for Socket.IO traffic
  if (isSocketIO) {
    logger.info('🔌 SOCKET.IO REQUEST DETECTED 🔌');
    const response = NextResponse.next();
    
    // For WebSocket upgrade requests, ensure proper headers
    if (isWebSocket) {
      logger.info('🌐 WEBSOCKET UPGRADE REQUEST DETECTED 🌐', {
        key: headers['sec-websocket-key'],
        version: headers['sec-websocket-version'],
        extensions: headers['sec-websocket-extensions'],
        time: new Date().toISOString(),
        headers: {
          connection: headers.connection,
          upgrade: headers.upgrade
        }
      });

      // Set WebSocket upgrade headers
      response.headers.set('Connection', 'Upgrade');
      response.headers.set('Upgrade', 'websocket');
      
      // Forward WebSocket headers
      if (headers['sec-websocket-key']) {
        response.headers.set('Sec-WebSocket-Key', headers['sec-websocket-key']);
      }
      if (headers['sec-websocket-version']) {
        response.headers.set('Sec-WebSocket-Version', headers['sec-websocket-version']);
      }
      if (headers['sec-websocket-extensions']) {
        response.headers.set('Sec-WebSocket-Extensions', headers['sec-websocket-extensions']);
      }

      // Log response headers
      logger.info('🔄 WebSocket response headers:', {
        connection: response.headers.get('Connection'),
        upgrade: response.headers.get('Upgrade'),
        key: response.headers.get('Sec-WebSocket-Key'),
        version: response.headers.get('Sec-WebSocket-Version'),
        extensions: response.headers.get('Sec-WebSocket-Extensions'),
        time: new Date().toISOString()
      });
    }

    return response;
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/socket.io/:path*',
    '/api/:path*'
  ]
}; 