'use client';
import Link from 'next/link';
import { COMPANY_CONFIG } from '../config/company';

export default function CookiesPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FA', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ color: '#1E4E8C', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← Back to Home</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0A2239', marginBottom: '0.5rem' }}>Cookie Policy</h1>
        <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Last updated: January 2025</p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>What Are Cookies?</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>Cookies are small text files placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>How We Use Cookies</h2>
          <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1rem' }}>We use cookies for the following purposes:</p>
          <ul style={{ color: '#374151', lineHeight: 1.7, paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Essential cookies:</strong> Required for the website to function properly, including authentication and session management.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Functional cookies:</strong> Remember your preferences and settings to improve your experience.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website so we can improve it.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Your Choices</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit and some services and functionalities may not work.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Contact Us</h2>
          <p style={{ color: '#374151', lineHeight: 1.7 }}>If you have questions about our use of cookies, please contact us at <a href={`mailto:${COMPANY_CONFIG.email}`} style={{ color: '#1E4E8C' }}>{COMPANY_CONFIG.email}</a>.</p>
        </section>
      </div>
    </div>
  );
}
