export default function ForDrivers() {
  const features = [
    'Acces la mii de încărcături zilnice',
    'Plată în 24-48 ore',
    'Rute optimizate GPS',
    'Suport 24/7',
  ]

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '2rem',
      boxShadow: 'var(--shadow-sm)',
      height: '100%',
    }}>
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '1rem',
      }}>
        🚚
      </div>
      <h3 style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '0.75rem',
      }}>
        Pentru Șoferi
      </h3>
      <p style={{
        fontSize: '1rem',
        color: 'var(--muted)',
        marginBottom: '1.5rem',
        lineHeight: '1.6',
      }}>
        Găsești încărcături verificate în toată UK. Plată garantată și program flexibil.
      </p>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}>
        {features.map((feature, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              fontSize: '0.9375rem',
              color: 'var(--text)',
            }}
          >
            <span style={{ color: 'var(--success)', fontWeight: '700' }}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
