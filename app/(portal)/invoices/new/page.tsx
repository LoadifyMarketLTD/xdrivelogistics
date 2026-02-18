'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Job } from '@/lib/types'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { companyId } = useAuth()
  const jobId = searchParams.get('job_id')
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || '')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [vatRate, setVatRate] = useState('20') // Default UK VAT rate
  const [dueInDays, setDueInDays] = useState('30') // Default 30 days
  const [notes, setNotes] = useState('')

  const fetchJobs = useCallback(async () => {
    if (!companyId) return
    
    try {
      setLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('posted_by_company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (fetchError) throw fetchError
      
      setJobs(data || [])
    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      setError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchJobs()
    }
  }, [companyId, fetchJobs])

  useEffect(() => {
    if (selectedJobId) {
      const job = jobs.find(j => j.id === selectedJobId)
      setSelectedJob(job || null)
      
      // Pre-fill customer name from job if available (only if customer name is empty)
      if (job && job.booked_by_company_name && !customerName) {
        setCustomerName(job.booked_by_company_name)
      }
      // Pre-fill amount from agreed_rate if available (only if amount is empty)
      if (job && job.agreed_rate && !amount) {
        setAmount(job.agreed_rate.toString())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, jobs])

  const calculateVAT = () => {
    if (!amount || !vatRate) return 0
    const amountNum = parseFloat(amount)
    const vatRateNum = parseFloat(vatRate)
    if (isNaN(amountNum) || isNaN(vatRateNum)) return 0
    return (amountNum * vatRateNum) / 100
  }

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0
    const vatAmount = calculateVAT()
    return amountNum + vatAmount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyId) {
      setError('Company ID not found')
      return
    }
    
    if (!customerName.trim()) {
      setError('Customer name is required')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Valid amount is required')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      const amountNum = parseFloat(amount)
      const vatAmount = calculateVAT()
      const daysNum = parseInt(dueInDays)
      
      // Calculate due date
      const issueDate = new Date()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysNum)
      
      const invoiceData = {
        company_id: companyId,
        job_id: selectedJobId || null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        amount: amountNum,
        vat_amount: vatAmount,
        status: 'pending',
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        notes: notes.trim() || null
      }
      
      const { data: newInvoice, error: insertError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Redirect to the new invoice
      router.push(`/invoices/${newInvoice.id}`)
      
    } catch (err: any) {
      console.error('Error creating invoice:', err)
      setError(err.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
          Create New Invoice
        </h1>
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          {/* Job Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Related Job (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={loading || !!jobId}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
                backgroundColor: (loading || !!jobId) ? '#f3f4f6' : '#ffffff',
                cursor: (loading || !!jobId) ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">-- No Job --</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.load_id || job.id.slice(0, 8)} - {job.pickup_location} → {job.delivery_location}
                </option>
              ))}
            </select>
            {selectedJob && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <div><strong>Status:</strong> {selectedJob.status}</div>
                {selectedJob.vehicle_type && <div><strong>Vehicle:</strong> {selectedJob.vehicle_type}</div>}
                {selectedJob.agreed_rate && <div><strong>Agreed Rate:</strong> £{selectedJob.agreed_rate.toFixed(2)}</div>}
              </div>
            )}
          </div>

          {/* Customer Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Customer Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Enter customer name"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937'
              }}
            />
          </div>

          {/* Customer Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Customer Email (Optional)
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937'
              }}
            />
          </div>

          {/* Amount and VAT */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Amount (£) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                VAT Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="20"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          {/* Amount Summary */}
          {amount && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(parseFloat(amount) || 0)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                fontSize: '14px',
                color: '#1e40af'
              }}>
                <span>VAT ({vatRate}%):</span>
                <span>{formatCurrency(calculateVAT())}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '2px solid #bfdbfe',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e3a8a'
              }}>
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Payment Due In (Days)
            </label>
            <select
              value={dueInDays}
              onChange={(e) => setDueInDays(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
                cursor: 'pointer'
              }}
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
            <div style={{
              marginTop: '6px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Due date: {new Date(new Date().setDate(new Date().getDate() + parseInt(dueInDays))).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '0' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or payment instructions..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: submitting ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !customerName.trim() || !amount || parseFloat(amount) <= 0}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: (submitting || !customerName.trim() || !amount) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: (submitting || !customerName.trim() || !amount) ? 0.5 : 1
            }}
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
