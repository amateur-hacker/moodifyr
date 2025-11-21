# Moodifyr AI - QWEN.md

## Project Overview

Moodifyr is a Next.js-based music application that helps users create mood-based playlists, track their listening habits, and discover how music shapes their focus, feelings, and daily vibe. The application uses modern web technologies including React 19, Next.js 16 with Turbopack, TypeScript, Tailwind CSS, PostgreSQL with Drizzle ORM, and integrates with various music APIs and AI services.

### Key Technologies & Features

- **Frontend**: Next.js 16 with Turbopack, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components, Geist font
- **Database**: PostgreSQL with Drizzle ORM and Zod for schema validation
- **Authentication**: Better Auth
- **AI Integration**: Groq SDK for AI-powered features
- **State Management**: Zustand
- **UI Components**: Radix UI primitives, Sonner for notifications
- **Deployment**: Vercel-ready

### Architecture

The project follows a modern Next.js App Router structure with:

- `/app` - Contains the main application pages and routing
- `/components` - Reusable UI components and magic UI effects
- `/context` - React context providers
- `/db` - Database schema, migrations, and operations
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and service integrations
- `/store` - Zustand stores for state management

## Building and Running

### Prerequisites

- Node.js (latest version)
- Bun (for faster package management and scripts)
- PostgreSQL database (Docker Compose available)

### Setup Steps

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Set up Database** (using Docker):
   ```bash
   docker-compose up -d
   ```

3. **Environment Configuration**:
   - Copy `.env.local` template and configure your environment variables
   - Ensure `DATABASE_URL` points to your PostgreSQL instance

4. **Database Setup**:
   ```bash
   bun run db:generate  # Generate migrations
   bun run db:migrate   # Run migrations
   bun run db:seed      # Seed initial data (if needed)
   ```

5. **Development Server**:
   ```bash
   bun run dev  # Runs Next.js dev server with Turbopack
   ```

6. **Production Build**:
   ```bash
   bun run build  # Build with Turbopack
   bun run start  # Start production server
   ```

### Available Scripts

- `dev` - Start development server with Turbopack
- `build` - Build the application with Turbopack
- `start` - Start production server
- `lint` - Run Biome linter on src directory
- `lint:fix` - Auto-fix linting issues
- `typecheck` - Run TypeScript type checking
- `format` - Format code with Biome
- `lint:format` - Fix linting issues and format code
- `test` - Run Jest tests
- `test:watch` - Run Jest tests in watch mode
- `db:*` - Database management scripts (generate, migrate, seed, studio)
- `vercel:*` - Vercel deployment scripts

## Development Conventions

### Code Style

- Uses Biome for formatting and linting (configured in `biome.json`)
- 2-space indentation, 80-character line width
- React Compiler enabled for performance optimization
- Strict TypeScript mode

### File Structure

- Uses absolute imports with `@/*` aliasing to `src/*`
- Component files use PascalCase (e.g., Button.tsx)
- Page components follow Next.js App Router conventions
- Database schema uses snake_case naming (configured in Drizzle)

### UI Components

- Uses Radix UI primitives for accessible components
- Custom UI components in `/components/ui`
- Magic UI effects in `/components/magicui`
- Component library follows accessibility best practices

## Environment Variables

The application requires several environment variables:

- `NEXT_PUBLIC_BASE_URL` - Public URL of the application
- `DATABASE_URL` - PostgreSQL database connection string
- `BETTER_AUTH_URL` - Authentication service URL
- Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)

## Database Management

- Uses Drizzle ORM for database operations
- PostgreSQL database with schema defined in `/src/db/schema`
- Migrations are generated and applied automatically
- Database studio available via `bun run db:studio`

## Testing

- Jest is configured for unit and integration testing
- Test files follow naming patterns: `*.test.ts` or `*.spec.ts`
- Run tests with `bun run test` or `bun run test:watch`