'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { createGooglePhotosClient, GooglePhotosClient } from '@/lib/google-photos';
import { Photo, GooglePhoto } from '@/types';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  onPhotoSelect?: (photo: Photo) => void;
  selectedPhotos?: Set<string>;
  className?: string;
  enableSelection?: boolean;
}

export function PhotoGrid({ 
  onPhotoSelect, 
  selectedPhotos = new Set(), 
  className,
  enableSelection = false 
}: PhotoGridProps) {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageToken, setPageToken] = useState<string | undefined>();
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPhotoRef = useRef<HTMLDivElement | null>(null);

  const loadPhotos = useCallback(async (token?: string) => {
    if (!session?.accessToken || loading) return;

    setLoading(true);
    setError(null);

    try {
      const client = createGooglePhotosClient(session.accessToken);
      const response = await client.getMediaItems({
        pageSize: 50,
        pageToken: token,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to load photos');
      }

      const googlePhotos = response.data?.mediaItems || [];
      const convertedPhotos = googlePhotos.map(GooglePhotosClient.convertToPhoto);

      if (token) {
        setPhotos(prev => [...prev, ...convertedPhotos]);
      } else {
        setPhotos(convertedPhotos);
      }

      setPageToken(response.data?.nextPageToken);
      setHasMore(!!response.data?.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, loading]);

  // Initial load
  useEffect(() => {
    if (session?.accessToken) {
      loadPhotos();
    }
  }, [session?.accessToken, loadPhotos]);

  // Infinite scroll
  const lastPhotoRefCallback = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && pageToken) {
        loadPhotos(pageToken);
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, pageToken, loadPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    if (enableSelection && onPhotoSelect) {
      onPhotoSelect(photo);
    }
  };

  const retryLoad = () => {
    setError(null);
    loadPhotos();
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-wood-600 mb-4">Please sign in to view your Google Photos</p>
      </div>
    );
  }

  if (error && photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={retryLoad}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotos.has(photo.id);
          const isLast = index === photos.length - 1;
          
          return (
            <div
              key={photo.id}
              ref={isLast ? lastPhotoRefCallback : undefined}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden bg-wood-100 cursor-pointer transition-all duration-200',
                enableSelection && 'hover:ring-2 hover:ring-wood-400',
                isSelected && 'ring-2 ring-wood-500 ring-offset-2',
                enableSelection && 'group'
              )}
              onClick={() => handlePhotoClick(photo)}
            >
              <Image
                src={photo.thumbnail}
                alt={photo.filename}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                loading="lazy"
              />
              
              {/* Selection Overlay */}
              {enableSelection && (
                <div className={cn(
                  'absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200',
                  'group-hover:opacity-100',
                  isSelected && 'opacity-100 bg-wood-500/30'
                )}>
                  <div className={cn(
                    'absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white transition-all duration-200',
                    isSelected ? 'bg-wood-500' : 'bg-transparent'
                  )}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Metadata Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs truncate">{photo.filename}</p>
                <p className="text-white/80 text-xs">
                  {photo.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wood-500"></div>
          <span className="ml-2 text-wood-600">Loading photos...</span>
        </div>
      )}

      {/* Error State (for pagination errors) */}
      {error && photos.length > 0 && (
        <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={() => loadPhotos(pageToken)}
            className="btn-outline text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* End of Photos Message */}
      {!hasMore && photos.length > 0 && (
        <div className="text-center p-4 text-wood-600">
          <p>All photos loaded</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && photos.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 bg-wood-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-wood-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-wood-900 mb-2">No photos found</h3>
          <p className="text-wood-600 mb-4">Your Google Photos library appears to be empty or we couldn't access it.</p>
          <button
            onClick={retryLoad}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotoGrid;