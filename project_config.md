# Project Configuration

## Changelog
*[Project changelog entries will be added here upon completion]*

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4
- **UI Components**: Headless UI, React DnD
- **State Management**: React hooks + Context API
- **Date Handling**: date-fns
- **Icons**: Heroicons
- **Image Optimization**: Next.js Image component

### Backend/API
- **API Routes**: Next.js API routes
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Data Storage**: Local Storage + IndexedDB (Dexie.js)
- **External APIs**: Google Photos Library API

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript strict mode
- **Development**: Next.js dev server with hot reload

## Critical Patterns & Conventions

### File Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Utilities and API clients
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── styles/              # Global styles and Tailwind config
```

### Component Conventions
- Use functional components with TypeScript
- Props interfaces defined inline or in separate types file
- Use proper semantic HTML elements
- Implement loading states and error boundaries
- Follow compound component pattern for complex UI

### Styling Guidelines
- Mobile-first responsive design
- Warm, wood-inspired color palette
- Consistent spacing using Tailwind scale
- Card-based layouts with subtle shadows
- Professional typography with adequate contrast

### Data Management
- Use TypeScript interfaces for all data structures
- Implement optimistic UI updates
- Handle loading and error states consistently
- Use React Query for server state management (future enhancement)

### API Integration
- Centralized API client functions
- Proper error handling and retry logic
- Type-safe API responses
- Secure token management 