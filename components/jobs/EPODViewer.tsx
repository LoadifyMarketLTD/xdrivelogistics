'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface EPODViewerProps {
  jobId: string
  className?: string
}

interface Evidence {
  id: string
  type: 'photo' | 'signature' | 'document' | 'note'
  phase: 'pickup' | 'delivery' | 'in_transit'
  file_url: string
  file_name: string
  receiver_name?: string
  notes?: string
  uploaded_at: string
  uploaded_by: string
}

interface POD {
  id: string
  pdf_url: string
  version: number
  generated_at: string
  page_count: number
}

export default function EPODViewer({ jobId, className = '' }: EPODViewerProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [pod, setPod] = useState<POD | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadData()
  }, [jobId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load evidence
      const evidenceResponse = await fetch(`/api/jobs/${jobId}/evidence`)
      if (evidenceResponse.ok) {
        const data = await evidenceResponse.json()
        setEvidence(data.evidence || [])
      }

      // Load POD if exists
      const { data: podData, error: podError } = await supabase
        .from('job_pod')
        .select('*')
        .eq('job_id', jobId)
        .eq('is_latest', true)
        .single()

      if (!podError && podData) {
        setPod(podData)
      }

    } catch (err) {
      console.error('Error loading ePOD data:', err)
      setError('Failed to load ePOD data')
    } finally {
      setLoading(false)
    }
  }

  const generatePOD = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/${jobId}/pod`, {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate POD')
      }

      // Reload data to get new POD
      await loadData()
      alert('ePOD generated successfully!')

    } catch (err) {
      console.error('POD generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate ePOD')
    } finally {
      setGenerating(false)
    }
  }

  const downloadPOD = () => {
    if (pod?.pdf_url) {
      window.open(pod.pdf_url, '_blank')
    }
  }

  const groupedEvidence = {
    pickup: evidence.filter(e => e.phase === 'pickup'),
    delivery: evidence.filter(e => e.phase === 'delivery'),
    in_transit: evidence.filter(e => e.phase === 'in_transit')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        Loading ePOD...
      </div>
    )
  }

  return (
    <div className={`epod-viewer ${className}`}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{
          fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
          color: '#333',
          fontWeight: '600',
          margin: 0
        }}>
          Electronic Proof of Delivery (ePOD)
        </h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {pod && (
            <button
              onClick={downloadPOD}
              style={{
                padding: '12px 24px',
                fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                fontWeight: '600',
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              📥 Download PDF
            </button>
          )}

          <button
            onClick={generatePOD}
            disabled={generating || evidence.length === 0}
            style={{
              padding: '12px 24px',
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              fontWeight: '600',
              color: 'white',
              background: generating || evidence.length === 0 ? '#999' : '#22c55e',
              border: 'none',
              borderRadius: '6px',
              cursor: generating || evidence.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {generating ? '⏳ Generating...' : '📄 Generate ePOD'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'
        }}>
          {error}
        </div>
      )}

      {pod && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#f0fdf4',
          border: '2px solid #22c55e',
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <h3 style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: '#15803d',
              fontWeight: '600',
              margin: 0
            }}>
              ePOD Generated
            </h3>
          </div>
          <div style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            color: '#166534'
          }}>
            <p style={{ margin: '4px 0' }}>Version: {pod.version}</p>
            <p style={{ margin: '4px 0' }}>Pages: {pod.page_count}</p>
            <p style={{ margin: '4px 0' }}>Generated: {formatDate(pod.generated_at)}</p>
          </div>
        </div>
      )}

      {evidence.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f9f9f9',
          borderRadius: '8px',
          color: '#666'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>
            No evidence uploaded yet. Upload photos, signatures, or documents to create an ePOD.
          </p>
        </div>
      ) : (
        <>
          {/* Pickup Evidence */}
          {groupedEvidence.pickup.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                color: '#333',
                fontWeight: '600',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #d4af37'
              }}>
                📦 Pickup Evidence ({groupedEvidence.pickup.length})
              </h3>
              <EvidenceGrid evidence={groupedEvidence.pickup} />
            </div>
          )}

          {/* In-Transit Evidence */}
          {groupedEvidence.in_transit.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                color: '#333',
                fontWeight: '600',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #d4af37'
              }}>
                🚚 In-Transit Evidence ({groupedEvidence.in_transit.length})
              </h3>
              <EvidenceGrid evidence={groupedEvidence.in_transit} />
            </div>
          )}

          {/* Delivery Evidence */}
          {groupedEvidence.delivery.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                color: '#333',
                fontWeight: '600',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #d4af37'
              }}>
                ✅ Delivery Evidence ({groupedEvidence.delivery.length})
              </h3>
              <EvidenceGrid evidence={groupedEvidence.delivery} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EvidenceGrid({ evidence }: { evidence: Evidence[] }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 'clamp(12px, 2vw, 20px)'
    }}>
      {evidence.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Evidence Preview */}
          {(item.type === 'photo' || item.type === 'signature') && (
            <div style={{
              width: '100%',
              height: '200px',
              background: '#f5f5f5',
              overflow: 'hidden'
            }}>
              <img
                src={item.file_url}
                alt={item.file_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {item.type === 'document' && (
            <div style={{
              width: '100%',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📄</div>
              <div style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>Document</div>
            </div>
          )}

          {/* Evidence Details */}
          <div style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {item.type === 'photo' && '📷'}
                {item.type === 'signature' && '✍️'}
                {item.type === 'document' && '📄'}
                {item.type === 'note' && '📝'}
              </span>
              <span style={{
                fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                fontWeight: '600',
                color: '#333',
                textTransform: 'capitalize'
              }}>
                {item.type}
              </span>
            </div>

            {item.receiver_name && (
              <div style={{
                fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                color: '#666',
                marginBottom: '4px'
              }}>
                <strong>Receiver:</strong> {item.receiver_name}
              </div>
            )}

            {item.notes && (
              <div style={{
                fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
                color: '#666',
                marginBottom: '8px',
                padding: '8px',
                background: '#f9f9f9',
                borderRadius: '4px'
              }}>
                {item.notes}
              </div>
            )}

            <div style={{
              fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
              color: '#999',
              marginTop: '8px'
            }}>
              {formatDate(item.uploaded_at)}
            </div>

            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '8px 16px',
                fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
                fontWeight: '600',
                color: '#3b82f6',
                background: '#eff6ff',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              View Full Size
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
