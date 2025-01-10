import { render, fireEvent, screen } from '@testing-library/react';
import MessageComposer from '../MessageComposer';
import logger from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('MessageComposer', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs focus events', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.focus(textarea);
    expect(logger.info).toHaveBeenCalledWith('🎯 Composer focused');
    
    fireEvent.blur(textarea);
    expect(logger.info).toHaveBeenCalledWith('⚪ Composer blurred');
  });

  it('logs text input changes', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(logger.debug).toHaveBeenCalledWith('✏️ Message input changed:', {
      length: 4,
      text: 'test',
      isEmpty: false,
    });
  });

  it('logs formatting button clicks', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.focus(textarea);
    
    const boldButton = screen.getByLabelText('Bold');
    fireEvent.click(boldButton);
    expect(logger.info).toHaveBeenCalledWith('🔤 Formatting requested:', {
      type: 'bold',
      message: '',
    });
    expect(logger.info).toHaveBeenCalledWith('Making text bold');
  });

  it('logs quick action button clicks', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    
    const emojiButton = screen.getByLabelText('Add emoji');
    fireEvent.click(emojiButton);
    expect(logger.info).toHaveBeenCalledWith('😊 Emoji picker requested');
    
    const attachButton = screen.getByLabelText('Attach file');
    fireEvent.click(attachButton);
    expect(logger.info).toHaveBeenCalledWith('📎 File attachment requested');
    
    const mentionButton = screen.getByLabelText('Mention someone');
    fireEvent.click(mentionButton);
    expect(logger.info).toHaveBeenCalledWith('@ Mention requested');
  });

  it('logs message submission', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const textarea = screen.getByRole('textbox');
    const text = 'test message';
    
    fireEvent.change(textarea, { target: { value: text } });
    fireEvent.submit(screen.getByRole('form'));
    
    expect(logger.info).toHaveBeenCalledWith('💬 Message submitted from composer:', {
      message: text,
      timestamp: expect.any(String),
    });
    expect(mockOnSend).toHaveBeenCalledWith(text);
    expect(logger.info).toHaveBeenCalledWith('🧹 Message input cleared');
  });

  it('logs warning for empty message submission', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    fireEvent.submit(screen.getByRole('form'));
    
    expect(logger.warn).toHaveBeenCalledWith('⚠️ Attempted to submit empty message');
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('maintains focus when clicking formatting buttons', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.focus(textarea);
    
    const boldButton = screen.getByLabelText('Bold');
    fireEvent.click(boldButton);
    
    expect(document.activeElement).toBe(textarea);
  });
}); 