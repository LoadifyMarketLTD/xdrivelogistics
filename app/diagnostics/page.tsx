'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState({
    hasUrl: false,
    urlDomain: '',
    anonKeyPrefix: '',
    timestamp: '',
    sessionStatus: 'checking...',
    sessionError: '',
    userEmail: '',
    supabaseClientError: '',
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      const timestamp = new Date().toISOString()
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      // Extract domain from URL
      let urlDomain = ''
      if (url) {
        try {
          const urlObj = new URL(url)
          urlDomain = urlObj.hostname
        } catch {
          urlDomain = 'Invalid URL'
        }
      }

      // Get first 20 chars of anon key (safe to display)
      const anonKeyPrefix = anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING'

      let sessionStatus = 'No session'
      let sessionError = ''
      let userEmail = ''
      let supabaseClientError = ''

      // Only try to load supabase client if env vars are present
      if (url && anonKey) {
        try {
          // Dynamically import to avoid the error throwing at module load time
          const { supabase } = await import('@/lib/supabaseClient')
          
          try {
            const { data, error } = await supabase.auth.getSession()
            
            if (error) {
              sessionStatus = 'Error'
              sessionError = error.message
            } else if (data.session) {
              sessionStatus = 'Active session'
              userEmail = data.session.user?.email || 'No email'
            } else {
              sessionStatus = 'No active session'
            }
          } catch (err) {
            sessionStatus = 'Exception'
            sessionError = err instanceof Error ? err.message : String(err)
          }
        } catch (clientErr) {
          supabaseClientError = clientErr instanceof Error ? clientErr.message : String(clientErr)
          sessionStatus = 'Cannot initialize Supabase client'
        }
      } else {
        sessionStatus = 'Skipped - env vars missing'
        sessionError = 'Cannot check session without valid Supabase credentials'
      }

      setDiagnostics({
        hasUrl: !!url,
        urlDomain,
        anonKeyPrefix,
        timestamp,
        sessionStatus,
        sessionError,
        userEmail,
        supabaseClientError,
      })
    }

    runDiagnostics()
  }, [])

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#0F1F2E',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#C8A64D',
        fontSize: '24px',
        marginBottom: '30px',
        borderBottom: '2px solid #C8A64D',
        paddingBottom: '10px'
      }}>
        🔍 Supabase Diagnostics
      </h1>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', color: '#C8A64D', marginBottom: '15px' }}>
          Environment Variables
        </h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
            <span style={{ color: diagnostics.hasUrl ? '#4ade80' : '#ff6b6b' }}>
              {diagnostics.hasUrl ? '✓ Present' : '✗ MISSING'}
            </span>
          </div>
          {diagnostics.hasUrl && (
            <div style={{ marginLeft: '20px', color: '#94a3b8' }}>
              Domain: {diagnostics.urlDomain}
            </div>
          )}
          
          <div style={{ marginTop: '10px' }}>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
            <span style={{ color: diagnostics.anonKeyPrefix !== 'MISSING' ? '#4ade80' : '#ff6b6b' }}>
              {diagnostics.anonKeyPrefix !== 'MISSING' ? '✓ Present' : '✗ MISSING'}
            </span>
          </div>
          {diagnostics.anonKeyPrefix !== 'MISSING' && (
            <div style={{ marginLeft: '20px', color: '#94a3b8' }}>
              Prefix: {diagnostics.anonKeyPrefix}
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', color: '#C8A64D', marginBottom: '15px' }}>
          Session Status
        </h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>Status:</strong>{' '}
            <span style={{ 
              color: diagnostics.sessionStatus === 'Active session' ? '#4ade80' : 
                     diagnostics.sessionStatus === 'checking...' ? '#fbbf24' : 
                     diagnostics.sessionStatus.includes('Error') || diagnostics.sessionStatus.includes('Exception') || diagnostics.sessionStatus.includes('Cannot') ? '#ff6b6b' :
                     '#94a3b8'
            }}>
              {diagnostics.sessionStatus}
            </span>
          </div>
          
          {diagnostics.userEmail && (
            <div style={{ marginTop: '10px' }}>
              <strong>User:</strong> {diagnostics.userEmail}
            </div>
          )}
          
          {diagnostics.supabaseClientError && (
            <div style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '4px',
              color: '#ff6b6b'
            }}>
              <strong>Supabase Client Error:</strong> {diagnostics.supabaseClientError}
            </div>
          )}
          
          {diagnostics.sessionError && (
            <div style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '4px',
              color: '#ff6b6b'
            }}>
              <strong>Session Error:</strong> {diagnostics.sessionError}
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ fontSize: '18px', color: '#C8A64D', marginBottom: '15px' }}>
          System Info
        </h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>Timestamp:</strong> {diagnostics.timestamp}
          </div>
          <div>
            <strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 60) + '...' : 'N/A'}
          </div>
          <div>
            <strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        backgroundColor: 'rgba(200, 166, 77, 0.1)',
        border: '1px solid rgba(200, 166, 77, 0.3)',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong style={{ color: '#C8A64D' }}>⚠️ Troubleshooting:</strong>
        <ul style={{ marginTop: '10px', marginBottom: '0' }}>
          <li>If env vars are MISSING: Set them in Netlify for ALL deploy contexts (Production + Deploy Previews)</li>
          <li>Env vars must NOT be marked as "secret" - they are public client keys</li>
          <li>After setting env vars, trigger "Clear cache and deploy site" in Netlify</li>
          <li>Session errors may indicate wrong Supabase URL or network issues</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a 
          href="/" 
          style={{ 
            color: '#C8A64D',
            textDecoration: 'none',
            marginRight: '20px'
          }}
        >
          ← Home
        </a>
        <a 
          href="/login" 
          style={{ 
            color: '#C8A64D',
            textDecoration: 'none',
            marginRight: '20px'
          }}
        >
          Login
        </a>
        <a 
          href="/dashboard" 
          style={{ 
            color: '#C8A64D',
            textDecoration: 'none'
          }}
        >
          Dashboard
        </a>
      </div>
    </div>
  )
}
