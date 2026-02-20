import Section from '../ui/Section'

export default function Benefits() {
  const benefits = [
    {
      icon: '✅',
      title: 'Full Verification',
      description: 'All drivers go through a rigorous verification process for documents and history.',
    },
    {
      icon: '⚡',
      title: 'Instant Matching',
      description: 'Smart algorithm connecting drivers with the right loads in seconds.',
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Our team is available around the clock for any issue or question.',
    },
    {
      icon: '📈',
      title: 'Grow Your Revenue',
      description: 'Drivers earn more through access to more loads and optimised routes.',
    },
    {
      icon: '🔒',
      title: 'Secure Payments',
      description: 'Secure payment system with guarantee for both parties.',
    },
    {
      icon: '⭐',
      title: 'Rating System',
      description: 'Full transparency through authentic reviews and ratings from real users.',
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
          Why XDrive?
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Benefits That Make a Difference
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
            On-Time Deliveries
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
            Average Rating
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
