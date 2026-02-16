'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import '../globals.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!password) {
      setError('Please enter a new password')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError('Failed to update password. Please try again.')
      } else {
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <style jsx global>{`
        body {
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #0F1F2E 0%, #152B3C 50%, #1A3347 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-screen {
          width: 100%;
          max-width: 420px;
          padding: 24px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .login-title-accent {
          color: #C8A64D;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #C8A64D;
          background: rgba(255, 255, 255, 0.12);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #C8A64D 0%, #B39543 100%);
          border: none;
          border-radius: 8px;
          color: #0F1F2E;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(200, 166, 77, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          color: #ff6b6b;
          font-size: 14px;
          margin-top: 16px;
          text-align: center;
          padding: 12px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 8px;
        }

        .success-message {
          color: #4ade80;
          font-size: 14px;
          margin-top: 16px;
          text-align: center;
          padding: 12px;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 8px;
        }

        .support-text {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1.6;
        }

        .support-phone {
          color: #C8A64D;
          font-weight: 600;
          text-decoration: none;
        }

        .support-phone:hover {
          color: #D4B866;
        }
      `}</style>

      <div className="login-card">
        <h1 className="login-title">
          <span className="login-title-accent">Reset</span> Password
        </h1>
        <p className="subtitle">
          Enter your new password below.
        </p>

        {isValidSession ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
          </form>
        ) : (
          <div className="error-message">
            {error || 'Loading...'}
          </div>
        )}

        <div className="support-text">
          Need help? Call or WhatsApp:<br />
          <a href="tel:07423272138" className="support-phone">
            07423272138
          </a>
        </div>
      </div>
    </div>
  )
}
