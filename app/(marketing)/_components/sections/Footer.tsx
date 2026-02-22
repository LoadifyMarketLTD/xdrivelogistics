'use client';

import { COMPANY_CONFIG } from '../../../config/company';

const WHATSAPP_URL = `https://wa.me/${COMPANY_CONFIG.whatsapp.number}?text=${encodeURIComponent(COMPANY_CONFIG.whatsapp.defaultMessage)}`;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#060f1a', color: 'rgba(255,255,255,0.75)', padding: '4rem 0 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', marginBottom: '0.75rem' }}>
              Danny Courier
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
              Professional transport services across UK &amp; Europe. Available 24/7 for all your logistics needs.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={WHATSAPP_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', backgroundColor: '#2E7D32', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                💬 WhatsApp
              </a>
              <a href={`tel:${COMPANY_CONFIG.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                📞 Call
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Services</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Same-Day Courier', 'Express Delivery', 'Pallet Transport', 'Freight Forwarding', 'European Logistics', 'Managed Accounts'].map((service) => (
                <li key={service} style={{ marginBottom: '0.5rem' }}>
                  <a href={WHATSAPP_URL} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[{ label: 'About Us', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms & Conditions', href: '/terms' }, { label: 'Cookie Policy', href: '/cookies' }].map((link) => (
                <li key={link.label} style={{ marginBottom: '0.5rem' }}>
                  <a href={link.href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                <a href={`tel:${COMPANY_CONFIG.phone}`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>{COMPANY_CONFIG.phoneDisplay}</a>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                <a href={`mailto:${COMPANY_CONFIG.email}`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.875rem' }}>{COMPANY_CONFIG.email}</a>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
                <address style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontStyle: 'normal', lineHeight: '1.6' }}>
                  {COMPANY_CONFIG.address.street}<br />
                  {COMPANY_CONFIG.address.city}, {COMPANY_CONFIG.address.postcode}<br />
                  {COMPANY_CONFIG.address.country}
                </address>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
            © {currentYear} {COMPANY_CONFIG.legalName}. Company No. {COMPANY_CONFIG.companyNumber}. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)' }}>
            Registered in England &amp; Wales
          </p>
        </div>
      </div>
    </footer>
  );
}
