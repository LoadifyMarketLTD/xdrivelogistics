'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import '../globals.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email) {
      setError('Please enter an email address')
      setLoading(false)
      return
    }

    if (!password) {
      setError('Please enter a password')
      setLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Invalid email or password. Please try again.')
        setPassword('')
      } else if (data.user) {
        router.push('/dashboard')
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
          font-size: 32px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 32px 0;
          text-align: center;
        }

        .login-title-accent {
          color: #C8A64D;
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

        .forgot-password-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #C8A64D;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password-link:hover {
          color: #D4B866;
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
          <span className="login-title-accent">XDrive</span> Platform Login
        </h1>

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

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Platform'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <Link href="/forgot-password" className="forgot-password-link">
          Forgot password?
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
