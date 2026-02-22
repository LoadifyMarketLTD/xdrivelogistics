'use client';
import { useState, useEffect, useCallback } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? '#D1FAE5' : type === 'error' ? '#FEE2E2' : '#DBEAFE';
  const textColor = type === 'success' ? '#065F46' : type === 'error' ? '#DC2626' : '#1E40AF';
  const borderColor = type === 'success' ? '#6EE7B7' : type === 'error' ? '#FCA5A5' : '#93C5FD';

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}`,
      display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '400px',
      animation: 'fadeInUp 0.3s ease'
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor, fontSize: '1.25rem', lineHeight: 1 }}>×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return { toast, showToast, hideToast };
}
