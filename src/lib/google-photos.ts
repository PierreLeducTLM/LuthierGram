import { GooglePhoto, GooglePhotosResponse, Photo, ApiResponse } from '@/types';

const GOOGLE_PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

export class GooglePhotosClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${GOOGLE_PHOTOS_API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Photos API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Google Photos API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fetch media items (photos) from Google Photos
   */
  async getMediaItems(options: {
    pageSize?: number;
    pageToken?: string;
    albumId?: string;
  } = {}): Promise<ApiResponse<GooglePhotosResponse>> {
    const { pageSize = 100, pageToken, albumId } = options;
    
    const body: any = {
      pageSize,
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    if (albumId) {
      body.albumId = albumId;
    }

    return this.request<GooglePhotosResponse>('/mediaItems:search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get all media items with pagination
   */
  async getAllMediaItems(options: {
    maxItems?: number;
    albumId?: string;
    onProgress?: (items: GooglePhoto[], total: number) => void;
  } = {}): Promise<ApiResponse<GooglePhoto[]>> {
    const { maxItems = 1000, albumId, onProgress } = options;
    const allItems: GooglePhoto[] = [];
    let pageToken: string | undefined;
    let hasMore = true;

    try {
      while (hasMore && allItems.length < maxItems) {
        const response = await this.getMediaItems({
          pageSize: Math.min(100, maxItems - allItems.length),
          pageToken,
          albumId,
        });

                 if (!response.success || !response.data) {
           return {
             success: false,
             error: response.error || 'Failed to fetch media items',
           };
         }

        const { mediaItems = [], nextPageToken } = response.data;
        allItems.push(...mediaItems);
        
        if (onProgress) {
          onProgress(mediaItems, allItems.length);
        }

        pageToken = nextPageToken;
        hasMore = !!nextPageToken && allItems.length < maxItems;
      }

      return {
        success: true,
        data: allItems,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch all media items',
      };
    }
  }

  /**
   * Search for media items with filters
   */
  async searchMediaItems(filters: {
    dateFilter?: {
      ranges?: Array<{
        startDate: { year: number; month: number; day: number };
        endDate: { year: number; month: number; day: number };
      }>;
      dates?: Array<{ year: number; month: number; day: number }>;
    };
    mediaTypeFilter?: {
      mediaTypes: string[];
    };
    contentFilter?: {
      includedContentCategories?: string[];
      excludedContentCategories?: string[];
    };
    pageSize?: number;
    pageToken?: string;
  }): Promise<ApiResponse<GooglePhotosResponse>> {
    const { pageSize = 100, pageToken, ...searchFilters } = filters;

    const body: any = {
      pageSize,
      filters: searchFilters,
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    return this.request<GooglePhotosResponse>('/mediaItems:search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get albums from Google Photos
   */
  async getAlbums(options: {
    pageSize?: number;
    pageToken?: string;
  } = {}): Promise<ApiResponse<{ albums: any[]; nextPageToken?: string }>> {
    const { pageSize = 50, pageToken } = options;
    
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    return this.request<{ albums: any[]; nextPageToken?: string }>(`/albums?${params}`);
  }

  /**
   * Convert Google Photo to our internal Photo format
   */
  static convertToPhoto(googlePhoto: GooglePhoto): Photo {
    const timestamp = new Date(googlePhoto.mediaMetadata.creationTime);
    
    return {
      id: crypto.randomUUID(),
      googlePhotoId: googlePhoto.id,
      url: googlePhoto.baseUrl,
      thumbnail: `${googlePhoto.baseUrl}=w400-h400-c`,
      timestamp,
      filename: googlePhoto.filename,
      posted: false,
      metadata: {
        width: parseInt(googlePhoto.mediaMetadata.width),
        height: parseInt(googlePhoto.mediaMetadata.height),
        cameraMake: googlePhoto.mediaMetadata.photo?.cameraMake,
        cameraModel: googlePhoto.mediaMetadata.photo?.cameraModel,
        focalLength: googlePhoto.mediaMetadata.photo?.focalLength,
        aperture: googlePhoto.mediaMetadata.photo?.aperture,
        isoEquivalent: googlePhoto.mediaMetadata.photo?.isoEquivalent,
        exposureTime: googlePhoto.mediaMetadata.photo?.exposureTime,
      },
    };
  }

  /**
   * Test API connection and permissions
   */
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    const result = await this.getMediaItems({ pageSize: 1 });
    
    if (result.success) {
      return {
        success: true,
        data: { message: 'Successfully connected to Google Photos API' },
      };
    }

    return {
      success: false,
      error: `Failed to connect to Google Photos API: ${result.error}`,
    };
  }
}

/**
 * Helper function to create a Google Photos client from session
 */
export function createGooglePhotosClient(accessToken: string): GooglePhotosClient {
  return new GooglePhotosClient(accessToken);
}

/**
 * Date helper functions for Google Photos API
 */
export const dateHelpers = {
  /**
   * Convert JavaScript Date to Google Photos date format
   */
  toGoogleDate(date: Date): { year: number; month: number; day: number } {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Google API uses 1-based months
      day: date.getDate(),
    };
  },

  /**
   * Convert Google Photos date to JavaScript Date
   */
  fromGoogleDate(googleDate: { year: number; month: number; day: number }): Date {
    return new Date(googleDate.year, googleDate.month - 1, googleDate.day);
  },

  /**
   * Create date range for last N days
   */
  createDateRange(days: number): {
    startDate: { year: number; month: number; day: number };
    endDate: { year: number; month: number; day: number };
  } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: this.toGoogleDate(startDate),
      endDate: this.toGoogleDate(endDate),
    };
  },
};