'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { InvoiceWithDetails } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

type StatusFilter = 'all' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export default function InvoicesPage() {
  const router = useRouter()
  const { companyId, user } = useAuth()
  
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  
  const mountedRef = useRef(true)

  const fetchInvoices = useCallback(async () => {
    if (!mountedRef.current || !companyId) return
    
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('invoices')
        .select(`
          *,
          job:jobs(
            id,
            pickup_location,
            delivery_location,
            load_id
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      if (!mountedRef.current) return
      
      // Add computed total_amount field
      const invoicesWithTotals = (data || []).map(invoice => ({
        ...invoice,
        total_amount: invoice.amount + invoice.vat_amount
      }))
      
      setInvoices(invoicesWithTotals)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching invoices:', err)
      if (mountedRef.current) {
        setError(err.message || 'Failed to load invoices')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [companyId, statusFilter])

  useEffect(() => {
    mountedRef.current = true
    fetchInvoices()
    
    return () => {
      mountedRef.current = false
    }
  }, [fetchInvoices])

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      sent: { bg: '#dbeafe', text: '#1e40af', label: 'Sent' },
      paid: { bg: '#d1fae5', text: '#065f46', label: 'Paid' },
      overdue: { bg: '#fee2e2', text: '#991b1b', label: 'Overdue' },
      cancelled: { bg: '#e5e7eb', text: '#374151', label: 'Cancelled' }
    }
    
    const style = statusStyles[status] || statusStyles.pending
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.text
      }}>
        {style.label}
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading && invoices.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>
          Invoices
        </h1>
        <button
          onClick={() => router.push('/invoices/new')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          + Create Invoice
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '0'
      }}>
        {(['all', 'pending', 'sent', 'paid', 'overdue', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '12px 20px',
              backgroundColor: 'transparent',
              color: statusFilter === status ? '#3b82f6' : '#6b7280',
              border: 'none',
              borderBottom: statusFilter === status ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: statusFilter === status ? '600' : '500',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {status === 'all' ? 'All Invoices' : status}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      {invoices.length === 0 && !loading ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            margin: '0 0 16px 0'
          }}>
            {statusFilter === 'all' 
              ? 'No invoices found. Create your first invoice to get started.'
              : `No ${statusFilter} invoices found.`}
          </p>
          <button
            onClick={() => router.push('/invoices/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Create Invoice
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Invoice #
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Customer
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Job
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'right', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Amount
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Issue Date
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Due Date
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '12px 16px', 
                  textAlign: 'right', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr 
                  key={invoice.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                >
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                    {invoice.invoice_number}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                    <div>{invoice.customer_name}</div>
                    {invoice.customer_email && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{invoice.customer_email}</div>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                    {invoice.job ? (
                      <div style={{ fontSize: '12px' }}>
                        <div style={{ fontWeight: '600' }}>{invoice.job.load_id || invoice.job.id.slice(0, 8)}</div>
                        <div style={{ color: '#6b7280', marginTop: '2px' }}>
                          {invoice.job.pickup_location} → {invoice.job.delivery_location}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>No job</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', textAlign: 'right', fontWeight: '600' }}>
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                    {formatDate(invoice.due_date)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/invoices/${invoice.id}`)
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#3b82f6',
                        border: '1px solid #3b82f6',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6'
                        e.currentTarget.style.color = '#ffffff'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#3b82f6'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
