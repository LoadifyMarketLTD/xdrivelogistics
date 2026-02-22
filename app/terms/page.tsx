import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Danny Courier Terms and Conditions for the use of our transport platform and services.',
};

const LAST_UPDATED = '20 February 2026';

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-primary-navy-dark)', color: 'var(--color-text-white)', padding: '6rem 24px 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold-primary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem' }}>
          ← Back to Home
        </a>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text-white)', marginBottom: '0.5rem' }}>Terms &amp; Conditions</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Last updated: {LAST_UPDATED}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.82)' }}>
          <Section title="1. Introduction">These Terms govern your use of the Danny Courier platform operated by XDrive Logistics Ltd (Company Number 13171804), 101 Cornelian Street, Blackburn, BB1 9QL.</Section>
          <Section title="2. Services">XDrive Logistics Ltd provides an online platform connecting self-employed courier drivers with businesses requiring freight and transport services.</Section>
          <Section title="3. User Accounts">You are responsible for maintaining confidentiality of your login credentials and all activities under your account.</Section>
          <Section title="4. Driver Requirements">All drivers must hold valid CPC qualification, tachograph card, comprehensive goods-in-transit insurance, and other licences required by UK law.</Section>
          <Section title="5. Payments & Fees">Late payments may incur administrative charges of £25 per full week beyond the agreed due date.</Section>
          <Section title="6. Liability">XDrive Logistics Ltd shall not be liable for any indirect, incidental, or consequential loss. Total liability shall not exceed the amount paid in the preceding three months.</Section>
          <Section title="7. Governing Law">These Terms are governed by the laws of England and Wales.</Section>
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
      <p style={{ margin: 0 }}>{children}</p>
    </div>
  );
}
