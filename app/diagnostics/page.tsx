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
    userId: '',
    supabaseClientError: '',
    profile: null as any,
    profileError: '',
    derivedRole: '',
    currentPath: '',
  })

  useEffect(() => {
    const runDiagnostics = async () => {
      const timestamp = new Date().toISOString()
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : 'N/A'

      let urlDomain = ''
      if (url) {
        try {
          const urlObj = new URL(url)
          urlDomain = urlObj.hostname
        } catch {
          urlDomain = 'Invalid URL'
        }
      }

      const anonKeyPrefix = anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING'

      let sessionStatus = 'No session'
      let sessionError = ''
      let userEmail = ''
      let userId = ''
      let supabaseClientError = ''
      let profile: any = null
      let profileError = ''
      let derivedRole = ''

      if (url && anonKey) {
        try {
          const { supabase } = await import('@/lib/supabaseClient')

          try {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
              sessionStatus = 'Error'
              sessionError = error.message
            } else if (data.session) {
              sessionStatus = 'Active session'
              userEmail = data.session.user?.email || 'No email'
              userId = data.session.user?.id || ''

              // Fetch profile
              try {
                const { data: profileData, error: pErr } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', data.session.user.id)
                  .maybeSingle()

                if (pErr) {
                  profileError = pErr.message
                } else {
                  profile = profileData
                  derivedRole = profileData?.role || '(no role)'
                }
              } catch (pEx: any) {
                profileError = pEx?.message || String(pEx)
              }
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
        userId,
        supabaseClientError,
        profile,
        profileError,
        derivedRole,
        currentPath,
      })
    }

    runDiagnostics()
  }, [])

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const h2Style: React.CSSProperties = {
    fontSize: '18px',
    color: '#C8A64D',
    marginBottom: '15px',
    marginTop: 0,
  }

  return (
    <div style={{
      fontFamily: 'monospace',
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#0F1F2E',
      color: '#fff',
      minHeight: '100vh',
    }}>
      <h1 style={{
        color: '#C8A64D',
        fontSize: '24px',
        marginBottom: '30px',
        borderBottom: '2px solid #C8A64D',
        paddingBottom: '10px',
      }}>
        🔍 XDrive Diagnostics
      </h1>

      {/* Environment Variables */}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Environment Variables</h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
            <span style={{ color: diagnostics.hasUrl ? '#4ade80' : '#ff6b6b' }}>
              {diagnostics.hasUrl ? '✓ Present' : '✗ MISSING'}
            </span>
          </div>
          {diagnostics.hasUrl && (
            <div style={{ marginLeft: '20px', color: '#94a3b8' }}>Domain: {diagnostics.urlDomain}</div>
          )}
          <div style={{ marginTop: '10px' }}>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
            <span style={{ color: diagnostics.anonKeyPrefix !== 'MISSING' ? '#4ade80' : '#ff6b6b' }}>
              {diagnostics.anonKeyPrefix !== 'MISSING' ? '✓ Present' : '✗ MISSING'}
            </span>
          </div>
          {diagnostics.anonKeyPrefix !== 'MISSING' && (
            <div style={{ marginLeft: '20px', color: '#94a3b8' }}>Prefix: {diagnostics.anonKeyPrefix}</div>
          )}
        </div>
      </div>

      {/* Session Status */}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Session Status</h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>Status:</strong>{' '}
            <span style={{
              color: diagnostics.sessionStatus === 'Active session' ? '#4ade80' :
                diagnostics.sessionStatus === 'checking...' ? '#fbbf24' :
                  diagnostics.sessionStatus.includes('Error') || diagnostics.sessionStatus.includes('Exception') || diagnostics.sessionStatus.includes('Cannot') ? '#ff6b6b' :
                    '#94a3b8',
            }}>
              {diagnostics.sessionStatus}
            </span>
          </div>
          {diagnostics.userEmail && (
            <div style={{ marginTop: '8px' }}><strong>Email:</strong> {diagnostics.userEmail}</div>
          )}
          {diagnostics.userId && (
            <div><strong>User ID:</strong> {diagnostics.userId}</div>
          )}
          {diagnostics.supabaseClientError && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '4px', color: '#ff6b6b' }}>
              <strong>Client Error:</strong> {diagnostics.supabaseClientError}
            </div>
          )}
          {diagnostics.sessionError && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '4px', color: '#ff6b6b' }}>
              <strong>Session Error:</strong> {diagnostics.sessionError}
            </div>
          )}
        </div>
      </div>

      {/* Profile & Role */}
      <div style={sectionStyle}>
        <h2 style={h2Style}>Profile &amp; Role</h2>
        <div style={{ lineHeight: '1.8' }}>
          <div>
            <strong>Derived Role:</strong>{' '}
            <span style={{ color: diagnostics.derivedRole && diagnostics.derivedRole !== '(no role)' ? '#4ade80' : '#fbbf24' }}>
              {diagnostics.derivedRole || 'not loaded yet'}
            </span>
          </div>
          {diagnostics.profileError && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '4px', color: '#ff6b6b' }}>
              <strong>Profile Error:</strong> {diagnostics.profileError}
            </div>
          )}
          {diagnostics.profile && (
            <div style={{ marginTop: '12px' }}>
              <strong>Profile Object:</strong>
              <pre style={{ marginTop: '8px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                {JSON.stringify(diagnostics.profile, null, 2)}
              </pre>
            </div>
          )}
          {!diagnostics.profile && diagnostics.sessionStatus === 'Active session' && !diagnostics.profileError && (
            <div style={{ color: '#fbbf24', marginTop: '8px' }}>No profile found — user may need onboarding.</div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div style={sectionStyle}>
        <h2 style={h2Style}>System Info</h2>
        <div style={{ lineHeight: '1.8' }}>
          <div><strong>Current Path:</strong> {diagnostics.currentPath}</div>
          <div><strong>Timestamp:</strong> {diagnostics.timestamp}</div>
          <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 80) + '...' : 'N/A'}</div>
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: 'rgba(200, 166, 77, 0.1)',
        border: '1px solid rgba(200, 166, 77, 0.3)',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        <strong style={{ color: '#C8A64D' }}>⚠️ Troubleshooting:</strong>
        <ul style={{ marginTop: '10px', marginBottom: '0' }}>
          <li>If env vars are MISSING: Set them in Netlify for ALL deploy contexts (Production + Deploy Previews)</li>
          <li>Env vars must NOT be marked as "secret" — they are public client keys</li>
          <li>After setting env vars, trigger "Clear cache and deploy site" in Netlify</li>
          <li>If role is missing, user needs to complete onboarding at /onboarding</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#C8A64D', textDecoration: 'none', marginRight: '20px' }}>← Home</a>
        <a href="/login" style={{ color: '#C8A64D', textDecoration: 'none', marginRight: '20px' }}>Login</a>
        <a href="/dashboard" style={{ color: '#C8A64D', textDecoration: 'none', marginRight: '20px' }}>Dashboard</a>
        <a href="/onboarding" style={{ color: '#C8A64D', textDecoration: 'none' }}>Onboarding</a>
      </div>
    </div>
  )
}
