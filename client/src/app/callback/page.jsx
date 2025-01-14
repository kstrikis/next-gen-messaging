'use client';

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

export default function CallbackPage() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const { toast } = useToast();
  const [isTokenExchanged, setIsTokenExchanged] = useState(false);

  useEffect(() => {
    const exchangeToken = async () => {
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
          router.push('/channel/general');
        }
      } catch (error) {
        logger.error('Token exchange error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to authenticate with the server. Please try again.',
          variant: 'destructive'
        });
        router.push('/');
      }
    };

    // Check for token from guest login
    const token = localStorage.getItem('token');
    
    if (!isLoading) {
      if (isAuthenticated && !isTokenExchanged) {
        exchangeToken();
      } else if (!token) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router, getAccessTokenSilently, toast, isTokenExchanged]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div 
        role="status"
        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
} 