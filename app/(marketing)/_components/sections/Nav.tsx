'use client'

export default function Nav() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    }}>
      <div style={{
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'var(--brand)',
            borderRadius: 'var(--r-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '700',
            fontSize: '1.25rem',
          }}>
            X
          </div>
          <div>
            <div style={{
              fontWeight: '700',
              fontSize: '1.125rem',
              color: 'var(--text)',
              lineHeight: '1.2',
            }}>
              XDrive Logistics
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div style={{
          display: 'none',
          gap: '2rem',
          alignItems: 'center',
        }} className="desktop-nav">
          <a href="#services" style={{ color: 'var(--text)', fontWeight: '500', fontSize: '0.9375rem' }}>
            Servicii
          </a>
          <a href="#how-it-works" style={{ color: 'var(--text)', fontWeight: '500', fontSize: '0.9375rem' }}>
            Cum Funcționează
          </a>
          <a href="#benefits" style={{ color: 'var(--text)', fontWeight: '500', fontSize: '0.9375rem' }}>
            Beneficii
          </a>
          <a href="#testimonials" style={{ color: 'var(--text)', fontWeight: '500', fontSize: '0.9375rem' }}>
            Testimoniale
          </a>
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}>
          <a href="tel:07423272138" style={{
            color: 'var(--brand)',
            fontWeight: '600',
            fontSize: '0.9375rem',
            textDecoration: 'none',
            display: 'none',
          }} className="desktop-phone">
            📞 07423 272138
          </a>
          <a
            href="/login"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--r-md)',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: 'var(--text)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            Intră în Cont
          </a>
          <a
            href="/register"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--r-md)',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#fff',
              textDecoration: 'none',
              background: 'var(--brand)',
            }}
          >
            Începe Acum
          </a>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-phone {
            display: inline !important;
          }
        }
      `}</style>
    </nav>
  )
}
