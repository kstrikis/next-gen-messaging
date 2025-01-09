# Components Directory Structure

## Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^15.1.4"
  },
  "devDependencies": {
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

## Overview

The components directory is organized into the following structure:

```
components/
├── ui/              # shadcn/ui base components
├── chat/            # Chat-specific components
├── auth/            # Authentication components
├── layout/          # Layout components
└── shared/          # Shared/reusable components
```

## Directory Purposes

### `/ui`

Contains all shadcn/ui base components. These are the building blocks for our UI. See `ui/README.md` for detailed documentation of available components.

### `/chat` (To Be Implemented)

Will contain chat-specific components such as:

- MessageList
- MessageBubble
- ChatInput
- ChatHeader
- UserTypingIndicator
- FileAttachment
- EmojiPicker

### `/auth` (To Be Implemented)

Will contain authentication-related components such as:

- LoginButton
- LogoutButton
- UserProfile
- AuthGuard
- PrivateRoute

### `/layout` (To Be Implemented)

Will contain layout components such as:

- Sidebar
- Header
- Footer
- MainContent
- Navigation

### `/shared` (To Be Implemented)

Will contain shared components such as:

- ErrorBoundary
- LoadingSpinner
- ErrorMessage
- EmptyState
- PageTitle

## Component Guidelines

1. **Naming Convention**

   - Use PascalCase for component files and folders
   - Suffix test files with `.test.jsx`
   - Suffix story files with `.stories.jsx`

2. **File Structure**

   ```
   ComponentName/
   ├── index.jsx          # Main component
   ├── ComponentName.test.jsx
   ├── ComponentName.stories.jsx
   └── README.md          # Component documentation
   ```

3. **Props Documentation**

   - Use JSDoc comments for prop documentation
   - Include prop types and descriptions
   - Document any required props

4. **Testing**

   - Include unit tests for all components
   - Test key functionality and edge cases
   - Include accessibility tests

5. **Storybook**
   - Create stories for all components
   - Include different states and variations
   - Document props and usage examples
