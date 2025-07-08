# Workflow State

## State
- **Phase**: CONSTRUCT
- **Status**: IN_PROGRESS
- **Current Task**: Phase 1 - Project Foundation (Next.js 15.3.5 setup)

## Plan

### Phase 1: Project Foundation
1. **Initialize Next.js Project**
   - Create Next.js 15.3.5 project with TypeScript
   - Configure Tailwind CSS with custom wood-inspired theme
   - Set up ESLint, Prettier, and TypeScript strict mode
   - Create base project structure

2. **Core Type Definitions**
   ```typescript
   interface Build {
     id: string;
     name: string;
     woodType: string;
     style: string;
     startDate: Date;
     clientName?: string;
     notes?: string;
     photos: Photo[];
   }

   interface Photo {
     id: string;
     googlePhotoId: string;
     url: string;
     thumbnail: string;
     timestamp: Date;
     filename: string;
     buildId?: string;
     caption?: string;
     scheduledDate?: Date;
     posted: boolean;
   }
   ```

3. **Database Layer Setup**
   - Implement IndexedDB with Dexie.js for local storage
   - Create stores for builds, photos, and assignments
   - Implement CRUD operations with TypeScript types

### Phase 2: Authentication & Google Photos Integration
1. **OAuth 2.0 Setup**
   - Configure NextAuth.js with Google provider
   - Set up Google Photos Library API credentials
   - Implement secure token management
   - Create authentication middleware

2. **Google Photos API Client**
   - Build API client for Google Photos Library API
   - Implement photo fetching with pagination
   - Add search and date filtering capabilities
   - Handle rate limiting and error cases

3. **Photo Grid Component**
   - Create responsive photo grid with lazy loading
   - Implement thumbnail display with metadata overlay
   - Add infinite scroll for large libraries
   - Include loading states and error handling

### Phase 3: Build Management System
1. **Build CRUD Operations**
   - Create "New Build" form with validation
   - Implement build editing capabilities
   - Add build deletion with confirmation
   - Create build listing with search/filter

2. **Build Components**
   - BuildCard component with progress indicators
   - BuildForm component with dropdown selections
   - BuildTimeline component for photo organization
   - BuildMetadata component for details display

### Phase 4: Photo Classification Interface
1. **Drag & Drop System**
   - Implement React DnD for photo assignment
   - Create drop zones for each build
   - Add visual feedback during drag operations
   - Handle drag-and-drop state management

2. **Bulk Operations**
   - Multi-select functionality for photos
   - Bulk assignment to builds
   - Bulk unassignment capabilities
   - Progress indicators for bulk operations

3. **Photo Assignment UI**
   - Visual indicators for assigned vs unassigned photos
   - Build assignment dropdown per photo
   - Photo filtering by assignment status
   - Timeline view of assigned photos within builds

### Phase 5: Content Generation Interface
1. **Caption Management**
   - Text area component with character counting
   - Caption templates for different build stages
   - Auto-save functionality for captions
   - Caption preview with photo context

2. **Content Templates**
   - Pre-defined templates for build stages:
     * Wood selection and planning
     * Rough shaping and cutting
     * Joinery and assembly
     * Finishing and setup
     * Final reveal
   - Template customization options
   - Template variables (wood type, build name, etc.)

### Phase 6: Content Calendar
1. **Calendar Component**
   - Monthly calendar view with scheduled posts
   - Day cells showing post thumbnails and previews
   - Drag-and-drop for rescheduling posts
   - Calendar navigation (previous/next month)

2. **Scheduling System**
   - Date picker for post scheduling
   - Posting frequency selector
   - Automatic scheduling suggestions
   - Schedule conflict detection

3. **Export Functionality**
   - Export scheduled posts to CSV/JSON
   - Generate posting schedule reports
   - Backup/restore functionality
   - Integration readiness for future Instagram API

### Phase 7: UI/UX Polish
1. **Design System**
   - Implement wood-inspired color palette
   - Create consistent spacing and typography
   - Add smooth animations and transitions
   - Implement dark/light mode toggle

2. **Responsive Design**
   - Mobile-first approach
   - Tablet-optimized layouts
   - Desktop enhancement features
   - Touch-friendly interactions

3. **Error Handling & Loading States**
   - Comprehensive error boundaries
   - Loading skeletons for all async operations
   - Toast notifications for user feedback
   - Offline capability indicators

### Phase 8: Testing & Validation
1. **Component Testing**
   - Unit tests for core components
   - Integration tests for API interactions
   - E2E tests for critical user flows
   - Performance testing for large photo libraries

2. **User Experience Testing**
   - Photo assignment workflow testing
   - Calendar scheduling validation
   - Build management flow verification
   - Cross-browser compatibility testing

### Technical Architecture Decisions
- **State Management**: React Context + useReducer for global state
- **Data Fetching**: Native fetch with custom hooks
- **Image Optimization**: Next.js Image with Google Photos URLs
- **Responsive Strategy**: Tailwind breakpoints with mobile-first
- **Performance**: Virtual scrolling for large photo lists
- **Security**: Secure token storage, API key protection
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Rules
- Follow BLUEPRINT → CONSTRUCT → VALIDATE workflow
- Get user approval before implementation phase
- Maintain clean separation of concerns
- Focus on MVP with professional UI/UX
- Prepare for future AI integration

## Items
- [ ] Create project structure and configuration
- [ ] Set up Next.js with TypeScript and Tailwind CSS
- [ ] Implement Google Photos API integration
- [ ] Build management system
- [ ] Photo classification interface
- [ ] Content generation UI
- [ ] Content calendar
- [ ] Testing and validation

## Log
- Project initiated: Luthier Instagram Content Manager web application
- Phase set to BLUEPRINT for detailed planning
- Comprehensive 8-phase implementation plan created covering all requirements
- Status set to NEEDS_PLAN_APPROVAL - awaiting user confirmation

## ArchiveLog
*[Empty - no archived logs yet]* 