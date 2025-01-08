# ChatGenius

A modern messaging platform with AI-powered features, built using Domain-Driven Design principles. ChatGenius combines Slack-like functionality with advanced AI capabilities for enhanced workplace communication.

## Core Features

### Real-time Communication
- Public and private channels
- Direct messaging with typing indicators
- Message threading and reactions
- File sharing via AWS S3
- Rich text formatting with Markdown
- Full-text search across messages

### AI Integration
- Customizable AI avatars
- Voice and gesture synthesis
- Smart autoresponders
- AI-assisted message composition
- Content moderation

### User Experience
- Instant guest access
- Role-based workspace management
- Customizable notifications
- User presence indicators
- Mobile-responsive design

## Architecture

### Frontend
- React.js with Next.js
- Tailwind CSS & shadcn/ui
- Socket.IO Client
- React Query & Redux Toolkit
- Storybook for component development

### Backend
- Node.js v22 LTS & Express.js
- Socket.IO for real-time features
- PostgreSQL with Prisma ORM
- Auth0 for authentication
- AWS S3 for file storage

### Testing & Quality
- Jest & React Testing Library
- Cypress for E2E testing
- SuperTest for API testing
- ESLint & Prettier
- Continuous Integration with GitHub Actions

## Getting Started

### Prerequisites
- Node.js v22 LTS
- PostgreSQL 15+
- Git
- Yarn package manager
- AWS Account (for S3)
- Auth0 Account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kstrikis/next-gen-messaging.git
   cd next-gen-messaging
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   yarn install
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment files
   cp .env.example .env

   # Edit .env with your:
   # - Database credentials
   # - AWS S3 configuration
   # - Auth0 credentials
   # - API keys and secrets
   ```

4. Initialize the database:
   ```bash
   # Run database migrations
   yarn prisma migrate dev
   ```

5. Start development servers:
   ```bash
   # Start both frontend and backend
   yarn dev

   # Or start separately:
   yarn dev:client    # Frontend: http://localhost:3000
   yarn dev:server    # Backend:  http://localhost:8000
   ```

## Project Structure

```
project-root/
├── client/                # React.js frontend
│   ├── components/        # UI components
│   ├── pages/            # Next.js pages
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Tailwind styles
│   └── redux/            # State management
├── server/               # Node.js backend
│   ├── controllers/      # Request handlers
│   ├── models/          # Prisma models
│   ├── routes/          # API routes
│   └── prisma/          # Database schema
├── cypress/              # E2E tests
├── tests/                # Unit & integration tests
└── docs/                 # Documentation
```

## Documentation

- [User Flow](docs/user-flow.md) - Detailed user interaction flows
- [API Schema](docs/api-socket-message-schema.md) - API and WebSocket documentation
- [Database Schema](docs/db-schema.md) - Data model and relationships
- [Project Structure](docs/directory-structure.md) - Codebase organization

## Contributing

We welcome contributions! See [TODO.md](TODO.md) for:
- Project roadmap
- Development workflow
- Testing guidelines
- Deployment instructions
```