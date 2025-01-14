'use client';

import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    // Check for token from guest login
    const token = localStorage.getItem('token');
    
    if (!isLoading && !isAuthenticated && !token) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          role="status"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return children;
} 