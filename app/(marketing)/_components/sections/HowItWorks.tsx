import Section from '../ui/Section'

export default function HowItWorks() {
  const driverSteps = [
    {
      number: '01',
      title: 'Creează Cont',
      description: 'Înregistrează-te gratuit și completează profilul cu documentele necesare.',
    },
    {
      number: '02',
      title: 'Găsește Încărcături',
      description: 'Caută încărcături disponibile pe ruta ta și aplică instant.',
    },
    {
      number: '03',
      title: 'Confirmă și Livrează',
      description: 'Primești confirmare, preiei marfa și livrezi la destinație.',
    },
    {
      number: '04',
      title: 'Primești Plata',
      description: 'Banii îți intră în cont în 24-48 ore după livrare.',
    },
  ]

  const companySteps = [
    {
      number: '01',
      title: 'Înregistrează Compania',
      description: 'Creează cont business și adaugă detaliile companiei tale.',
    },
    {
      number: '02',
      title: 'Postează Încărcătura',
      description: 'Adaugă detaliile transportului și bugetul disponibil.',
    },
    {
      number: '03',
      title: 'Alege Șoferul',
      description: 'Primești oferte și selectezi șoferul potrivit.',
    },
    {
      number: '04',
      title: 'Urmărește Livrarea',
      description: 'Tracking în timp real și confirmare la destinație.',
    },
  ]

  const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--brand)',
        marginBottom: '0.75rem',
        opacity: '0.5',
      }}>
        {number}
      </div>
      <h4 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--text)',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h4>
      <p style={{
        fontSize: '0.9375rem',
        color: 'var(--muted)',
        lineHeight: '1.6',
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  )

  return (
    <Section id="how-it-works">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '0.75rem',
        }}>
          Cum Funcționează
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Simplu și Eficient
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '3rem',
      }}>
        {/* For Drivers */}
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Pentru Șoferi
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {driverSteps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>

        {/* For Companies */}
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Pentru Companii
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {companySteps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
