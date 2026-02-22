'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthContext';

interface Job {
  id: string; ref: string;
  pickupLocation: string; deliveryLocation: string;
  pickupTime: string; deliveryTime: string;
  status: 'active' | 'pickup' | 'delivery' | 'completed';
}

const mockJobs: Job[] = [
  { id: '1', ref: 'DC-240115-0001', pickupLocation: 'Birmingham Warehouse', deliveryLocation: 'London Office', pickupTime: '2024-01-15T09:00:00', deliveryTime: '2024-01-15T14:00:00', status: 'active' },
  { id: '2', ref: 'DC-240115-0002', pickupLocation: 'Manchester Depot', deliveryLocation: 'Leeds Distribution Center', pickupTime: '2024-01-15T10:30:00', deliveryTime: '2024-01-15T13:30:00', status: 'pickup' },
  { id: '3', ref: 'DC-240115-0003', pickupLocation: 'Bristol Storage', deliveryLocation: 'Cardiff Warehouse', pickupTime: '2024-01-15T08:00:00', deliveryTime: '2024-01-15T11:00:00', status: 'delivery' },
  { id: '4', ref: 'DC-240114-0045', pickupLocation: 'Southampton Port', deliveryLocation: 'Reading HQ', pickupTime: '2024-01-14T15:00:00', deliveryTime: '2024-01-14T17:30:00', status: 'completed' },
];

export default function JobsPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pickup' | 'delivery' | 'completed'>('all');

  const filters = [
    { id: 'all', label: 'All', icon: '📋' }, { id: 'active', label: 'Active', icon: '🚚' },
    { id: 'pickup', label: 'Pickup', icon: '📦' }, { id: 'delivery', label: 'Delivery', icon: '✅' },
    { id: 'completed', label: 'History', icon: '📝' },
  ];

  const filteredJobs = activeFilter === 'all' ? mockJobs : mockJobs.filter(j => j.status === activeFilter);
  const formatTime = (s: string) => new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const statusColor = (s: string) => ({ active: '#10b981', pickup: '#f59e0b', delivery: '#3b82f6', completed: '#8b5cf6' }[s] || '#6b7280');
  const statusLabel = (s: string) => ({ active: 'Active', pickup: 'Ready for Pickup', delivery: 'In Delivery', completed: 'Completed' }[s] || s);

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <header style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <button onClick={() => router.push('/m')} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>← Back</button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Jobs</h1>
            <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>Logout</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                style={{ backgroundColor: activeFilter === f.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', color: 'white', border: activeFilter === f.id ? '2px solid white' : '2px solid transparent', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '40px' }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </header>
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          {filteredJobs.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p><p style={{ margin: 0 }}>No jobs found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredJobs.map(job => (
                <button key={job.id} onClick={() => router.push(`/m/jobs/${job.id}`)}
                  style={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', padding: '1rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'left', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{ display: 'inline-block', backgroundColor: statusColor(job.status), color: 'white', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '12px', marginBottom: '0.75rem' }}>{statusLabel(job.status)}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.75rem' }}>{job.ref}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>📦</span>
                    <div><div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Pickup</div><div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{job.pickupLocation}</div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(job.pickupTime)} at {formatTime(job.pickupTime)}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span>📍</span>
                    <div><div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Delivery</div><div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{job.deliveryLocation}</div><div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(job.deliveryTime)} at {formatTime(job.deliveryTime)}</div></div>
                  </div>
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', color: '#d1d5db' }}>→</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
