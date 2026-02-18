import Section from '../ui/Section'

export default function Benefits() {
  const benefits = [
    {
      icon: '✅',
      title: 'Verificare Completă',
      description: 'Toți șoferii trec prin un proces riguros de verificare a documentelor și istoricului.',
    },
    {
      icon: '⚡',
      title: 'Matching Instant',
      description: 'Algoritm inteligent care conectează șoferii cu încărcăturile potrivite în câteva secunde.',
    },
    {
      icon: '💬',
      title: 'Suport 24/7',
      description: 'Echipa noastră este disponibilă non-stop pentru orice problemă sau întrebare.',
    },
    {
      icon: '📈',
      title: 'Crește Veniturile',
      description: 'Șoferii câștigă mai mult prin acces la mai multe încărcături și rute optimizate.',
    },
    {
      icon: '🔒',
      title: 'Plăți Securizate',
      description: 'Sistem de plată sigur cu garanție pentru ambele părți.',
    },
    {
      icon: '⭐',
      title: 'Sistem de Rating',
      description: 'Transparență totală prin recenzii și rating-uri autentice de la utilizatori reali.',
    },
  ]

  return (
    <Section id="benefits">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '0.75rem',
        }}>
          De Ce XDrive?
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Beneficii care fac Diferența
        </p>
      </div>

      {/* Top Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
      }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'var(--brand)',
            marginBottom: '0.5rem',
          }}>
            99%
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--muted)',
          }}>
            Livrări la Timp
          </div>
        </div>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'var(--brand)',
            marginBottom: '0.5rem',
          }}>
            4.8
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--muted)',
          }}>
            Rating Mediu
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}>
              {benefit.icon}
            </div>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '0.5rem',
            }}>
              {benefit.title}
            </h4>
            <p style={{
              fontSize: '0.9375rem',
              color: 'var(--muted)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}
