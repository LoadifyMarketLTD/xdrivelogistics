'use client';
import { useRef, useState, useEffect } from 'react';

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  label?: string;
}

export function SignatureCanvas({ onSave, onClear, label = 'Recipient Signature' }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear?.();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ marginBottom: '0.25rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
          Recipient Name
        </label>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Full name of recipient"
          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #D1D5DB', borderRadius: '7px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')}
          onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
        />
      </div>

      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</label>
      <div style={{ border: '1.5px solid #D1D5DB', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ display: 'block', width: '100%', touchAction: 'none', cursor: 'crosshair' }}
        />
        {!hasSignature && (
          <div style={{ position: 'absolute', pointerEvents: 'none' }} />
        )}
      </div>
      {!hasSignature && (
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>Draw signature above</p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={clear}
          style={{ padding: '0.5rem 1.1rem', border: '1.5px solid #D1D5DB', borderRadius: '7px', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasSignature}
          style={{ padding: '0.5rem 1.25rem', backgroundColor: hasSignature ? '#1F7A3D' : '#D1D5DB', color: 'white', border: 'none', borderRadius: '7px', cursor: hasSignature ? 'pointer' : 'not-allowed', fontSize: '0.85rem', fontWeight: 700 }}
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
