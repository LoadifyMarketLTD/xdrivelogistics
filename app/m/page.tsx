'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { JOB_STATUS } from '../config/company';

interface Job {
  id: string;
  job_ref: string;
  status: string;
  collection_address: string;
  delivery_address: string;
  collection_time?: string;
  delay_minutes?: number;
  customer_name?: string;
}

export default function MobilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'mobile') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'mobile') {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data } = await supabase
        .from('jobs')
        .select('id, job_ref, status, collection_address, delivery_address, collection_time, delay_minutes, customer_name')
        .in('status', [JOB_STATUS.ALLOCATED, JOB_STATUS.POSTED])
        .order('collection_time', { ascending: true });
      setJobs(data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingJobs(false);
    }
  };

  if (isLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A2239' }}>
      <div style={{ color: '#D4AF37', fontSize: '1.25rem' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A2239', color: 'white' }}>
      <header style={{ backgroundColor: '#1F3A5F', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#D4AF37', margin: 0 }}>Danny Courier</h1>
        <button onClick={logout} style={{ padding: '0.4rem 1rem', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Your Jobs</h2>

        {loadingJobs ? (
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '2rem' }}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>��</div>
            <p>No jobs assigned at the moment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/m/jobs/${job.id}`)}
                style={{ backgroundColor: '#1F3A5F', borderRadius: '10px', padding: '1rem 1.25rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F3A5F'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: '#D4AF37' }}>{job.job_ref}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: job.status === 'Allocated' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)', color: job.status === 'Allocated' ? '#6EE7B7' : '#93C5FD' }}>{job.status}</span>
                </div>
                {job.customer_name && <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 0.5rem' }}>{job.customer_name}</p>}
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  <p style={{ margin: '0.2rem 0' }}>📍 From: {job.collection_address}</p>
                  <p style={{ margin: '0.2rem 0' }}>🎯 To: {job.delivery_address}</p>
                  {job.delay_minutes && job.delay_minutes > 0 && (
                    <p style={{ margin: '0.2rem 0', color: '#FCD34D' }}>⚠️ Delayed: {job.delay_minutes} mins</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
