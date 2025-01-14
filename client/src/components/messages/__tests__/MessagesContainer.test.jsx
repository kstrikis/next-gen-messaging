import { render, screen } from '@testing-library/react';
import axios from 'axios';
import MessagesContainer from '../MessagesContainer';

jest.mock('axios');

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
};

const mockChannel = {
  id: '123',
  name: '123',
  description: 'Test channel',
};

describe('MessagesContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(() => 'test-token'),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { user: mockUser } });
      }
      if (url.includes('/api/channels/')) {
        return Promise.resolve({ data: { channel: mockChannel } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('displays correct placeholder text based on type and channelId', async () => {
    // Channel with ID
    render(<MessagesContainer type="channel" channelId="123" />);
    expect(await screen.findByPlaceholderText('Message #123')).toBeInTheDocument();
    
    // DM
    render(<MessagesContainer type="dm" />);
    expect(await screen.findByPlaceholderText('Message user')).toBeInTheDocument();
    
    // Channel without ID
    render(<MessagesContainer type="channel" />);
    expect(await screen.findByPlaceholderText('Message channel')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<MessagesContainer type="channel" channelId="123" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state when token is missing', () => {
    // Mock localStorage to return null for token
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
      },
    });

    render(<MessagesContainer type="channel" channelId="123" />);
    expect(screen.getByText('No authentication token found')).toBeInTheDocument();
  });
}); 