'use client';

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import logger from '@/lib/logger';

export default function AuthDebugPage() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const [token, setToken] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        setToken(token);
        logger.info('Token acquired successfully');
      } catch (error) {
        setTokenError(error);
        logger.error('Failed to get token:', error);
      }
    };

    if (isAuthenticated) {
      logger.info('User is authenticated, getting token...');
      getToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleLogin = async () => {
    try {
      logger.info('Initiating login...');
      await loginWithRedirect();
    } catch (error) {
      logger.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      logger.info('Logging out...');
      await logout();
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth0 Debug Information</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Configuration</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(
            {
              domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
              clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
              audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
            },
            null,
            2
          )}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Auth0 Context State</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(
            {
              isLoading,
              isAuthenticated,
              hasError: !!error,
              hasUser: !!user,
              hasToken: !!token,
            },
            null,
            2
          )}
        </pre>
      </section>

      {error && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error Information</h2>
          <pre className="bg-red-50 p-4 rounded text-red-600">
            {JSON.stringify(error, null, 2)}
          </pre>
        </section>
      )}

      {user && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(user, null, 2)}</pre>
        </section>
      )}

      {token && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Token Test</h2>
          <pre className="bg-gray-100 p-4 rounded">{token}</pre>
        </section>
      )}

      {tokenError && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Token Error</h2>
          <pre className="bg-red-50 p-4 rounded text-red-600">
            {JSON.stringify(tokenError, null, 2)}
          </pre>
        </section>
      )}

      <div className="flex gap-4">
        <Button onClick={handleLogin} disabled={isAuthenticated}>
          Log In
        </Button>
        <Button onClick={handleLogout} disabled={!isAuthenticated} variant="destructive">
          Log Out
        </Button>
      </div>
    </div>
  );
} 