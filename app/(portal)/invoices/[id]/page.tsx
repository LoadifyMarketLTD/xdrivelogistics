'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { InvoiceWithDetails, Job } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          job:jobs(
            id,
            pickup_location,
            delivery_location,
            pickup_datetime,
            delivery_datetime,
            load_id,
            vehicle_type,
            status
          ),
          company:companies(
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError
      if (!invoiceData) throw new Error('Invoice not found')

      setInvoice({
        ...invoiceData,
        total_amount: invoiceData.amount + invoiceData.vat_amount,
        company_name: invoiceData.company?.name || undefined
      })
    } catch (err: any) {
      console.error('Error fetching invoice:', err)
      setError(err.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    if (!invoiceId) return
    fetchInvoiceDetails()
  }, [invoiceId, fetchInvoiceDetails])

  const updateInvoiceStatus = async (newStatus: string) => {
    if (!invoice) return

    try {
      setUpdating(true)
      
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      
      // If marking as paid, set paid_date
      if (newStatus === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0]
      }
      
      const { error: updateError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoice.id)

      if (updateError) throw updateError

      // Refresh invoice data
      await fetchInvoiceDetails()
      
    } catch (err: any) {
      console.error('Error updating invoice:', err)
      alert('Failed to update invoice status: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

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
        padding: '6px 16px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.text
      }}>
        {style.label}
      </span>
    )
  }

  if (loading) {
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
          <p style={{ color: '#6b7280' }}>Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Error</h3>
          <p style={{ color: '#991b1b', margin: 0 }}>{error || 'Invoice not found'}</p>
        </div>
        <button
          onClick={() => router.push('/invoices')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Invoices
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <button
            onClick={() => router.push('/invoices')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            ← Back to Invoices
          </button>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            Invoice {invoice.invoice_number}
          </h1>
        </div>
        {getStatusBadge(invoice.status)}
      </div>

      {/* Invoice Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '32px',
        marginBottom: '20px'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Invoice To:
            </h2>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
              {invoice.customer_name}
            </div>
            {invoice.customer_email && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {invoice.customer_email}
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Invoice Number
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              {invoice.invoice_number}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Issue Date
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
              {formatDate(invoice.issue_date)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              Due Date
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {formatDate(invoice.due_date)}
            </div>
          </div>
        </div>

        {/* Job Details */}
        {invoice.job && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px'
            }}>
              Related Job
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Load ID</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {invoice.job.load_id || invoice.job.id.slice(0, 8)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Vehicle Type</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {invoice.job.vehicle_type || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>From</div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>
                  {invoice.job.pickup_location}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>To</div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>
                  {invoice.job.delivery_location}
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(`/loads/${invoice.job?.id}`)}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              View Job Details
            </button>
          </div>
        )}

        {/* Amount Breakdown */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {formatCurrency(invoice.amount)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>VAT:</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
              {formatCurrency(invoice.vat_amount)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>Total:</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
              {formatCurrency(invoice.total_amount)}
            </span>
          </div>
        </div>

        {/* Payment Information */}
        {invoice.paid_date && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#d1fae5',
            border: '1px solid #86efac',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ color: '#065f46', fontWeight: '600', fontSize: '14px' }}>
              Paid on {formatDate(invoice.paid_date)}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              Notes
            </h3>
            <p style={{ fontSize: '14px', color: '#1f2937', margin: 0, whiteSpace: 'pre-wrap' }}>
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {invoice.status === 'pending' && (
            <>
              <button
                onClick={() => updateInvoiceStatus('sent')}
                disabled={updating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: updating ? 0.5 : 1
                }}
              >
                Mark as Sent
              </button>
              <button
                onClick={() => updateInvoiceStatus('paid')}
                disabled={updating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: updating ? 0.5 : 1
                }}
              >
                Mark as Paid
              </button>
            </>
          )}
          
          {invoice.status === 'sent' && (
            <>
              <button
                onClick={() => updateInvoiceStatus('paid')}
                disabled={updating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: updating ? 0.5 : 1
                }}
              >
                Mark as Paid
              </button>
              <button
                onClick={() => updateInvoiceStatus('overdue')}
                disabled={updating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: updating ? 0.5 : 1
                }}
              >
                Mark as Overdue
              </button>
            </>
          )}
          
          {invoice.status === 'overdue' && (
            <button
              onClick={() => updateInvoiceStatus('paid')}
              disabled={updating}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: updating ? 0.5 : 1
              }}
            >
              Mark as Paid
            </button>
          )}
          
          {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel this invoice?')) {
                  updateInvoiceStatus('cancelled')
                }
              }}
              disabled={updating}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: updating ? 0.5 : 1
              }}
            >
              Cancel Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
