'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Simple logger for client side
const logger = {
  info: (...args) => console.log('[Auth Callback]', ...args),
  error: (...args) => console.error('[Auth Callback Error]', ...args),
  debug: (...args) => console.debug('[Auth Callback Debug]', ...args),
  warn: (...args) => console.warn('[Auth Callback Warning]', ...args)
};

export default function CallbackPage() {
  const { isLoading, isAuthenticated, error, user, getAccessTokenSilently } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        logger.info('Starting backend sync...', { user });
        const token = await getAccessTokenSilently();
        
        // Get user info from Auth0
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/auth0/callback`,
          {
            params: {
              ...user,
              access_token: token
            }
          }
        );

        logger.info('Backend response:', { 
          status: response.status,
          data: response.data 
        });

        if (response.status !== 200) {
          throw new Error(`Failed to sync with backend: ${response.data?.error || 'Unknown error'}`);
        }

        // Store the JWT token
        localStorage.setItem('token', response.data.token);
        
        // Check if general channel exists before redirecting
        try {
          await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/general`, {
            headers: { Authorization: `Bearer ${response.data.token}` }
          });
          logger.info('General channel found, redirecting...');
          router.push('/channel/general');
        } catch (channelError) {
          logger.warn('General channel not found, redirecting to home:', { error: channelError.message });
          router.push('/');
        }
      } catch (error) {
        logger.error('Sync process failed', { 
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        router.push('/');
      }
    };

    if (!isLoading) {
      logger.info('Auth state ready', { isAuthenticated, hasUser: !!user, hasError: !!error });
      if (error) {
        logger.error('Auth0 error', { 
          message: error.message, 
          stack: error.stack,
          name: error.name
        });
        router.push('/');
      } else if (isAuthenticated && user) {
        syncWithBackend();
      } else {
        logger.info('User not authenticated, redirecting to home');
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, router, error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Setting up your account...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {isLoading ? 'Checking authentication...' : 
           isAuthenticated ? 'Syncing with server...' : 
           'Redirecting...'}
        </p>
      </div>
    </div>
  );
} 