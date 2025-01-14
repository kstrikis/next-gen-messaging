'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const { logout, isAuthenticated } = useAuth0();
  const router = useRouter();

  const handleLogout = () => {
    if (isAuthenticated) {
      // Auth0 logout
      logout({ returnTo: window.location.origin });
    } else {
      // Guest logout
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="text-muted-foreground hover:text-foreground"
    >
      Sign Out
    </Button>
  );
} 