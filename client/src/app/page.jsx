'use client';

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function WelcomePage() {
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  const handleGuestAccess = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/guest`, {
        username: guestName.trim()
      });

      // Store token and redirect to app
      localStorage.setItem('token', response.data.token);
      window.location.href = '/channel/general';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create guest account');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    window.location.href = '/channel/general';
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full p-6 space-y-6 bg-card">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Welcome to ChatGenius</h1>
          <p className="text-muted-foreground">
            A modern messaging app with powerful AI features
          </p>
        </div>

        {/* Guest Access */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Try it out now</h2>
          <form onSubmit={handleGuestAccess} className="space-y-2">
            <Input
              type="text"
              placeholder="Enter a guest name (optional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Join as Guest
            </Button>
          </form>
        </div>

        {/* Auth0 Login */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => loginWithRedirect()}
          >
            Sign in with Auth0
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
} 