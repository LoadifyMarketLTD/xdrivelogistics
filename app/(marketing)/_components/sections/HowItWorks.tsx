import Section from '../ui/Section'

export default function HowItWorks() {
  const driverSteps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Register for free and complete your profile with the required documents.',
    },
    {
      number: '02',
      title: 'Find Loads',
      description: 'Search for available loads on your route and apply instantly.',
    },
    {
      number: '03',
      title: 'Confirm and Deliver',
      description: 'Receive confirmation, pick up the goods and deliver to destination.',
    },
    {
      number: '04',
      title: 'Receive Payment',
      description: 'Funds arrive in your account within 24–48 hours after delivery.',
    },
  ]

  const companySteps = [
    {
      number: '01',
      title: 'Register Your Company',
      description: 'Create a business account and add your company details.',
    },
    {
      number: '02',
      title: 'Post a Load',
      description: 'Add transport details and your available budget.',
    },
    {
      number: '03',
      title: 'Choose a Driver',
      description: 'Receive bids and select the right driver.',
    },
    {
      number: '04',
      title: 'Track Delivery',
      description: 'Real-time tracking and destination confirmation.',
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
          How It Works
        </h2>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Simple and Efficient
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
            For Drivers
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
            For Companies
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
