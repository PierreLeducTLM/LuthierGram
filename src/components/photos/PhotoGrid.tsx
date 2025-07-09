'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Photo } from '@/types';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  onPhotoSelect?: (photo: Photo) => void;
  selectedPhotos?: Set<string>;
  className?: string;
  enableSelection?: boolean;
  photos?: Photo[];
}

export function PhotoGrid({ 
  onPhotoSelect, 
  selectedPhotos = new Set(), 
  className,
  enableSelection = false,
  photos = []
}: PhotoGridProps) {
  const { data: session } = useSession();

  const handlePhotoClick = (photo: Photo) => {
    if (enableSelection && onPhotoSelect) {
      onPhotoSelect(photo);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-wood-600 mb-4">Please sign in to view your photos</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-wood-600 mb-4">No photos available. Use the photo picker to import photos from Google Photos.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((photo) => {
          const isSelected = selectedPhotos.has(photo.id);
          
          return (
            <div
              key={photo.id}
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
                  'absolute inset-0 bg-wood-900/20 opacity-0 transition-opacity duration-200',
                  'group-hover:opacity-100',
                  isSelected && 'opacity-100 bg-wood-500/30'
                )}>
                  <div className="absolute top-2 right-2">
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 border-white bg-white/20 transition-all duration-200',
                      isSelected && 'bg-wood-500 border-wood-500'
                    )}>
                      {isSelected && (
                        <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">
                  {photo.filename}
                </p>
                <p className="text-white/80 text-xs">
                  {photo.timestamp.toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PhotoGrid;