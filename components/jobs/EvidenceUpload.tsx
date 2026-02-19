'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface EvidenceUploadProps {
  jobId: string
  phase: 'pickup' | 'delivery' | 'in_transit'
  onUploadComplete?: (evidence: any) => void
  className?: string
}

interface UploadedFile {
  file: File
  preview: string
  type: 'photo' | 'document'
}

export default function EvidenceUpload({ 
  jobId, 
  phase, 
  onUploadComplete,
  className = '' 
}: EvidenceUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
  }

  // Handle drag and drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Process and preview files
  const processFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      const isUnder10MB = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isUnder10MB) {
        setError(`File ${file.name} exceeds 10MB limit`)
        return false
      }
      
      if (!isImage && !isPDF) {
        setError(`File ${file.name} must be an image or PDF`)
        return false
      }
      
      return true
    })

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      type: file.type.startsWith('image/') ? 'photo' : 'document'
    }))

    setFiles(prev => [...prev, ...newFiles])
    setError(null)
  }

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // Upload files to Supabase Storage
  const uploadToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${jobId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('job-evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('job-evidence')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Submit evidence to API
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Upload each file and create evidence records
      for (const fileData of files) {
        // Upload to storage
        const fileUrl = await uploadToStorage(fileData.file)

        // Create evidence record via API
        const response = await fetch(`/api/jobs/${jobId}/evidence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: fileData.type,
            phase,
            file_url: fileUrl,
            file_name: fileData.file.name,
            file_size: fileData.file.size,
            mime_type: fileData.file.type,
            notes: notes || undefined,
            receiver_name: receiverName || undefined
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create evidence record')
        }

        const result = await response.json()
        
        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete(result)
        }
      }

      // Clear form after successful upload
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
      setFiles([])
      setNotes('')
      setReceiverName('')
      
      // Show success (could be enhanced with toast notification)
      alert('Evidence uploaded successfully!')
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload evidence')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`evidence-upload ${className}`}>
      {/* Drag & Drop Area */}
      <div
        className="upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #d4af37',
          borderRadius: '8px',
          padding: 'clamp(20px, 3vw, 40px)',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f9f9f9',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
          📤
        </div>
        <p style={{ 
          fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
          color: '#666',
          marginBottom: '8px'
        }}>
          Drag & drop files here or click to select
        </p>
        <p style={{ 
          fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
          color: '#999'
        }}>
          Images (JPEG, PNG, WebP) or PDF documents up to 10MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* File Preview */}
      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ 
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            marginBottom: '12px',
            color: '#333'
          }}>
            Selected Files ({files.length})
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {files.map((fileData, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#fff'
                }}
              >
                {fileData.type === 'photo' ? (
                  <img
                    src={fileData.preview}
                    alt={fileData.file.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    fontSize: '2rem'
                  }}>
                    📄
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  title="Remove file"
                >
                  ×
                </button>
                <div style={{
                  padding: '8px',
                  fontSize: 'clamp(0.625rem, 1vw, 0.75rem)',
                  color: '#666',
                  wordBreak: 'break-word'
                }}>
                  {fileData.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          {phase === 'delivery' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                marginBottom: '8px',
                color: '#333',
                fontWeight: '500'
              }}>
                Receiver Name (Optional)
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Name of person who received delivery"
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
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this evidence"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                border: '1px solid #ddd',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '16px',
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

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '16px',
            fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
            fontWeight: '600',
            color: 'white',
            background: uploading ? '#999' : '#22c55e',
            border: 'none',
            borderRadius: '8px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
        </button>
      )}

      <style jsx>{`
        .upload-dropzone:hover {
          border-color: #b8922e;
          background: #fafafa;
        }
      `}</style>
    </div>
  )
}
