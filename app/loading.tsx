'use client'

export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <section style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="xdrive-spinner" />
        <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>Loading…</p>
        <style jsx>{`
          .xdrive-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #C8A64D;
            border-radius: 50%;
            animation: xdrive-spin 0.8s linear infinite;
            margin: 0 auto;
          }
          @keyframes xdrive-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    </main>
  )
}
