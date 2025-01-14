import { render, screen } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import ProtectedRoute from '../ProtectedRoute';

// Mock the modules
jest.mock('@auth0/auth0-react');

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
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('shows loading state when auth is loading', () => {
    useAuth0.mockReturnValue({
      isLoading: true,
      isAuthenticated: false
    });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to home when not authenticated and no token', () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows content when authenticated with Auth0', () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: true
    });

    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows content when has guest token', () => {
    useAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false
    });

    localStorage.setItem('token', 'test-token');
    render(<ProtectedRoute>Test Content</ProtectedRoute>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
}); 