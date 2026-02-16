import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'XDrive Logistics LTD',
  description: 'XDrive Logistics provides UK courier transport: same-day, next-day, pallets, multi-drop and dedicated van services.',
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
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
