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

    axios.get.mockResolvedValueOnce({ data: { user: { id: 1 } } });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
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

  it('shows content when has guest token', () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      getAccessTokenSilently: jest.fn()
    });

    localStorage.setItem('token', 'test-token');
    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
}); 