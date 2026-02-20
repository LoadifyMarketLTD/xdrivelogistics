import Image from 'next/image'
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
        {/* Company Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <Image
            src="/logo.png"
            alt="XDrive Logistics LTD"
            width={180}
            height={60}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '800',
          color: 'var(--text)',
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: '1.1',
        }}>
          #1 Logistics Platform in the UK
        </h1>
        <p style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          color: 'var(--muted)',
          maxWidth: '800px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          Connecting Verified Drivers with Trusted Carriers
        </p>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--muted-2)',
          maxWidth: '700px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          XDrive Logistics simplifies transport across the UK. Find verified loads instantly or hire professional drivers for your business.
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
            Get Started
          </PrimaryButton>
          <PrimaryButton href="#how-it-works" variant="secondary" size="lg">
            Learn More
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
            label="Verified Drivers" 
          />
          <StatCard 
            icon="✅" 
            value="50,000+" 
            label="Completed Deliveries" 
          />
          <StatCard 
            icon="🛣️" 
            value="1,500+" 
            label="Daily Routes" 
          />
          <StatCard 
            icon="⭐" 
            value="4.8/5" 
            label="Average Rating" 
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
        {['Verified Drivers', 'Available 24/7', 'UK Coverage'].map((badge) => (
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
