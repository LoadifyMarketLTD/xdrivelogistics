'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../../lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const reset = () => { setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); setSuccessMessage(''); };

  const switchMode = (m: 'login' | 'register') => { setMode(m); reset(); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); setLoading(true);
    try {
      if (!supabase) throw new Error('Authentication service unavailable.');
      if (mode === 'register') {
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Registration successful! Check your email to confirm your account.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setSuccessMessage('Successfully logged in!');
          setTimeout(() => { onClose(); router.push('/admin'); }, 900);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #E5E7EB',
    borderRadius: '7px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); reset(); } }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, backdropFilter: 'blur(2px)' }} />
        <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'white', borderRadius: '14px', padding: '2rem', width: '90%', maxWidth: '440px', zIndex: 51, boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)' }}>
          <Dialog.Title style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0A2239', marginBottom: '0.25rem' }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Dialog.Title>
          <Dialog.Description style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem' }}>
            {mode === 'login' ? 'Access your Danny Courier dashboard' : 'Register for a new account'}
          </Dialog.Description>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '0.25rem' }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s', backgroundColor: mode === m ? 'white' : 'transparent', color: mode === m ? '#0A2239' : '#6B7280', boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}
                style={inputStyle} placeholder="you@example.com"
                onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading}
                style={inputStyle} placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
            {mode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading}
                  style={inputStyle} placeholder="••••••••"
                  onFocus={(e) => (e.target.style.borderColor = '#1E4E8C')} onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')} />
              </div>
            )}

            {error && (
              <div style={{ padding: '0.7rem 0.9rem', marginBottom: '1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '7px', fontSize: '0.85rem', border: '1px solid #FECACA' }}>
                ⚠️ {error}
              </div>
            )}
            {successMessage && (
              <div style={{ padding: '0.7rem 0.9rem', marginBottom: '1rem', backgroundColor: '#F0FDF4', color: '#15803D', borderRadius: '7px', fontSize: '0.85rem', border: '1px solid #BBF7D0' }}>
                ✓ {successMessage}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.8rem', backgroundColor: loading ? '#9CA3AF' : '#0A2239', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1E4E8C'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0A2239'; }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <Dialog.Close asChild>
            <button aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem', width: '2rem', height: '2rem', borderRadius: '50%', border: 'none', background: '#F3F4F6', cursor: 'pointer', fontSize: '1.1rem', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
