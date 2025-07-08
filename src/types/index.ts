// Core data models for the Luthier Instagram Content Manager

export interface Build {
  id: string;
  name: string;
  woodType: string;
  style: string;
  startDate: Date;
  clientName?: string;
  notes?: string;
  photos: Photo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
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
  metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
  width?: number;
  height?: number;
  cameraMake?: string;
  cameraModel?: string;
  focalLength?: string;
  aperture?: string;
  isoEquivalent?: number;
  exposureTime?: string;
}

export interface GooglePhoto {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: PhotoMetadata;
  };
  filename: string;
}

export interface GooglePhotosResponse {
  mediaItems: GooglePhoto[];
  nextPageToken?: string;
}

// Build management types
export type WoodType = 
  | 'Mahogany'
  | 'Maple'
  | 'Rosewood'
  | 'Cedar'
  | 'Spruce'
  | 'Ebony'
  | 'Walnut'
  | 'Cherry'
  | 'Ash'
  | 'Alder'
  | 'Basswood'
  | 'Koa'
  | 'Other';

export type BuildStyle = 
  | 'Acoustic'
  | 'Electric'
  | 'Classical'
  | 'Bass'
  | 'Mandolin'
  | 'Ukulele'
  | 'Other';

export type BuildStage = 
  | 'Planning'
  | 'Wood Selection'
  | 'Rough Shaping'
  | 'Joinery'
  | 'Assembly'
  | 'Finishing'
  | 'Setup'
  | 'Complete';

// Content generation types
export interface ContentTemplate {
  id: string;
  name: string;
  stage: BuildStage;
  template: string;
  variables: string[];
}

export interface PostContent {
  photoId: string;
  caption: string;
  hashtags: string[];
  scheduledDate: Date;
  buildContext: {
    buildName: string;
    woodType: string;
    stage: BuildStage;
  };
}

// UI state types
export interface PhotoSelection {
  selectedPhotos: Set<string>;
  isSelecting: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedPhotoId?: string;
  dropTargetBuildId?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  accessToken?: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  photo: Photo;
  build: Build;
  content: PostContent;
}

export interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

// Filter and search types
export interface PhotoFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  buildId?: string;
  isAssigned?: boolean;
  searchTerm?: string;
}

export interface BuildFilters {
  woodType?: WoodType;
  style?: BuildStyle;
  stage?: BuildStage;
  searchTerm?: string;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: unknown;
}

// Form types
export interface CreateBuildFormData {
  name: string;
  woodType: WoodType;
  style: BuildStyle;
  startDate: Date;
  clientName?: string;
  notes?: string;
}

export interface UpdateBuildFormData extends Partial<CreateBuildFormData> {
  id: string;
} 