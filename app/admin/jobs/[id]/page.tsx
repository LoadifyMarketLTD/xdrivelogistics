'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabaseClient';
import type { DbJob } from '../../../../lib/types/database';

export default function JobDetailPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const [job, setJob] = useState<DbJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !jobId) { setLoading(false); return; }
    supabase.from('jobs').select('*').eq('id', jobId).single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setJob(data as DbJob);
        setLoading(false);
      });
  }, [jobId]);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <header style={{ backgroundColor: '#1F3A5F', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin/jobs')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>← Jobs</button>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>📦 Job Detail</h1>
          </div>
          <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </header>
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
          {loading && <p style={{ color: '#6b7280' }}>Loading job...</p>}
          {error && <p style={{ color: '#dc2626' }}>Error: {error}</p>}
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              ⚠️ Supabase not configured.
            </div>
          )}
          {job && (
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, color: '#1F3A5F', marginBottom: '1.25rem' }}>{job.job_ref}</h2>
              <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.6rem 1rem', fontSize: '0.9rem' }}>
                <dt style={{ color: '#6b7280', fontWeight: 600 }}>Status</dt><dd style={{ margin: 0, fontWeight: 700 }}>{job.status}</dd>
                <dt style={{ color: '#6b7280', fontWeight: 600 }}>Cargo</dt><dd style={{ margin: 0 }}>{job.cargo_type}</dd>
                <dt style={{ color: '#6b7280', fontWeight: 600 }}>Pickup</dt><dd style={{ margin: 0 }}>{job.pickup_address}{job.pickup_city ? `, ${job.pickup_city}` : ''}</dd>
                <dt style={{ color: '#6b7280', fontWeight: 600 }}>Delivery</dt><dd style={{ margin: 0 }}>{job.delivery_address}{job.delivery_city ? `, ${job.delivery_city}` : ''}</dd>
                <dt style={{ color: '#6b7280', fontWeight: 600 }}>Price</dt><dd style={{ margin: 0, fontWeight: 700, color: '#1F3A5F' }}>{job.agreed_price ? `£${job.agreed_price}` : job.quoted_price ? `£${job.quoted_price} (quoted)` : '—'}</dd>
                {job.description && <><dt style={{ color: '#6b7280', fontWeight: 600 }}>Description</dt><dd style={{ margin: 0 }}>{job.description}</dd></>}
                {job.special_instructions && <><dt style={{ color: '#6b7280', fontWeight: 600 }}>Instructions</dt><dd style={{ margin: 0 }}>{job.special_instructions}</dd></>}
              </dl>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
