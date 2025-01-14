'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Auth0Provider } from '@auth0/auth0-react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth0Provider
          domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
          clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          }}
        >
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
} 