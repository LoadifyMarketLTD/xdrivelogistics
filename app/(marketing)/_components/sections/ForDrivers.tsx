'use client';

import { COMPANY_CONFIG } from '../../../config/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${encodeURIComponent('Hello, I am a driver interested in joining your network')}`;

const FEATURES = [
  { icon: '💼', title: 'Steady Work', description: 'Access a consistent flow of jobs. No more waiting for loads — our platform keeps you moving.' },
  { icon: '💰', title: 'Fast Payments', description: 'Get paid quickly with weekly settlements. No chasing invoices or long payment delays.' },
  { icon: '📱', title: 'Easy-to-Use App', description: 'Accept jobs, update statuses, upload POD photos and manage your schedule from your phone.' },
  { icon: '🗺️', title: 'UK & European Runs', description: 'Local, national and European loads available to match your operating area and vehicle type.' },
  { icon: '🆓', title: 'Free to Join', description: 'No joining fees or hidden costs. Sign up, verify your documents, and start earning.' },
  { icon: '📞', title: '24/7 Driver Support', description: 'Our operations team is always available to help you with any issues on the road.' },
];

export function ForDrivers() {
  return (
    <section style={{ backgroundColor: '#f8fafc', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '100px', padding: '0.375rem 1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#2E7D32', fontWeight: 600 }}>For Drivers</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0A2239', marginBottom: '1rem' }}>
            Drive With Danny Courier
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
            Join our growing network of professional drivers and access regular, well-paid loads across the UK and Europe.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {FEATURES.map((feature) => (
            <div key={feature.title} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', transition: 'all 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#2E7D32'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0A2239', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>{feature.description}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <a href={WHATSAPP_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', backgroundColor: '#2E7D32', color: '#FFFFFF', textDecoration: 'none', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1B5E20'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2E7D32'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Apply to Drive →
          </a>
        </div>
      </div>
    </section>
  );
}
