'use client';

const BENEFITS = [
  { icon: '⚡', title: '24/7 Availability', description: 'Round-the-clock service for urgent deliveries. We never sleep so your business never stops.' },
  { icon: '🛡️', title: 'Fully Insured', description: 'Comprehensive goods in transit insurance and public liability coverage for complete peace of mind.' },
  { icon: '📍', title: 'Real-Time Tracking', description: 'Track your shipments live with instant updates and driver location sharing.' },
  { icon: '💰', title: 'Competitive Pricing', description: 'Transparent pricing with no hidden fees. Get instant quotes and pay only for what you need.' },
  { icon: '🚛', title: 'Fleet Variety', description: 'From small vans to large lorries — we have the right vehicle for every load size.' },
  { icon: '🤝', title: 'Dedicated Support', description: 'Personal account managers and responsive customer service whenever you need help.' },
];

export function Benefits() {
  return (
    <section style={{ backgroundColor: '#f8fafc', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0A2239', marginBottom: '1rem' }}>
            Why Choose Danny Courier?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '560px', margin: '0 auto', lineHeight: '1.7' }}>
            Trusted by hundreds of businesses across the UK for reliable, professional logistics solutions.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', transition: 'all 0.3s ease', cursor: 'default', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#D4AF37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{benefit.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0A2239', marginBottom: '0.5rem' }}>{benefit.title}</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
