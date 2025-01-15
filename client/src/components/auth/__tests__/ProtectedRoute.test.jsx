import { render, screen, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import ProtectedRoute from '../ProtectedRoute';
import { useToast } from '@/hooks/use-toast';

// Mock the modules
jest.mock('@auth0/auth0-react');
jest.mock('axios');
jest.mock('@/hooks/use-toast');

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn()
  })
}));

describe('ProtectedRoute', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    axios.get.mockClear();
    useToast.mockReturnValue({ toast: mockToast });
  });

  it('shows loading state when auth is loading', () => {
    useAuth0.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      getAccessTokenSilently: jest.fn()
    });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to home when not authenticated and no token', () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      getAccessTokenSilently: jest.fn()
    });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows content when authenticated with Auth0 and token exchange succeeds', async () => {
    const mockGetToken = jest.fn().mockResolvedValue('test-token');
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      getAccessTokenSilently: mockGetToken
    });

    // Mock successful token exchange
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/auth0/callback')) {
        return Promise.resolve({ data: { token: 'exchanged-token' } });
      }
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { user: { id: 1 } } });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const WrappedComponent = () => (
      <div data-testid="protected-content">Protected Page Content</div>
    );
    render(
      <ProtectedRoute>
        <WrappedComponent />
      </ProtectedRoute>
    );

    // First we should see the loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for token exchange and storage
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('exchanged-token');
    });

    // Then we should see the protected content
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(mockGetToken).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/auth0/callback'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' }
      })
    );
  });

  it('redirects to home and shows error toast when token exchange fails', async () => {
    const mockGetToken = jest.fn().mockResolvedValue('test-token');
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      getAccessTokenSilently: mockGetToken
    });

    const error = new Error('Token exchange failed');
    axios.get.mockRejectedValueOnce(error);

    render(<ProtectedRoute>Test Content</ProtectedRoute>);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Authentication Error',
      variant: 'destructive'
    }));
  });

  it('shows content when has valid guest token', async () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      getAccessTokenSilently: jest.fn()
    });

    // Mock successful token verification
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { user: { id: 1 } } });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    localStorage.setItem('token', 'test-token');
    
    const WrappedComponent = () => (
      <div data-testid="protected-content">Protected Page Content</div>
    );
    render(
      <ProtectedRoute>
        <WrappedComponent />
      </ProtectedRoute>
    );

    // First we should see the loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Then we should see the protected content after token verification
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/me'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' }
      })
    );
  });
}); 