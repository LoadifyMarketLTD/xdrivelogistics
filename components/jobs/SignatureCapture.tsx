'use client'

import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SignatureCaptureProps {
  jobId: string
  phase: 'pickup' | 'delivery'
  onSignatureCapture?: (evidence: any) => void
  className?: string
}

export default function SignatureCapture({
  jobId,
  phase,
  onSignatureCapture,
  className = ''
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receiverName, setReceiverName] = useState('')
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const getCoordinates = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (coords) {
      setIsDrawing(true)
      setLastPos(coords)
      setIsEmpty(false)
    }
  }

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || !lastPos) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const coords = getCoordinates(e)
    if (!coords) return

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()

    setLastPos(coords)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    setError(null)
  }

  const canvasToBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error('Canvas not found'))
        return
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/png',
        1.0
      )
    })
  }

  const uploadSignature = async () => {
    if (isEmpty) {
      setError('Please provide a signature')
      return
    }

    if (!receiverName.trim()) {
      setError('Please enter receiver name')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Convert canvas to blob
      const blob = await canvasToBlob()

      // Create file from blob
      const fileName = `signature-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      // Upload to Supabase Storage
      const filePath = `${jobId}/${fileName}`
      const { data, error: uploadError } = await supabase.storage
        .from('job-evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-evidence')
        .getPublicUrl(filePath)

      // Create evidence record via API
      const response = await fetch(`/api/jobs/${jobId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'signature',
          phase,
          file_url: publicUrl,
          file_name: fileName,
          file_size: blob.size,
          mime_type: 'image/png',
          receiver_name: receiverName.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save signature')
      }

      const result = await response.json()

      // Call callback if provided
      if (onSignatureCapture) {
        onSignatureCapture(result)
      }

      // Clear form after successful upload
      clearSignature()
      setReceiverName('')

      alert('Signature captured successfully!')

    } catch (err) {
      console.error('Signature upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`signature-capture ${className}`}>
      <h3 style={{
        fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
        marginBottom: '16px',
        color: '#333',
        fontWeight: '600'
      }}>
        {phase === 'pickup' ? 'Pickup' : 'Delivery'} Signature
      </h3>

      {/* Receiver Name Input */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          marginBottom: '8px',
          color: '#333',
          fontWeight: '500'
        }}>
          Receiver Name *
        </label>
        <input
          type="text"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          placeholder={`Name of person ${phase === 'pickup' ? 'releasing' : 'receiving'} goods`}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            border: '1px solid #ddd',
            borderRadius: '6px',
            outline: 'none'
          }}
        />
      </div>

      {/* Signature Canvas */}
      <div style={{
        border: '2px solid #d4af37',
        borderRadius: '8px',
        background: '#fff',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px',
          background: '#f9f9f9',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            color: '#666',
            fontWeight: '500'
          }}>
            Sign below with your finger or mouse
          </span>
          <button
            onClick={clearSignature}
            disabled={isEmpty || uploading}
            style={{
              padding: '8px 16px',
              fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
              fontWeight: '600',
              color: isEmpty || uploading ? '#999' : '#ef4444',
              background: 'white',
              border: '1px solid',
              borderColor: isEmpty || uploading ? '#ddd' : '#ef4444',
              borderRadius: '4px',
              cursor: isEmpty || uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Clear
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: '200px',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />

        {isEmpty && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            color: '#ccc',
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            textAlign: 'center'
          }}>
            ✍️
            <div style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)', marginTop: '8px' }}>
              Draw signature here
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)'
        }}>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={uploadSignature}
        disabled={isEmpty || uploading || !receiverName.trim()}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          fontWeight: '600',
          color: 'white',
          background: isEmpty || uploading || !receiverName.trim() ? '#999' : '#22c55e',
          border: 'none',
          borderRadius: '8px',
          cursor: isEmpty || uploading || !receiverName.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {uploading ? 'Saving Signature...' : 'Save Signature'}
      </button>

      <style jsx>{`
        .signature-capture {
          position: relative;
        }
      `}</style>
    </div>
  )
}
