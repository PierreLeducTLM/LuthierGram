# Workflow State

## State
- **Phase**: BLUEPRINT
- **Status**: NEEDS_PLAN_APPROVAL
- **Current Task**: Phase 3 - Build Management System (CRUD Operations & Components)

## Plan

### Phase 3: Build Management System - Detailed Blueprint

#### 1. Database Layer & Storage
```typescript
// src/lib/database.ts - Build-specific operations
class BuildsDatabase {
  async createBuild(buildData: CreateBuildFormData): Promise<Build>
  async getBuild(id: string): Promise<Build | null>
  async getAllBuilds(): Promise<Build[]>
  async updateBuild(id: string, data: UpdateBuildFormData): Promise<Build>
  async deleteBuild(id: string): Promise<void>
  async searchBuilds(filters: BuildFilters): Promise<Build[]>
  async getBuildWithPhotos(id: string): Promise<Build & { photos: Photo[] }>
}
```

#### 2. Build CRUD Operations

**2.1 Build Form Validation**
```typescript
// src/lib/validation.ts
export const buildFormSchema = {
  name: { required: true, minLength: 2, maxLength: 100 },
  woodType: { required: true, enum: WoodType },
  style: { required: true, enum: BuildStyle },
  startDate: { required: true, type: 'date', max: new Date() },
  clientName: { optional: true, maxLength: 100 },
  notes: { optional: true, maxLength: 1000 }
}
```

**2.2 Build API Routes**
```typescript
// src/app/api/builds/route.ts - GET, POST endpoints
// src/app/api/builds/[id]/route.ts - GET, PUT, DELETE endpoints
// Error handling with proper HTTP status codes
// Input validation using the schema
// TypeScript response typing
```

#### 3. Build Components Architecture

**3.1 BuildForm Component**
```typescript
// src/components/builds/BuildForm.tsx
interface BuildFormProps {
  build?: Build; // undefined = create mode, defined = edit mode
  onSubmit: (data: CreateBuildFormData | UpdateBuildFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

Features:
- Wood type dropdown with search/filter
- Build style selection with icons
- Date picker with validation (no future dates)
- Client name with autocomplete from previous builds
- Notes textarea with character count
- Real-time validation with error display
- Loading states during submission

**3.2 BuildCard Component**
```typescript
// src/components/builds/BuildCard.tsx
interface BuildCardProps {
  build: Build;
  photoCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  className?: string;
}
```

Features:
- Wood-inspired card design with thumbnail
- Build progress indicator (based on photos assigned)
- Build metadata display (wood type, style, start date)
- Action buttons (edit, delete, view details)
- Photo count badge
- Responsive layout (grid on desktop, stack on mobile)

**3.3 BuildList Component**
```typescript
// src/components/builds/BuildList.tsx
interface BuildListProps {
  builds: Build[];
  onCreateNew: () => void;
  onEditBuild: (build: Build) => void;
  onDeleteBuild: (buildId: string) => void;
  isLoading?: boolean;
}
```

Features:
- Search functionality (name, wood type, client)
- Filter controls (wood type, style, date range)
- Sort options (name, date, progress)
- Empty state with call-to-action
- Loading skeletons
- Pagination for large build lists

**3.4 BuildDetails Component**
```typescript
// src/components/builds/BuildDetails.tsx
interface BuildDetailsProps {
  build: Build;
  photos: Photo[];
  onEditBuild: () => void;
  onDeleteBuild: () => void;
  onAssignPhoto: (photoId: string) => void;
  onUnassignPhoto: (photoId: string) => void;
}
```

Features:
- Full build information display
- Assigned photos grid with timeline view
- Build timeline/progress tracker
- Photo assignment interface
- Edit/delete actions with confirmations

#### 4. State Management

**4.1 Build Context**
```typescript
// src/contexts/BuildContext.tsx
interface BuildContextType {
  builds: Build[];
  selectedBuild: Build | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createBuild: (data: CreateBuildFormData) => Promise<void>;
  updateBuild: (id: string, data: UpdateBuildFormData) => Promise<void>;
  deleteBuild: (id: string) => Promise<void>;
  selectBuild: (build: Build | null) => void;
  refreshBuilds: () => Promise<void>;
  searchBuilds: (filters: BuildFilters) => Promise<void>;
}
```

#### 5. Pages & Routing

**5.1 Builds Page**
```typescript
// src/app/builds/page.tsx
- Build list with search/filter
- "Create New Build" button
- Responsive grid layout
- Loading and error states
```

**5.2 Build Details Page**
```typescript
// src/app/builds/[id]/page.tsx
- Full build details view
- Assigned photos display
- Edit/delete actions
- Photo assignment interface
```

**5.3 Create/Edit Build Page**
```typescript
// src/app/builds/new/page.tsx
// src/app/builds/[id]/edit/page.tsx
- Build form with validation
- Cancel/save actions
- Success/error feedback
```

#### 6. Custom Hooks

**6.1 useBuild Hook**
```typescript
// src/hooks/useBuild.ts
export function useBuild(buildId: string) {
  // Fetch single build with photos
  // Loading/error states
  // Refresh functionality
}
```

**6.2 useBuilds Hook**
```typescript
// src/hooks/useBuilds.ts
export function useBuilds(filters?: BuildFilters) {
  // Fetch builds list
  // Search/filter functionality
  // CRUD operations
}
```

#### 7. UI Components

**7.1 Confirmation Dialogs**
```typescript
// src/components/ui/ConfirmDialog.tsx
- Delete build confirmation
- Unsaved changes warning
- Generic confirmation component
```

**7.2 Form Controls**
```typescript
// src/components/ui/Select.tsx - Wood type & style dropdowns
// src/components/ui/DatePicker.tsx - Start date selection
// src/components/ui/TextArea.tsx - Notes input
// src/components/ui/SearchInput.tsx - Build search
```

#### 8. Implementation Order

1. **Database Layer** - Build CRUD operations
2. **API Routes** - Build endpoints with validation
3. **Basic Form Component** - Create/edit builds
4. **Build Context** - State management
5. **Build List Page** - Display builds with basic actions
6. **Build Card Component** - Individual build display
7. **Build Details Page** - Full build view
8. **Search & Filter** - Enhanced build discovery
9. **Delete Confirmation** - Safe build deletion
10. **UI Polish** - Loading states, error handling, responsive design

#### 9. Testing Strategy

- **Unit Tests**: Form validation, database operations
- **Component Tests**: User interactions, state changes
- **Integration Tests**: Full CRUD workflows
- **E2E Tests**: Complete build management flow

#### 10. Success Criteria

- ✅ Create builds with all required fields and validation
- ✅ Edit existing builds with proper form pre-population
- ✅ Delete builds with confirmation and safety checks
- ✅ Search and filter builds effectively
- ✅ Responsive design works on all device sizes
- ✅ Loading states and error handling work properly
- ✅ All TypeScript types are properly implemented
- ✅ Database operations are performant and reliable

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
- Phases 1 & 2 completed: Project foundation, authentication, and Google Photos integration
- Phase 3 BLUEPRINT created: Build Management System with comprehensive component architecture
- Detailed implementation plan covers: Database layer, CRUD operations, UI components, state management
- 10-step implementation order defined with clear success criteria
- Status set to NEEDS_PLAN_APPROVAL - awaiting user confirmation for Phase 3 implementation

## ArchiveLog
*[Empty - no archived logs yet]* 