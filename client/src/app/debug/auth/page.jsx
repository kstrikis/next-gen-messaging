'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

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

  const [loginError, setLoginError] = useState(null);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [tokenTestResult, setTokenTestResult] = useState(null);

  useEffect(() => {
    const testToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          setTokenTestResult({ success: true, token: token.substring(0, 20) + '...' });
        } catch (err) {
          console.error('Token test error:', err);
          setTokenTestResult({ success: false, error: err.message });
        }
      } else {
        setTokenTestResult({ success: false, message: 'Not authenticated' });
      }
    };
    testToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const handleLogin = async () => {
    setLoginAttempted(true);
    setLoginError(null);
    try {
      console.log('Attempting login with Auth0...');
      await loginWithRedirect({
        appState: { returnTo: '/debug/auth' },
        cacheLocation: 'localstorage',
        response_type: 'code',
      });
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin + '/debug/auth' });
  };

  if (isLoading) {
    return <div>Loading Auth0 configuration...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Auth0 Debug Information</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Configuration</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
            clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
            redirectUri: typeof window !== 'undefined' ? window.location.origin + '/callback' : 'unknown',
            apiUrl: process.env.NEXT_PUBLIC_API_URL,
          }, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth0 Context State</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({
            isLoading,
            isAuthenticated,
            error: error?.message,
            user,
          }, null, 2)}
        </pre>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Token Test</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(tokenTestResult, null, 2)}
        </pre>
      </section>

      {loginAttempted && loginError && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Login Error</h2>
          <pre className="bg-red-100 p-4 rounded">
            {loginError}
          </pre>
        </section>
      )}

      <div className="flex gap-4">
        {!isAuthenticated ? (
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
} 