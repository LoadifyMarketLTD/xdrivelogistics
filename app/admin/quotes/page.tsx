'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

export default function QuotesPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.from('quotes').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>💬 Quotes</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem' }}>
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              ⚠️ Supabase not configured. Connect your database to see live data.
            </div>
          )}
          {loading && <p style={{ color: '#6b7280' }}>Loading quotes...</p>}
          {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
          {!loading && items.length === 0 && <p style={{ color: '#6b7280' }}>No quotes found.</p>}
          {items.map((item) => (
            <div key={String(item.id)} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, color: '#1F3A5F' }}>{String(item.quote_ref)}</span>
                  <span style={{ marginLeft: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>Status: {String(item.status)} · {String(item.customer_name ?? '')}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{String(item.id).slice(0, 8)}...</span>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
