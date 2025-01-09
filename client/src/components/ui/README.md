# UI Components

This directory contains our shadcn/ui components organized by functionality.

## Package Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-hover-card": "^1.1.4",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "lucide-react": "^0.469.0",
    "tailwind-merge": "^2.6.0"
  }
}
```

## Core UI Components

- `button.jsx` - Primary interaction component
- `input.jsx` - Text input fields
- `textarea.jsx` - Multi-line text input
- `card.jsx` - Container for message bubbles and content blocks
- `avatar.jsx` - User and AI assistant profile images
- `form.jsx` - Form handling with validation
- `label.jsx` - Accessible form labels
- `tabs.jsx` - Content organization and navigation
- `scroll-area.jsx` - Scrollable containers with custom scrollbars
- `separator.jsx` - Visual dividers
- `skeleton.jsx` - Loading state placeholders

## Feedback & Alerts

- `toast.jsx` & `toaster.jsx` - Temporary notifications
- `alert.jsx` - Important messages
- `alert-dialog.jsx` - Critical confirmations
- `badge.jsx` - Status indicators and labels
- `progress.jsx` - Loading and progress indicators
- `tooltip.jsx` - Contextual help text

## Navigation & Menus

- `dropdown-menu.jsx` - Nested menu options
- `hover-card.jsx` - Rich hover previews
- `popover.jsx` - Contextual overlays
- `sheet.jsx` - Slide-out panels (mobile navigation)
- `command.jsx` - Command palette interface
- `switch.jsx` - Toggle controls

## Usage Examples

### Message Input

```jsx
<Card>
  <Form>
    <Textarea placeholder="Type your message..." />
    <Button>Send</Button>
  </Form>
</Card>
```

### User Profile

```jsx
<HoverCard>
  <Avatar src={user.avatar} fallback={user.initials} />
  <Badge variant="online">Active</Badge>
</HoverCard>
```

### Loading States

```jsx
<Skeleton className="h-12 w-12 rounded-full" /> {/* Avatar */}
<Skeleton className="h-4 w-[250px]" /> {/* Message */}
<Progress value={progress} /> {/* Upload progress */}
```

### Notifications

```jsx
<Toast>
  <AlertDialog>
    <AlertDialogTrigger>Delete Message</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</Toast>
```

## Customization

All components can be customized using Tailwind CSS classes and the `className` prop. For more complex customization, refer to the component's source code and the shadcn/ui documentation.
