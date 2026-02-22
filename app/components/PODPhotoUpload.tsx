'use client';
import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface PODPhotoUploadProps {
  jobId: string;
  onUploadComplete?: (url: string) => void;
  existingPhotos?: string[];
}

export function PODPhotoUpload({ jobId, onUploadComplete, existingPhotos = [] }: PODPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fileName = `pod/${jobId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data, error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(data.path);
      const url = urlData.publicUrl;
      setPhotos((prev) => [...prev, url]);
      onUploadComplete?.(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          {photos.map((url, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <img src={url} alt={`POD ${i + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s', opacity: uploading ? 0.7 : 1 }}
        onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.borderColor = '#1E4E8C'; e.currentTarget.style.backgroundColor = '#EFF6FF'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
      >
        {uploading ? (
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>⏳</div>
            <p style={{ color: '#6B7280', margin: 0, fontSize: '0.875rem' }}>Uploading…</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>📷</div>
            <p style={{ color: '#374151', margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>Add POD Photo</p>
            <p style={{ color: '#9CA3AF', margin: '0.2rem 0 0', fontSize: '0.78rem' }}>Tap to take photo or choose from gallery</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p style={{ color: '#DC2626', fontSize: '0.82rem', margin: 0 }}>⚠️ {error}</p>}
      {photos.length > 0 && <p style={{ color: '#6B7280', fontSize: '0.78rem', margin: 0 }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} attached</p>}
    </div>
  );
}
