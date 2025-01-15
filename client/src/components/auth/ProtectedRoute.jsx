'use client';

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading: isAuth0Loading, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const { toast } = useToast();
  const [isTokenExchanged, setIsTokenExchanged] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // If authenticated with Auth0, exchange token
        if (isAuthenticated) {
          logger.info('Starting token exchange...');
          const token = await getAccessTokenSilently();
          
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/auth0/callback`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          logger.info('Token exchange successful');
          localStorage.setItem('token', response.data.token);
          setIsTokenExchanged(true);
          setIsVerifyingAuth(false);
          return;
        }

        // Check for token from guest login
        const token = localStorage.getItem('token');
        if (!token) {
          logger.info('No authentication token found, redirecting to login');
          router.push('/');
          return;
        }

        // Verify the token is valid by making a test request
        try {
          await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          logger.info('Token verification successful');
          setIsVerifyingAuth(false);
        } catch (error) {
          logger.error('Token verification failed:', error);
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (error) {
        logger.error('Authentication verification error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to verify authentication. Please try logging in again.',
          variant: 'destructive'
        });
        router.push('/');
      }
    };

    if (!isAuth0Loading) {
      verifyAuthentication();
    }
  }, [isAuthenticated, isAuth0Loading, router, getAccessTokenSilently, toast]);

  // Show loading state while verifying authentication
  if (isAuth0Loading || isVerifyingAuth || (isAuthenticated && !isTokenExchanged)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          role="status"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        >
          <span className="sr-only">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  return children;
} 