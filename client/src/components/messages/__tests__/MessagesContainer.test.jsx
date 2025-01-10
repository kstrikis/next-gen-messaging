import { render, fireEvent, screen } from '@testing-library/react';
import MessagesContainer from '../MessagesContainer';
import logger from '@/lib/logger';

jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('MessagesContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs message flow from composer to container', () => {
    render(<MessagesContainer type="channel" channelId="123" />);
    const textarea = screen.getByRole('textbox');
    const text = 'test message';
    
    fireEvent.change(textarea, { target: { value: text } });
    fireEvent.submit(screen.getByRole('form'));
    
    // Check composer logs
    expect(logger.info).toHaveBeenCalledWith('💬 Message submitted from composer:', {
      message: text,
      timestamp: expect.any(String),
    });
    
    // Check container logs
    expect(logger.info).toHaveBeenCalledWith('📨 Message received by container:', {
      message: text,
      type: 'channel',
      channelId: '123',
      timestamp: expect.any(String),
    });
    
    // Check cleanup logs
    expect(logger.info).toHaveBeenCalledWith('🧹 Message input cleared');
  });

  it('passes correct placeholder text based on type and channelId', () => {
    // Channel with ID
    render(<MessagesContainer type="channel" channelId="123" />);
    expect(screen.getByPlaceholderText('Message #123')).toBeInTheDocument();
    
    // DM
    render(<MessagesContainer type="dm" />);
    expect(screen.getByPlaceholderText('Message user')).toBeInTheDocument();
    
    // Channel without ID
    render(<MessagesContainer type="channel" />);
    expect(screen.getByPlaceholderText('Message channel')).toBeInTheDocument();
  });
}); 