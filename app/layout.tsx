import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: 'XDrive Logistics - Platforma #1 de Logistică în UK',
  description: 'Conectăm șoferi verificați cu transportatori de încredere. Peste 2,500+ șoferi, 50,000+ livrări complete. Plată în 24-48 ore, tracking în timp real.',
  keywords: ['logistics', 'transport UK', 'șoferi verificați', 'încărcături', 'transport marfă', 'courier UK'],
  openGraph: {
    title: 'XDrive Logistics - Platforma #1 de Logistică în UK',
    description: 'Conectăm șoferi verificați cu transportatori de încredere. Peste 2,500+ șoferi, 50,000+ livrări complete.',
    type: 'website',
    locale: 'ro_RO',
    siteName: 'XDrive Logistics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XDrive Logistics - Platforma #1 de Logistică în UK',
    description: 'Conectăm șoferi verificați cu transportatori de încredere. Peste 2,500+ șoferi, 50,000+ livrări complete.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '', // Add Google Search Console verification code if available
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
