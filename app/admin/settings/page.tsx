'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { COMPANY_CONFIG } from '../../config/company';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>⚙️ Settings</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: '#1F3A5F', marginBottom: '1rem', fontSize: '1.1rem' }}>Account</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Signed in as: <strong>{user?.email}</strong></p>
          </div>
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, color: '#1F3A5F', marginBottom: '1rem', fontSize: '1.1rem' }}>Company Details</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Company Name</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.name}</dd>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Legal Name</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.legalName}</dd>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Company No.</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.companyNumber}</dd>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Email</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.email}</dd>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Phone</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.phoneDisplay}</dd>
              <dt style={{ color: '#6b7280', fontWeight: 600 }}>Address</dt><dd style={{ margin: 0 }}>{COMPANY_CONFIG.address.full}</dd>
            </dl>
          </div>
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              ⚙️ To update company details, edit <code>app/config/company.ts</code> in the codebase.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
