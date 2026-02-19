'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import '../globals.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!email) {
      setError('Please enter an email address')
      setLoading(false)
      return
    }

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      })

      if (resetError) {
        setError('Failed to send reset email. Please try again.')
      } else {
        setMessage('Password reset email sent! Please check your inbox.')
        setEmail('')
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
          background: #f9fafb;
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
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 48px 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px 0;
          text-align: center;
        }

        .login-title-accent {
          color: #C8A64D;
        }

        .subtitle {
          color: #6b7280;
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
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #C8A64D;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: #C8A64D;
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .login-btn:hover {
          background: #B39543;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc2626;
          font-size: 14px;
          margin-top: 16px;
          text-align: center;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }

        .success-message {
          color: #16a34a;
          font-size: 14px;
          margin-top: 16px;
          text-align: center;
          padding: 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .back-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #C8A64D;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #B39543;
        }

        .support-text {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }

        .support-phone {
          color: #C8A64D;
          font-weight: 600;
          text-decoration: none;
        }

        .support-phone:hover {
          color: #B39543;
        }
      `}</style>

      <div className="login-card">
        <h1 className="login-title">
          <span className="login-title-accent">Forgot</span> Password?
        </h1>
        <p className="subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
        </form>

        <Link href="/login" className="back-link">
          ← Back to Login
        </Link>

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
