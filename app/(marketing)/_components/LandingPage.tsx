'use client'

import Nav from './sections/Nav'
import Hero from './sections/Hero'
import ForDrivers from './sections/ForDrivers'
import ForCompanies from './sections/ForCompanies'
import HowItWorks from './sections/HowItWorks'
import Benefits from './sections/Benefits'
import Testimonials from './sections/Testimonials'
import Footer from './sections/Footer'
import Section from './ui/Section'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      overflowX: 'hidden',
    }}>
      <Nav />
      <Hero />
      
      {/* Services Section */}
      <Section id="services">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '0.75rem',
          }}>
            Serviciile Noastre
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--muted)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Soluții Complete de Transport
          </p>
          <p style={{
            fontSize: '1rem',
            color: 'var(--muted-2)',
            maxWidth: '700px',
            margin: '0.75rem auto 0',
          }}>
            Oferim servicii adaptate atât pentru șoferi independenți, cât și pentru companii de transport de orice dimensiune.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1.5rem',
        }} className="services-grid">
          <ForDrivers />
          <ForCompanies />
        </div>
      </Section>

      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Footer />

      <style jsx>{`
        @media (min-width: 768px) {
          .services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
