'use client';

import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { KPIStats } from './sections/KPIStats';
import { ForDrivers } from './sections/ForDrivers';
import { ForCompanies } from './sections/ForCompanies';
import { HowItWorks } from './sections/HowItWorks';
import { Benefits } from './sections/Benefits';
import { Testimonials } from './sections/Testimonials';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';

export function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-primary-navy-dark)',
        overflow: 'hidden',
      }}
    >
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <KPIStats />
      <div id="for-drivers">
        <ForDrivers />
      </div>
      <div id="for-companies">
        <ForCompanies />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Benefits />
      <Testimonials />
      <FAQ />
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
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
            Our Services
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--muted)',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Complete Transport Solutions
          </p>
          <p style={{
            fontSize: '1rem',
            color: 'var(--muted-2)',
            maxWidth: '700px',
            margin: '0.75rem auto 0',
          }}>
            We offer services tailored for both independent drivers and transport companies of any size.
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
