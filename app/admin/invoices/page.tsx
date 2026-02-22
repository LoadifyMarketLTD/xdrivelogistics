'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

interface Invoice {
  id: string;
  job_id: string | null;
  invoice_ref: string;
  status: string;
  customer_name: string | null;
  total_amount: number | null;
  currency: string;
  due_date: string | null;
  created_at: string;
}

export default function InvoicesPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.from('invoices').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>🧾 Invoices</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem' }}>
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              ⚠️ Supabase not configured. Connect your database to see live invoices.
            </div>
          )}
          {loading && <p style={{ color: '#6b7280' }}>Loading invoices...</p>}
          {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
          {!loading && invoices.length === 0 && <p style={{ color: '#6b7280' }}>No invoices found.</p>}
          {invoices.map((inv) => (
            <div key={inv.id} onClick={() => router.push(`/admin/invoices/${inv.id}`)}
              style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1F3A5F'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#1F3A5F', marginRight: '0.75rem' }}>{inv.invoice_ref}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{inv.customer_name ?? '—'}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#1F3A5F' }}>{inv.total_amount ? `£${inv.total_amount}` : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
