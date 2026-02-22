'use client';
import Link from 'next/link';
import { COMPANY_CONFIG } from '../config/company';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FA', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ color: '#1E4E8C', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← Back to Home</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0A2239', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Last updated: January 2025</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Who We Are</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>{COMPANY_CONFIG.legalName} (&quot;Danny Courier&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates dannycourierltd.co.uk. Company Registration Number: {COMPANY_CONFIG.companyNumber}. Registered address: {COMPANY_CONFIG.address.full}.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Information We Collect</h2>
          <ul style={{ color: '#374151', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Contact information (name, email, phone number) when you get in touch</li>
            <li style={{ marginBottom: '0.5rem' }}>Job and delivery details for transport services</li>
            <li style={{ marginBottom: '0.5rem' }}>Account credentials for platform users</li>
            <li style={{ marginBottom: '0.5rem' }}>Usage data and analytics to improve our services</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>How We Use Your Information</h2>
          <ul style={{ color: '#374151', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>To provide and improve our transport services</li>
            <li style={{ marginBottom: '0.5rem' }}>To communicate with you about your jobs and deliveries</li>
            <li style={{ marginBottom: '0.5rem' }}>To process invoices and payments</li>
            <li style={{ marginBottom: '0.5rem' }}>To comply with legal obligations</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Your Rights</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>Under UK GDPR, you have the right to access, rectify, erase, and port your data. To exercise these rights, contact us at <a href={`mailto:${COMPANY_CONFIG.email}`} style={{ color: '#1E4E8C' }}>{COMPANY_CONFIG.email}</a>.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Contact</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>For privacy enquiries: <a href={`mailto:${COMPANY_CONFIG.email}`} style={{ color: '#1E4E8C' }}>{COMPANY_CONFIG.email}</a> | {COMPANY_CONFIG.address.full}</p>
        </section>
      </div>
    </div>
  );
}
