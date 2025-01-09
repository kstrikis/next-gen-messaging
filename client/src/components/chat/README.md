# Chat Components

This directory contains components specific to the chat functionality.

## Package Dependencies

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.5.0",
    "@tanstack/react-query": "^5.63.0",
    "socket.io-client": "^4.8.1",
    "framer-motion": "^11.16.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2"
  }
}
```

## Components To Be Implemented

### MessageList

- Displays the chat message history
- Handles message grouping and timestamps
- Supports infinite scroll for message history

### MessageBubble

- Individual message display
- Supports text, markdown, code blocks
- Shows sender info and timestamp
- Handles message actions (edit, delete, react)

### ChatInput

- Message composition area
- File attachment handling
- Emoji picker integration
- Markdown support
- AI command integration

### ChatHeader

- Shows current chat/channel info
- Displays online status
- Contains chat actions/settings

### UserTypingIndicator

- Shows who is currently typing
- Handles multiple simultaneous typers
- Animated indicator

### FileAttachment

- File upload interface
- Preview functionality
- Progress indicator
- File type validation

### EmojiPicker

- Emoji selection interface
- Recent emojis
- Category navigation
- Search functionality

## Implementation Guidelines

1. **State Management**

   - Use Redux for global chat state
   - React Query for server state
   - Local state for UI-specific behavior

2. **Real-time Updates**

   - Socket.IO for real-time message delivery
   - Typing indicators
   - Online status updates

3. **Performance**

   - Virtualized list for messages
   - Lazy loading for images/attachments
   - Debounced typing indicators

4. **Accessibility**
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - Screen reader compatibility
