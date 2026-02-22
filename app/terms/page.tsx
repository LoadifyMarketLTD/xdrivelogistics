'use client';
import Link from 'next/link';
import { COMPANY_CONFIG } from '../config/company';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FA', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ color: '#1E4E8C', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← Back to Home</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0A2239', marginBottom: '0.5rem' }}>Terms & Conditions</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Last updated: January 2025</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>1. Introduction</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>These Terms and Conditions govern your use of the Danny Courier platform operated by {COMPANY_CONFIG.legalName} (Company No. {COMPANY_CONFIG.companyNumber}). By using our services, you agree to these terms.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>2. Services</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>Danny Courier provides a transport platform connecting businesses with self-employed courier drivers across the UK and Europe. We act as an intermediary and logistics coordinator.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>3. Payment Terms</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>Payment is due as specified on each invoice. {COMPANY_CONFIG.payment.lateFeeAmount} We accept bank transfer and PayPal.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>4. Liability</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>While we take all reasonable precautions, our liability for loss or damage to goods in transit is limited to the declared value of the goods, subject to our insurance coverage. We recommend appropriate goods-in-transit insurance for high-value items.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>5. Contact</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>For any queries regarding these terms, contact us at <a href={`mailto:${COMPANY_CONFIG.email}`} style={{ color: '#1E4E8C' }}>{COMPANY_CONFIG.email}</a>.</p>
        </section>
      </div>
    </div>
  );
}
