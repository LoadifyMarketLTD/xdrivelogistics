'use client'

import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function BlockedPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '48px 40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <Image src="/logo.webp" alt="XDrive Logistics LTD" width={140} height={40} style={{ display: 'inline-block' }} priority />
          </div>

          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626', margin: '0 0 12px' }}>Account Suspended</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '24px' }}>
            Your account has been suspended. If you believe this is a mistake, please contact support.
          </p>

          <a
            href="tel:07423272138"
            style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#C8A64D', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', marginBottom: '20px' }}
          >
            📞 Contact Support: 07423272138
          </a>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
