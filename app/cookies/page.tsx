import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Danny Courier Cookie Policy — how we use cookies on our website and how you can manage your preferences.',
};

const LAST_UPDATED = '20 February 2026';

export default function CookiesPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-primary-navy-dark)', color: 'var(--color-text-white)', padding: '6rem 24px 4rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold-primary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '2rem' }}>
          ← Back to Home
        </a>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text-white)', marginBottom: '0.5rem' }}>Cookie Policy</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Last updated: {LAST_UPDATED}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'rgba(255,255,255,0.82)' }}>
          <Section title="1. What Are Cookies?">Cookies are small text files placed on your device when you visit a website. They help the website remember your preferences, understand how you use the site, and provide a better experience.</Section>
          <Section title="2. How We Use Cookies">We use strictly necessary cookies for authentication and session management, functional cookies to remember preferences, analytics cookies to understand site usage, and performance cookies to improve platform speed.</Section>
          <Section title="3. Third-Party Cookies">Some cookies are set by: Supabase (authentication), Google Analytics (anonymous usage analytics), and WhatsApp (click-to-chat functionality).</Section>
          <Section title="4. Managing Cookies">You can control cookies through your browser settings. Note that disabling strictly necessary cookies may affect login and core functionality.</Section>
          <Section title="5. Contact Us">XDrive Logistics Ltd, 101 Cornelian Street, Blackburn, BB1 9QL. Email: dannycourierltd@gmail.com</Section>
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
