'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { COMPANY_CONFIG } from '../../config/company';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

interface Quote {
  id: string;
  quote_ref: string;
  status: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_location: string;
  delivery_location: string;
  vehicle_type: string;
  cargo_type: string;
  amount: number;
  notes?: string;
  created_at: string;
}

const VEHICLE_TYPES = ['Van', 'Small Van', 'Large Van', 'Luton', 'HGV', 'Motorcycle', 'Car', 'Other'];
const CARGO_TYPES = ['Parcels', 'Pallets', 'Furniture', 'Equipment', 'Documents', 'Food', 'Fragile', 'Hazardous', 'Other'];
const STATUS_COLOURS: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#FEF3C7', color: '#92400E' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  expired:  { bg: '#F3F4F6', color: '#6B7280' },
};

function nextRef() {
  return `QT-${Date.now().toString().slice(-6)}`;
}

export default function QuotesPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const emptyForm = {
    quote_ref: nextRef(),
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_location: '',
    delivery_location: '',
    vehicle_type: 'Van',
    cargo_type: 'Parcels',
    amount: '',
    notes: '',
    status: 'pending',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchQuotes = async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setQuotes((data as Quote[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

  const handleCreate = async () => {
    if (!form.customer_name.trim() || !form.pickup_location.trim() || !form.delivery_location.trim()) {
      setError('Customer name, pickup and delivery are required.'); return;
    }
    setSaving(true); setError('');
    try {
      if (!isSupabaseConfigured) throw new Error('Supabase not configured.');
      const { error } = await supabase.from('quotes').insert([{
        quote_ref: form.quote_ref,
        status: form.status,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        pickup_location: form.pickup_location,
        delivery_location: form.delivery_location,
        vehicle_type: form.vehicle_type,
        cargo_type: form.cargo_type,
        amount: parseFloat(form.amount) || 0,
        notes: form.notes,
      }]);
      if (error) throw error;
      setShowModal(false);
      setForm({ ...emptyForm, quote_ref: nextRef() });
      await fetchQuotes();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create quote.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('quotes').update({ status }).eq('id', id);
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
  };

  const filtered = quotes.filter((q) => {
    const matchSearch = !search || q.customer_name.toLowerCase().includes(search.toLowerCase()) || q.quote_ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
        <header style={{ backgroundColor: '#0A2239', color: 'white', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => router.push('/admin')} style={{ color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>💬 Quotes</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setShowModal(true); setForm({ ...emptyForm, quote_ref: nextRef() }); }} style={{ backgroundColor: '#1F7A3D', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 1rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>+ New Quote</button>
            <button onClick={logout} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontSize: '0.82rem' }}>Logout</button>
          </div>
        </header>

        <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {!isSupabaseConfigured && (
            <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#92400E' }}>
              ⚠️ Supabase not configured — showing demo mode. Set env vars to enable database.
            </div>
          )}
          {error && <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#DC2626' }}>{error}</div>}

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotes…" style={{ ...inputStyle, maxWidth: '260px' }} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: '160px' }}>
              <option value="all">All Statuses</option>
              {['pending', 'accepted', 'rejected', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: '#6B7280', marginLeft: 'auto' }}>{filtered.length} quote{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ color: '#6B7280' }}>Loading quotes…</p>
          ) : filtered.length === 0 ? (
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
              <p style={{ fontWeight: 600, margin: 0 }}>No quotes found</p>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.875rem' }}>Create your first quote to get started.</p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                    {['Quote Ref', 'Customer', 'Route', 'Vehicle / Cargo', 'Amount', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q, i) => {
                    const sc = STATUS_COLOURS[q.status] ?? STATUS_COLOURS.pending;
                    return (
                      <tr key={q.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: '#0A2239', fontSize: '0.9rem' }}>{q.quote_ref}</span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(q.created_at).toLocaleDateString('en-GB')}</p>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{q.customer_name}</p>
                          {q.customer_email && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>{q.customer_email}</p>}
                          {q.customer_phone && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#6B7280' }}>{q.customer_phone}</p>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#374151' }}>📍 {q.pickup_location}</p>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#374151' }}>🏁 {q.delivery_location}</p>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#374151' }}>🚐 {q.vehicle_type}</p>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#374151' }}>📦 {q.cargo_type}</p>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0A2239' }}>
                          {q.amount ? `£${q.amount.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: sc.bg, color: sc.color, textTransform: 'capitalize' }}>{q.status}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select value={q.status} onChange={(e) => updateStatus(q.id, e.target.value)} style={{ padding: '0.35rem 0.5rem', border: '1px solid #E5E7EB', borderRadius: '5px', fontSize: '0.78rem', cursor: 'pointer', backgroundColor: 'white' }}>
                            {['pending', 'accepted', 'rejected', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0A2239' }}>New Quote</h2>
              <button onClick={() => setShowModal(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1.1rem', color: '#6B7280' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={labelStyle}>Quote Ref</label>
                <input style={inputStyle} value={form.quote_ref} onChange={(e) => setForm({ ...form, quote_ref: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {['pending', 'accepted', 'rejected', 'expired'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Customer Name *</label>
                <input style={inputStyle} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Full name or company" />
              </div>
              <div>
                <label style={labelStyle}>Customer Email</label>
                <input type="email" style={inputStyle} value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Customer Phone</label>
                <input type="tel" style={inputStyle} value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Amount (£)</label>
                <input type="number" step="0.01" min="0" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={labelStyle}>Pickup Location *</label>
                <input style={inputStyle} value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} placeholder="From address" />
              </div>
              <div>
                <label style={labelStyle}>Delivery Location *</label>
                <input style={inputStyle} value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} placeholder="To address" />
              </div>
              <div>
                <label style={labelStyle}>Vehicle Type</label>
                <select style={inputStyle} value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                  {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cargo Type</label>
                <select style={inputStyle} value={form.cargo_type} onChange={(e) => setForm({ ...form, cargo_type: e.target.value })}>
                  {CARGO_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional information…" />
              </div>
            </div>

            {error && <div style={{ padding: '0.65rem', marginTop: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '7px', fontSize: '0.85rem' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '0.65rem 1.25rem', border: '1.5px solid #E5E7EB', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{ padding: '0.65rem 1.5rem', backgroundColor: saving ? '#9CA3AF' : '#0A2239', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>
                {saving ? 'Creating…' : 'Create Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
