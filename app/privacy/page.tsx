import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Danny Courier Privacy Policy — how we collect, use, and protect your personal data in accordance with UK GDPR.',
};

const LAST_UPDATED = '20 February 2026';

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-primary-navy-dark)', color: 'var(--color-text-white)', padding: '6rem 24px 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold-primary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem' }}>
          ← Back to Home
        </a>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text-white)', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Last updated: {LAST_UPDATED}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.82)' }}>
          <Section title="1. Who We Are">XDrive Logistics Ltd (Company Number 13171804), registered at 101 Cornelian Street, Blackburn, BB1 9QL, United Kingdom, is the data controller for personal data collected through this platform.</Section>
          <Section title="2. Data We Collect">We collect: name, email, phone number, business name and address, driver documents (CPC, licence), payment information, IP address and usage data, and delivery history.</Section>
          <Section title="3. How We Use Your Data">We use your data to: provide platform services, verify driver qualifications, process payments, communicate about bookings, improve our services, and comply with legal obligations.</Section>
          <Section title="4. Legal Basis">We process data under Contract, Legal obligation, Legitimate interests, and Consent (for marketing).</Section>
          <Section title="5. Data Sharing">We do not sell data. We share with: drivers/clients to facilitate bookings, payment processors (Stripe), cloud providers (Supabase/AWS), and legal authorities when required.</Section>
          <Section title="6. Data Retention">We retain data for as long as your account is active and up to 7 years after closure for legal purposes.</Section>
          <Section title="7. Your Rights">Under UK GDPR: access, correction, deletion, objection, restriction, portability, and withdrawal of consent. Contact: dannycourierltd@gmail.com</Section>
          <Section title="8. Contact">XDrive Logistics Ltd, 101 Cornelian Street, Blackburn, BB1 9QL. Email: dannycourierltd@gmail.com</Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-gold-primary)', marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ margin: 0 }}>{children}</div>
    </div>
  );
}
