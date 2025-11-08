# Fantasy Basketball Tool - Agent Guidelines

## Commands
- **Build**: `pnpm run build`
- **Lint**: `pnpm run lint` (ESLint with Next.js config)
- **Dev**: `pnpm run dev` (runs with experimental HTTPS)
- **Test**: No test framework configured yet

## Code Style Guidelines

### Imports & Formatting
- Use absolute imports with `@/` prefix for src directory
- Import React components: `import * as React from "react"`
- Use `cn()` utility from `@/lib/utils` for className merging
- Follow existing component patterns (see UI components in `src/components/ui/`)

### TypeScript
- Strict TypeScript enabled
- Use interfaces for API response types (see `src/types/yahoo.ts`)
- Prefer `export interface` for public types
- Use proper typing for React props and component signatures

### Component Conventions
- Use Radix UI primitives with class-variance-authority for variants
- Follow existing component structure (Button, Card, etc. as reference)
- Use semantic HTML elements
- Implement proper error boundaries and loading states

### API & Data Handling
- Use TanStack Query for data fetching
- Store API utilities in `src/lib/`
- Handle Yahoo Fantasy API responses with proper typing
- Use async/await patterns consistently

### Naming
- PascalCase for components and interfaces
- camelCase for functions and variables
- Descriptive names for API response types
- Use kebab-case for file names when appropriate