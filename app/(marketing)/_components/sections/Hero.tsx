'use client';

import { useState, useEffect } from 'react';
import { COMPANY_CONFIG } from '../../../config/company';
import { LoginModal } from '../../../components/LoginModal';

const WHATSAPP_URL = `https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${encodeURIComponent(COMPANY_CONFIG.whatsapp.defaultMessage)}`;

export function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loadsCount, setLoadsCount] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadsCount(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(1200, Math.min(1300, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ background: 'linear-gradient(135deg, #1F3A5F 0%, #274C77 60%, #0A2239 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '5rem', paddingBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', width: '100%', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(46,125,50,0.15)', border: '1px solid rgba(46,125,50,0.3)', borderRadius: '100px', padding: '0.375rem 1rem', marginBottom: '2rem' }}>
            <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'inline-block' }} />
            <span style={{ fontSize: '0.875rem', color: '#81C784', fontWeight: 600 }}>{loadsCount.toLocaleString()} Loads Active Now</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: '1.1', marginBottom: '1.5rem', color: '#FFFFFF' }}>
            Professional Transport Services<br />
            <span style={{ color: '#D4AF37' }}>Across UK &amp; Europe</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', lineHeight: '1.7', maxWidth: '520px' }}>
            24/7 reliable courier and freight services. Express delivery, pallet transport, and comprehensive logistics solutions for your business needs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <a href={WHATSAPP_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', backgroundColor: '#2E7D32', color: '#FFFFFF', textDecoration: 'none', boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1B5E20'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2E7D32'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              🚀 Get Instant Quote
            </a>
            <a href={`tel:${COMPANY_CONFIG.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '10px', backgroundColor: 'transparent', color: '#FFFFFF', border: '2px solid rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'all 0.3s ease' }}>
              📞 {COMPANY_CONFIG.phoneDisplay}
            </a>
            <button onClick={() => setIsLoginModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.05rem', fontWeight: 600, borderRadius: '10px', backgroundColor: 'transparent', color: '#D4AF37', border: '2px solid rgba(212,175,55,0.5)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              🔐 Driver Login
            </button>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['✓ Fully Insured', '✓ 24/7 Available', '✓ 5,000+ Deliveries'].map((badge) => (
              <span key={badge} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{badge}</span>
            ))}
          </div>
        </div>
        <div className="hero-mockup" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>Live Dashboard</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(46,125,50,0.2)', border: '1px solid rgba(46,125,50,0.4)', borderRadius: '100px', padding: '0.25rem 0.75rem' }}>
              <span className="live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', color: '#81C784', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Active Load #DC-4821</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(46,125,50,0.25)', color: '#81C784', borderRadius: '6px', padding: '0.2rem 0.5rem' }}>In Transit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Manchester</span>
              <span style={{ color: '#D4AF37' }}>→</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>London</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #2E7D32, #4CAF50)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>68% complete</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>ETA: 2h 15m</span>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#0A2239', flexShrink: 0 }}>DC</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.2rem' }}>Driver Available</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Response time: &lt;5 min</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D4AF37' }}>★ 4.9</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Top Rated</div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }
        .live-dot { animation: pulse 2s ease-in-out infinite; }
        @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr !important; } .hero-mockup { display: none; } }
      `}</style>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
}
