import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'LuthierGram - Instagram Content Manager for Luthiers',
  description: 'Professional content management system for organizing and scheduling luthier build photos and Instagram posts',
  keywords: ['luthier', 'guitar building', 'instagram', 'content management', 'woodworking'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-wood-50 text-wood-900 antialiased">
        <SessionProvider>
          <div id="root">{children}</div>
        </SessionProvider>
      </body>
    </html>
  )
}