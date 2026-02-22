'use client';

import { COMPANY_CONFIG } from '../../../config/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${encodeURIComponent('Hello, I would like to discuss business transport solutions')}`;

const FEATURES = [
  { icon: '📋', title: 'Managed Accounts', description: 'Dedicated account manager and monthly invoicing for businesses with regular shipping needs.' },
  { icon: '🔄', title: 'Regular Collections', description: 'Schedule recurring collections and deliveries to streamline your supply chain operations.' },
  { icon: '📊', title: 'Reporting & Analytics', description: 'Detailed reports on your deliveries, costs, and performance metrics via your dashboard.' },
  { icon: '🌍', title: 'Europe-Wide Coverage', description: 'International freight forwarding across Europe with customs documentation support.' },
  { icon: '🏭', title: 'Warehouse to Door', description: 'Complete supply chain solutions from warehouse pickup to final-mile delivery.' },
  { icon: '💳', title: 'Flexible Payment', description: '7, 14, or 30-day payment terms available for approved business accounts.' },
];

export function ForCompanies() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #0A2239 0%, #1F3A5F 100%)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '0.375rem 1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#D4AF37', fontWeight: 600 }}>For Businesses</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
            Logistics Solutions for Companies
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
            Streamline your business logistics with our comprehensive managed transport services.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {FEATURES.map((feature) => (
            <div key={feature.title} style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.75rem', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>{feature.description}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <a href={WHATSAPP_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', backgroundColor: '#D4AF37', color: '#0A2239', textDecoration: 'none', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8962e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Discuss Business Account →
          </a>
        </div>
      </div>
    </section>
  );
}
