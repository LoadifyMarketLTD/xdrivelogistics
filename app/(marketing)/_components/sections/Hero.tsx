import Section from '../ui/Section'
import StatCard from '../ui/StatCard'
import PrimaryButton from '../ui/PrimaryButton'

export default function Hero() {
  return (
    <Section>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          color: 'var(--text)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: '1.1',
        }}>
          Platforma #1 de Logistică în UK
        </h1>
        <p style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          color: 'var(--muted)',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          Conectăm Șoferi Verificați cu Transportatori de Încredere
        </p>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted-2)',
          maxWidth: '700px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          Platforma XDrive Logistics simplifică transportul în UK. Găsești încărcături verificate instant sau angajezi șoferi profesioniști pentru afacerea ta.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '4rem',
        }}>
          <PrimaryButton href="/register" variant="primary" size="lg">
            Începe Acum
          </PrimaryButton>
          <PrimaryButton href="#how-it-works" variant="secondary" size="lg">
            Află Mai Multe
          </PrimaryButton>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginTop: '3rem',
        }}>
          <StatCard 
            icon="🚛" 
            value="2,500+" 
            label="Șoferi Verificați" 
          />
          <StatCard 
            icon="✅" 
            value="50,000+" 
            label="Livrări Complete" 
          />
          <StatCard 
            icon="🛣️" 
            value="1,500+" 
            label="Rute Zilnice" 
          />
          <StatCard 
            icon="⭐" 
            value="4.8/5" 
            label="Rating Mediu" 
          />
        </div>
      </div>

      {/* Feature badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '3rem',
      }}>
        {['Șoferi Verificați', 'Disponibil 24/7', 'Acoperire UK'].map((badge) => (
          <div
            key={badge}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text)',
            }}
          >
            ✓ {badge}
          </div>
        ))}
      </div>
    </Section>
  )
}
