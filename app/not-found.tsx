import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 – Page Not Found | XDrive Logistics LTD',
}

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <section style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: '800', color: '#C8A64D', margin: '0 0 0.25rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#C8A64D',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Return Home
        </Link>
      </section>
    </main>
  )
}
