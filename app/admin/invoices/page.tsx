'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import type { InvoiceData } from '../../components/InvoiceTemplate';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = () => {
    try {
      const stored = localStorage.getItem('dannycourier_invoices');
      if (stored) {
        const parsedInvoices = JSON.parse(stored);
        const updatedInvoices = parsedInvoices.map((inv: InvoiceData) => ({ ...inv, status: calculateStatus(inv.dueDate, inv.status) }));
        setInvoices(updatedInvoices);
        localStorage.setItem('dannycourier_invoices', JSON.stringify(updatedInvoices));
      }
    } catch (error) { console.error('Error loading invoices:', error); }
  };

  const calculateStatus = (dueDate: string, currentStatus: string): 'Paid' | 'Pending' | 'Overdue' => {
    if (currentStatus === 'Paid') return 'Paid';
    const today = new Date(); const due = new Date(dueDate);
    return today > due ? 'Overdue' : 'Pending';
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.jobRef.toLowerCase().includes(searchTerm.toLowerCase()) || inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'All' || inv.status === statusFilter);
  });

  const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = { padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', display: 'inline-block' };
    switch (status) {
      case 'Paid': return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'Pending': return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Overdue': return { ...base, backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '1.5rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div><h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>Invoices</h1><p style={{ margin: 0, opacity: 0.8 }}>Manage and track all invoices</p></div>
            <button onClick={() => router.push('/admin')} style={{ padding: '0.625rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer' }}>← Back to Admin</button>
          </div>
        </div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '250px', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Pending' | 'Overdue')} style={{ padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white', outline: 'none' }}>
                  <option value="All">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option>
                </select>
              </div>
              <button onClick={() => router.push('/admin/invoices/new')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Create New Invoice</button>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {filteredInvoices.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '0.5rem' }}>No invoices found</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{searchTerm || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Get started by creating your first invoice'}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      {['Invoice #', 'Job Ref', 'Client', 'Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '1rem', textAlign: h === 'Amount' ? 'right' : h === 'Status' || h === 'Actions' ? 'center' : 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => router.push(`/admin/invoices/${inv.id}`)}>
                        <td style={{ padding: '1rem', fontWeight: '500', color: '#1f2937' }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '1rem', color: '#1f2937' }}>{inv.jobRef}</td>
                        <td style={{ padding: '1rem', color: '#1f2937' }}>{inv.clientName}</td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>£{inv.amount.toFixed(2)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}><span style={getStatusStyle(inv.status)}>{inv.status}</span></td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button onClick={e => { e.stopPropagation(); router.push(`/admin/invoices/${inv.id}`); }} style={{ padding: '0.5rem 1rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
