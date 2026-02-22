'use client';
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface PODPhotoUploadProps {
  jobId: string;
  onUploadComplete?: (url: string) => void;
}

export function PODPhotoUpload({ jobId, onUploadComplete }: PODPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');
    setUploading(true);

    try {
      const fileName = `pod/${jobId}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(data.path);
      onUploadComplete?.(urlData.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '1.5rem',
          textAlign: 'center', cursor: 'pointer', backgroundColor: '#F9FAFB',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1E4E8C'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
      >
        {preview ? (
          <img src={preview} alt="POD preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }} />
        ) : (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
            <p style={{ color: '#6B7280', margin: 0 }}>Tap to take/upload POD photo</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
      {uploading && <p style={{ color: '#6B7280', textAlign: 'center', margin: 0 }}>Uploading...</p>}
      {error && <p style={{ color: '#DC2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
    </div>
  );
}
