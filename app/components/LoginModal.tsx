'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../../lib/supabaseClient';

interface LoginModalProps { isOpen: boolean; onClose: () => void; }

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); setLoading(true);
    try {
      if (!supabase) throw new Error('Authentication service unavailable.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setSuccessMessage('Successfully logged in!');
        setTimeout(() => { onClose(); router.push('/admin'); }, 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally { setLoading(false); }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50 }} />
        <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '450px', zIndex: 51, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
          <Dialog.Title style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0A2239', marginBottom: '1rem' }}>Sign In</Dialog.Title>
          <Dialog.Description style={{ fontSize: '0.95rem', color: '#5B6B85', marginBottom: '1.5rem' }}>Sign in to access your dashboard</Dialog.Description>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="modal-email" style={{ display: 'block', marginBottom: '0.5rem', color: '#0B1B33', fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
              <input id="modal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="modal-password" style={{ display: 'block', marginBottom: '0.5rem', color: '#0B1B33', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
              <input id="modal-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
            {error && <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #FCA5A5' }}>{error}</div>}
            {successMessage && <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid #6EE7B7' }}>{successMessage}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.875rem', backgroundColor: loading ? '#86EFAC' : '#1F7A3D', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#166534'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1F7A3D'; }}>
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
          <Dialog.Close asChild>
            <button aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.1)', cursor: 'pointer', fontSize: '1.25rem', color: '#6B7280' }}>×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
