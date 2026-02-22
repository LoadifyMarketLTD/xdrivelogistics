'use client';

import { COMPANY_CONFIG } from '../../../config/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${encodeURIComponent(COMPANY_CONFIG.whatsapp.defaultMessage)}`;

const STEPS = [
  {
    step: '01',
    icon: '📞',
    title: 'Contact Us',
    description: 'Call, WhatsApp or fill in our online form with your collection and delivery details, cargo type, and preferred timing.',
  },
  {
    step: '02',
    icon: '💬',
    title: 'Get a Quote',
    description: 'Receive a competitive, all-inclusive quote within minutes. No hidden fees — the price you see is the price you pay.',
  },
  {
    step: '03',
    icon: '✅',
    title: 'Confirm & Book',
    description: 'Approve the quote and we assign the best-matched driver from our verified network immediately.',
  },
  {
    step: '04',
    icon: '🚛',
    title: 'Track & Receive',
    description: 'Follow your shipment in real time. Get delivery confirmation with proof of delivery photos and signature.',
  },
];

export function HowItWorks() {
  return (
    <section style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0A2239', marginBottom: '1rem' }}>
            How It Works
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
            Book and track your delivery in four simple steps.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {STEPS.map((step, index) => (
            <div key={step.step} style={{ position: 'relative', textAlign: 'center' }}>
              {index < STEPS.length - 1 && (
                <div style={{ display: 'none' }} className="step-connector" />
              )}
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1F3A5F, #274C77)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(31,58,95,0.25)', fontSize: '1.75rem' }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>STEP {step.step}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0A2239', marginBottom: '0.75rem' }}>{step.title}</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0, fontSize: '0.95rem' }}>{step.description}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <a href={WHATSAPP_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', backgroundColor: '#D4AF37', color: '#0A2239', textDecoration: 'none', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8962e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Book Your Delivery Now →
          </a>
        </div>
      </div>
    </section>
  );
}
