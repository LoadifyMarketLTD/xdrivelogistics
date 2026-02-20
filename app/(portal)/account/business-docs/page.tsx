'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface BusinessDoc {
  id: string
  created_at: string
  document_type: string
  file_name: string
  expiry_date: string | null
  storage_path: string
  status: string
}

function getExpiryStatus(expiryDate: string | null): { label: string; color: string } {
  if (!expiryDate) return { label: 'No expiry', color: '#6b7280' }
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry < 0) return { label: 'Expired', color: '#dc2626' }
  if (daysUntilExpiry <= 30) return { label: `Expires in ${daysUntilExpiry} days`, color: '#d97706' }
  return { label: `Valid until ${expiry.toLocaleDateString('en-GB')}`, color: '#16a34a' }
}

export default function BusinessDocsPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()

  const [docs, setDocs] = useState<BusinessDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [docType, setDocType] = useState('insurance')
  const [expiryDate, setExpiryDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user || !companyId) return
    fetchDocs()
  }, [user, companyId])

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      if (fetchError) throw fetchError
      setDocs(data || [])
    } catch (err: any) {
      // Table may not exist yet — show empty state gracefully
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !user || !companyId) {
      setError('Please select a file to upload')
      return
    }
    try {
      setUploading(true)
      setError(null)

      const ext = selectedFile.name.split('.').pop()
      const path = `company-docs/${companyId}/${docType}-${Date.now()}.${ext}`

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(path, selectedFile)

      if (storageError) throw storageError

      const { error: insertError } = await supabase
        .from('company_documents')
        .insert({
          company_id: companyId,
          document_type: docType,
          file_name: selectedFile.name,
          storage_path: path,
          expiry_date: expiryDate || null,
          status: 'pending_review',
        })

      if (insertError) throw insertError

      setSuccess('Document uploaded successfully!')
      setSelectedFile(null)
      setExpiryDate('')
      setTimeout(() => setSuccess(null), 3000)
      await fetchDocs()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || loading) {
    return <div className="loading-screen"><div className="loading-text">Loading...</div></div>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Business Documents
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Upload and manage your insurance documents, operator licences and other certifications.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✓ {success}</div>}

      {/* Upload Form */}
      <div style={{
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
          Upload New Document
        </h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="form-input">
                <option value="insurance">Public Liability Insurance</option>
                <option value="goods_in_transit">Goods in Transit Insurance</option>
                <option value="operator_licence">Operator Licence</option>
                <option value="vehicle_insurance">Vehicle Insurance</option>
                <option value="driver_licence">Driver Licence</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Expiry Date (if applicable)</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="form-input" />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Select File (PDF, JPG, PNG)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="form-input"
            />
          </div>
          <button type="submit" disabled={uploading || !selectedFile} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            Uploaded Documents ({docs.length})
          </h2>
        </div>
        {docs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>No documents uploaded yet</div>
            <div style={{ fontSize: '14px' }}>Upload your insurance and compliance documents above.</div>
          </div>
        ) : (
          <div>
            {docs.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiry_date)
              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {doc.file_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      {' · '}
                      Added {new Date(doc.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600', color: expiryStatus.color,
                      background: expiryStatus.color === '#dc2626' ? '#fef2f2' : expiryStatus.color === '#d97706' ? '#fffbeb' : '#f0fdf4',
                      padding: '3px 8px', borderRadius: '4px',
                    }}>
                      {expiryStatus.label}
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      color: doc.status === 'approved' ? '#16a34a' : '#d97706',
                    }}>
                      {doc.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
