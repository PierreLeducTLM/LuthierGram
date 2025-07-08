'use client';

import { useSession } from 'next-auth/react';
import { SignInButton } from '@/components/auth/SignInButton';
import PhotoGrid from '@/components/photos/PhotoGrid';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-wood-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-wood-900 mb-2">
              LuthierGram
            </h1>
            <p className="text-xl text-wood-700">
              Professional Instagram Content Manager for Luthiers
            </p>
          </div>
          <SignInButton />
        </div>

        {session ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-wood-900 mb-2">
                Welcome back, {session.user?.name}!
              </h2>
              <p className="text-wood-600">
                Your Google Photos are ready to organize. Start by viewing your photo library below.
              </p>
            </div>

            {/* Photo Grid */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-wood-900 mb-4">
                Your Google Photos
              </h3>
              <PhotoGrid enableSelection={true} />
            </div>
          </div>
        ) : (
          /* Landing Page for Non-Authenticated Users */
          <div className="text-center">
            <div className="card max-w-2xl mx-auto p-8">
              <div className="w-20 h-20 bg-wood-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-wood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-wood-900 mb-4">
                Organize Your Luthier Journey
              </h2>
              <p className="text-wood-600 mb-8">
                Connect your Google Photos to organize your luthier build photos, manage your builds, and schedule your Instagram content with ease.
              </p>
              <div className="space-y-4">
                <SignInButton className="w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-wood-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-wood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-wood-900">Organize Photos</h3>
                    <p className="text-wood-600">Group photos by build projects</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-wood-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-wood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-wood-900">Create Content</h3>
                    <p className="text-wood-600">Generate captions and posts</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-wood-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-wood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-wood-900">Schedule Posts</h3>
                    <p className="text-wood-600">Plan your content calendar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}