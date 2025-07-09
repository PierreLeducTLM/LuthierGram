'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Photo } from '@/types';

interface ModernPhotoPickerProps {
  onPhotosSelected?: (photos: Photo[]) => void;
  className?: string;
  maxItems?: number;
  multiSelect?: boolean;
}

declare global {
  interface Window {
    google: {
      picker: {
        PickerBuilder: any;
        ViewId: any;
        Action: any;
        Document: any;
        Feature: any;
        Response: any;
      };
    };
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        getAuthInstance: () => any;
      };
    };
  }
}

export function ModernPhotoPicker({ 
  onPhotosSelected, 
  className = '',
  maxItems = 50,
  multiSelect = true 
}: ModernPhotoPickerProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Debug logging function
  const addDebugInfo = useCallback((message: string) => {
    console.log('[PhotoPicker Debug]', message);
    setDebugInfo(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Load Google APIs
  useEffect(() => {
    const loadGoogleAPIs = async () => {
      try {
        addDebugInfo('Starting to load Google APIs...');
        
        // Check environment variables
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const developerKey = process.env.NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY;
        
        addDebugInfo(`Client ID available: ${!!clientId} (${clientId?.substring(0, 20)}...)`);
        addDebugInfo(`Developer Key available: ${!!developerKey} (${developerKey?.substring(0, 20)}...)`);
        
        if (!clientId) {
          throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in environment');
        }
        if (!developerKey) {
          throw new Error('NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY not found in environment');
        }

        // Load Google Picker API
        if (!window.google?.picker) {
          addDebugInfo('Loading Google Picker API scripts...');
          
          // Load the GAPI library first
          await new Promise<void>((resolve, reject) => {
            if (window.gapi) {
              addDebugInfo('GAPI already loaded');
              resolve();
              return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
              addDebugInfo('GAPI script loaded');
              resolve();
            };
            script.onerror = () => {
              addDebugInfo('Failed to load GAPI script');
              reject(new Error('Failed to load GAPI script'));
            };
            document.head.appendChild(script);
          });
          
          // Load the picker
          await new Promise<void>((resolve, reject) => {
            addDebugInfo('Loading picker via GAPI...');
            window.gapi.load('picker', () => {
              addDebugInfo('Picker loaded successfully');
              resolve();
            });
          });
        } else {
          addDebugInfo('Google Picker already available');
        }
        
        addDebugInfo('Google APIs loaded successfully');
        setApiReady(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading APIs';
        addDebugInfo(`Failed to load Google APIs: ${errorMessage}`);
        console.error('Failed to load Google APIs:', err);
        setError(`Failed to load Google APIs: ${errorMessage}. Please refresh the page.`);
      }
    };

    loadGoogleAPIs();
  }, [addDebugInfo]);

  const convertPickerDocumentToPhoto = useCallback((doc: any): Photo => {
    const id = doc[window.google.picker.Document.ID] || `picker-${Date.now()}-${Math.random()}`;
    const url = doc[window.google.picker.Document.URL] || '';
    const name = doc[window.google.picker.Document.NAME] || 'Unknown';
    const thumbnails = doc[window.google.picker.Document.THUMBNAILS];
    
    addDebugInfo(`Converting document: ${name} (ID: ${id})`);
    
    return {
      id,
      googlePhotoId: id,
      url,
      thumbnail: thumbnails?.[0]?.url || url,
      filename: name,
      timestamp: new Date(),
      posted: false,
      metadata: {
        width: parseInt(thumbnails?.[0]?.width || '800'),
        height: parseInt(thumbnails?.[0]?.height || '600'),
      },
    };
  }, [addDebugInfo]);

  const openGoogleDrivePicker = useCallback(async () => {
    if (!session?.accessToken || !apiReady) {
      setError('Authentication required. Please sign in.');
      addDebugInfo('Cannot open picker: no session or API not ready');
      return;
    }

    setIsLoading(true);
    setError(null);
    addDebugInfo('Opening Google Drive Picker...');

    try {
      const developerKey = process.env.NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!developerKey) {
        throw new Error('Google Developer Key not configured. Please add NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY to your environment variables.');
      }
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      }

      // Extract project number from client ID (before the first dash)
      const projectNumber = clientId.split('-')[0];
      addDebugInfo(`Using Project Number: ${projectNumber} (from Client ID: ${clientId.substring(0, 20)}...)`);
      addDebugInfo(`Using Developer Key: ${developerKey.substring(0, 20)}...`);
      
      // Validate that project number is numeric
      if (!/^\d+$/.test(projectNumber)) {
        throw new Error(`Invalid Project Number format: ${projectNumber}. Expected numeric project ID only.`);
      }

      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS)
        .addView(window.google.picker.ViewId.DOCS_IMAGES)
        .setOAuthToken(session.accessToken)
        .setDeveloperKey(developerKey)
        .setAppId(projectNumber)
        .setCallback((data: any) => {
          addDebugInfo(`Picker callback received with action: ${data[window.google.picker.Response.ACTION]}`);
          
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            const docs = data[window.google.picker.Response.DOCUMENTS];
            addDebugInfo(`Documents received: ${docs?.length || 0}`);
            
            if (docs && docs.length > 0) {
              const selectedPhotos = docs
                .slice(0, maxItems)
                .map(convertPickerDocumentToPhoto);
              addDebugInfo(`Converted ${selectedPhotos.length} photos`);
              onPhotosSelected?.(selectedPhotos);
            }
          } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
            addDebugInfo('User cancelled picker');
          }
          setIsLoading(false);
        })
        .setMaxItems(maxItems);

      if (multiSelect) {
        picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        addDebugInfo('Multi-select enabled');
      }

      addDebugInfo('Building and showing picker...');
      const builtPicker = picker.build();
      addDebugInfo('Picker built successfully, setting visible...');
      
      try {
        builtPicker.setVisible(true);
        addDebugInfo('Picker.setVisible(true) called - dialog should appear');
      } catch (err) {
        addDebugInfo(`Error calling setVisible: ${err}`);
        throw err;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open photo picker';
      addDebugInfo(`Error opening picker: ${errorMessage}`);
      console.error('Error opening Google Drive Picker:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [session?.accessToken, apiReady, maxItems, multiSelect, convertPickerDocumentToPhoto, onPhotosSelected, addDebugInfo]);

  const openGooglePhotosPicker = useCallback(async () => {
    if (!session?.accessToken || !apiReady) {
      setError('Authentication required. Please sign in.');
      addDebugInfo('Cannot open photos picker: no session or API not ready');
      return;
    }

    setIsLoading(true);
    setError(null);
    addDebugInfo('Opening Google Photos Picker...');

    try {
      const developerKey = process.env.NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!developerKey) {
        throw new Error('Google Developer Key not configured. Please add NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY to your environment variables.');
      }
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
      }

      // Extract project number from client ID (before the first dash)
      const projectNumber = clientId.split('-')[0];
      addDebugInfo(`Using Project Number: ${projectNumber} (from Client ID: ${clientId.substring(0, 20)}...)`);
      
      // Validate that project number is numeric
      if (!/^\d+$/.test(projectNumber)) {
        throw new Error(`Invalid Project Number format: ${projectNumber}. Expected numeric project ID only.`);
      }

      // Use Google Drive picker focused on images (since Google Photos Library API is deprecated)
      // This will show photos stored in Google Drive, including those synced from Google Photos
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS_IMAGES)
        .addView(window.google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS)
        .setOAuthToken(session.accessToken)
        .setDeveloperKey(developerKey)
        .setAppId(projectNumber)
        .setCallback((data: any) => {
          addDebugInfo(`Photos picker callback received with action: ${data[window.google.picker.Response.ACTION]}`);
          
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            const docs = data[window.google.picker.Response.DOCUMENTS];
            addDebugInfo(`Photos documents received: ${docs?.length || 0}`);
            
            if (docs && docs.length > 0) {
              const selectedPhotos = docs
                .slice(0, maxItems)
                .map(convertPickerDocumentToPhoto);
              addDebugInfo(`Converted ${selectedPhotos.length} photos from Photos picker`);
              onPhotosSelected?.(selectedPhotos);
            }
          } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
            addDebugInfo('User cancelled photos picker');
          }
          setIsLoading(false);
        })
        .setMaxItems(maxItems);

      if (multiSelect) {
        picker.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
        addDebugInfo('Multi-select enabled for photos picker');
      }

      addDebugInfo('Building and showing photos picker...');
      const builtPicker = picker.build();
      addDebugInfo('Photos picker built successfully, setting visible...');
      
      try {
        builtPicker.setVisible(true);
        addDebugInfo('Photos picker.setVisible(true) called - dialog should appear');
      } catch (err) {
        addDebugInfo(`Error calling setVisible on photos picker: ${err}`);
        throw err;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open photo picker';
      addDebugInfo(`Error opening photos picker: ${errorMessage}`);
      console.error('Error opening Google Photos Picker:', err);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [session?.accessToken, apiReady, maxItems, multiSelect, convertPickerDocumentToPhoto, onPhotosSelected, addDebugInfo]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-wood-300 rounded-lg">
        <p className="text-wood-600 mb-4">Please sign in to access your photos</p>
      </div>
    );
  }

  if (!apiReady) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-wood-300 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wood-500 mb-4"></div>
        <p className="text-wood-600">Loading Google APIs...</p>
        {debugInfo.length > 0 && (
          <div className="mt-4 text-xs text-wood-500 text-left">
            <details>
              <summary className="cursor-pointer">Debug Info</summary>
              <div className="mt-2 bg-wood-100 p-2 rounded font-mono text-xs max-h-32 overflow-y-auto">
                {debugInfo.map((info, i) => (
                  <div key={i}>{info}</div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info Panel */}
      {debugInfo.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-700 font-medium">
              Debug Information ({debugInfo.length} entries)
            </summary>
            <div className="mt-2 bg-gray-100 p-2 rounded font-mono text-xs max-h-40 overflow-y-auto">
              {debugInfo.map((info, i) => (
                <div key={i} className="border-b border-gray-200 pb-1 mb-1 last:border-b-0">{info}</div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Modern Photo Selection (2025)
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-3">
                Choose your photo source below. This uses Google's official Picker API for secure photo access.
              </p>
              <div className="text-xs">
                <strong>Setup Requirements:</strong>
                <ul className="list-disc ml-4 mt-1">
                  <li>Google Cloud Console project with Drive API enabled</li>
                  <li>OAuth 2.0 credentials with proper redirect URIs</li>
                  <li>API key with Google Picker API access</li>
                  <li>Third-party cookies enabled in Chrome (see below)</li>
                </ul>
                
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>Chrome Cookie Issue:</strong> If you see 403 errors, enable third-party cookies:
                  <br />
                  Chrome Settings → Privacy and security → Third-party cookies → "Allow third-party cookies"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Photos Picker */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-wood-900">Google Photos/Drive Images</h3>
              <p className="text-sm text-wood-600">Access photos from Google Drive (including synced Photos)</p>
            </div>
          </div>
          <button
            onClick={openGooglePhotosPicker}
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Opening...
              </div>
            ) : (
              'Select from Photos/Drive'
            )}
          </button>
        </div>

        {/* Google Drive Picker */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-wood-900">Google Drive</h3>
              <p className="text-sm text-wood-600">Access images and videos from Google Drive</p>
            </div>
          </div>
          <button
            onClick={openGoogleDrivePicker}
            disabled={isLoading}
            className="w-full btn-secondary"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-wood-600 mr-2"></div>
                Opening...
              </div>
            ) : (
              'Select from Google Drive'
            )}
          </button>
          </div>
      </div>

      <div className="text-center text-sm text-wood-500 mt-4">
        <p>
          {multiSelect ? `Select up to ${maxItems} photos` : 'Select one photo'} from your preferred source
        </p>
      </div>
    </div>
  );
}

export default ModernPhotoPicker; 