'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A2239' }}>
        <div style={{ color: '#D4AF37', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A2239', color: 'white' }}>
      <header style={{ backgroundColor: '#1F3A5F', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#D4AF37', margin: 0 }}>Danny Courier Admin</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{user.email}</span>
          <button onClick={logout} style={{ padding: '0.4rem 1rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </header>
      <main style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#1F3A5F', borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F3A5F'}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Jobs Management</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>Create, track and manage delivery jobs</p>
          </div>
          <div style={{ backgroundColor: '#1F3A5F', borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F3A5F'}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🧾</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Invoices</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>Generate and manage customer invoices</p>
          </div>
          <div style={{ backgroundColor: '#1F3A5F', borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F3A5F'}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👥</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Customers</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>Manage customer accounts</p>
          </div>
          <div style={{ backgroundColor: '#1F3A5F', borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F3A5F'}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Reports</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>View business analytics and reports</p>
          </div>
        </div>
      </main>
    </div>
  );
}
