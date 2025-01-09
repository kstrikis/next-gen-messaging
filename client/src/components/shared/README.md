# Shared Components

This directory contains reusable components that are shared across different parts of the application.

## Package Dependencies

```json
{
  "dependencies": {
    "i18next": "^24.2.1",
    "react-i18next": "^15.4.0",
    "react-hook-form": "^7.54.2",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@storybook/react": "^8.4.7",
    "@storybook/addon-essentials": "^8.4.7",
    "@storybook/addon-interactions": "^8.4.7",
    "@storybook/test": "^8.4.7"
  }
}
```

## Components To Be Implemented

### ErrorBoundary

- Catches JavaScript errors
- Fallback UI
- Error reporting
- Recovery options

### LoadingSpinner

- Animated loading indicator
- Size variants
- Theme-aware
- Accessibility support

### ErrorMessage

- Error display component
- Different error types
- Action buttons
- i18n support

### EmptyState

- Empty list/content display
- Illustrations
- Action prompts
- Customizable messages

### PageTitle

- Document title management
- Breadcrumb integration
- SEO optimization
- Dynamic updates

## Implementation Guidelines

1. **Reusability**

   - Flexible props API
   - Consistent styling
   - Clear documentation
   - Example usage

2. **Accessibility**

   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
   - Focus management

3. **Internationalization**

   - i18next integration
   - RTL support
   - Dynamic content
   - Pluralization

4. **Testing**
   - Unit tests
   - Integration tests
   - Visual regression
   - Accessibility tests
