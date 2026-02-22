'use client';

const TESTIMONIALS = [
  {
    name: 'Sarah Mitchell',
    company: 'Mitchell Wholesale Ltd',
    rating: 5,
    text: 'Danny Courier has been our go-to logistics partner for two years. Always reliable, always on time. The live tracking is a game changer for our operations.',
    avatar: 'SM',
  },
  {
    name: 'James O'Brien',
    company: 'JOB Retail Group',
    rating: 5,
    text: 'Switched from our previous courier and never looked back. The pricing is transparent, the drivers are professional, and the app makes booking effortless.',
    avatar: 'JO',
  },
  {
    name: 'Priya Patel',
    company: 'Patel Distribution',
    rating: 5,
    text: 'We handle 50+ shipments a week through Danny Courier. Their managed account service saves us hours of admin every month.',
    avatar: 'PP',
  },
  {
    name: 'Tom Williams',
    company: 'Williams Manufacturing',
    rating: 5,
    text: 'The European freight service has opened up new markets for us. Customs paperwork, tracking, everything is handled seamlessly.',
    avatar: 'TW',
  },
  {
    name: 'Lisa Chen',
    company: 'Chen E-Commerce',
    rating: 5,
    text: 'Fast, reliable and the WhatsApp updates keep me in the loop without having to log into anything. Perfect for a small business owner.',
    avatar: 'LC',
  },
  {
    name: 'Mark Thompson',
    company: 'Thompson Tools',
    rating: 5,
    text: 'The dedicated account manager knows our business inside out. It feels like having an in-house logistics team without the overhead.',
    avatar: 'MT',
  },
];

export function Testimonials() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #1F3A5F 0%, #0A2239 100%)', padding: '5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
            What Our Customers Say
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
            Trusted by hundreds of businesses across the UK and Europe.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.75rem', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <div style={{ display: 'flex', marginBottom: '0.75rem' }}>
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i} style={{ color: i < t.rating ? '#D4AF37' : 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>{star}</span>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', marginBottom: '1.25rem', fontStyle: 'italic', fontSize: '0.95rem' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#0A2239', flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
