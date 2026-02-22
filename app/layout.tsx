import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A2239',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://xdrivelogistics.co.uk'),
  title: 'XDrive Logistics LTD - Enterprise Exchange',
  description: 'B2B logistics exchange platform connecting drivers, carriers and brokers across the UK.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'XDrive Logistics LTD - Enterprise Exchange',
    description: 'B2B logistics exchange platform connecting drivers, carriers and brokers across the UK.',
    url: 'https://xdrivelogistics.co.uk',
    siteName: 'XDrive Logistics LTD',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'XDrive Logistics LTD',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XDrive Logistics LTD - Enterprise Exchange',
    description: 'B2B logistics exchange platform connecting drivers, carriers and brokers across the UK.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
