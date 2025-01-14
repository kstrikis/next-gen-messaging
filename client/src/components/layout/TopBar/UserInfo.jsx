'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import logger from '@/lib/logger';

export default function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
      } catch (error) {
        logger.error('Failed to fetch user info:', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Logged in as</span>
      <span className="text-sm font-medium">{user.username}</span>
    </div>
  );
} 