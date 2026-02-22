'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabaseClient';

export default function InvoiceDetailPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !invoiceId) { setLoading(false); return; }
    supabase.from('invoices').select('*').eq('id', invoiceId).single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setInvoice(data);
        setLoading(false);
      });
  }, [invoiceId]);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin/invoices')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Invoices</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>🧾 Invoice Detail</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
          {loading && <p style={{ color: '#6b7280' }}>Loading invoice...</p>}
          {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem' }}>
              ⚠️ Supabase not configured.
            </div>
          )}
          {invoice && (
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, color: '#1F3A5F', marginBottom: '1.25rem' }}>{String(invoice.invoice_ref ?? '')}</h2>
              <pre style={{ fontSize: '0.85rem', color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(invoice, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
