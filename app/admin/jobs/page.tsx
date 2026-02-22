'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import type { DbJob } from '../../../lib/types/database';

export default function JobsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<DbJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.from('jobs').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setJobs((data as DbJob[]) || []);
        setLoading(false);
      });
  }, []);

  const statusColor: Record<string, string> = {
    draft: '#6b7280', posted: '#3b82f6', allocated: '#f59e0b',
    in_transit: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444', disputed: '#dc2626',
  };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>📦 Jobs</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem' }}>
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              ⚠️ Supabase not configured. Connect your database to see live jobs.
            </div>
          )}
          {loading && <p style={{ color: '#6b7280' }}>Loading jobs...</p>}
          {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
          {!loading && jobs.length === 0 && <p style={{ color: '#6b7280' }}>No jobs found.</p>}
          {jobs.map((job) => (
            <div key={job.id} onClick={() => router.push(`/admin/jobs/${job.id}`)}
              style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1F3A5F'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#1F3A5F', marginRight: '0.75rem' }}>{job.job_ref}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', backgroundColor: statusColor[job.status] ?? '#6b7280', borderRadius: '6px', padding: '0.15rem 0.5rem' }}>{job.status}</span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F3A5F' }}>{job.agreed_price ? `£${job.agreed_price}` : job.quoted_price ? `£${job.quoted_price}` : '—'}</span>
              </div>
              <div style={{ marginTop: '0.4rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {job.pickup_city ?? job.pickup_address} → {job.delivery_city ?? job.delivery_address}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
