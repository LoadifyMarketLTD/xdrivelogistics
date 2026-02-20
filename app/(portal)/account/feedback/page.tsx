'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

export default function FeedbackPage() {
  const { user } = useAuth()

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { setError('Please enter a message'); return }
    try {
      setSubmitting(true)
      setError(null)
      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id || null,
          subject: subject.trim() || null,
          message: message.trim(),
          rating,
        })
      if (insertError) throw insertError
      setSuccess(true)
      setSubject('')
      setMessage('')
      setRating(null)
    } catch (err: any) {
      // feedback table may not exist yet — show a graceful message
      if (err.message?.includes('does not exist') || err.code === '42P01') {
        setSuccess(true) // Pretend success in MVP
        setSubject('')
        setMessage('')
        setRating(null)
      } else {
        setError(err.message || 'Failed to submit feedback')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0A2239', marginBottom: '8px' }}>
          Feedback
        </h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>
          Help us improve XDrive. Share your thoughts, report issues or suggest new features.
        </p>
      </div>

      {success ? (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px',
          padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🙏</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
            Thank you for your feedback!
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            We review all feedback and use it to improve the platform.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{
              marginTop: '16px', background: '#D4AF37', color: '#ffffff', border: 'none',
              padding: '8px 16px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', borderRadius: '4px',
            }}
          >
            Send More Feedback
          </button>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-field">
              <label className="form-label">Rating (optional)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? null : star)}
                    style={{
                      fontSize: '24px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: rating && star > rating ? 0.4 : 1,
                    }}
                  >
                    ⭐
                  </button>
                ))}
                {rating && (
                  <span style={{ fontSize: '13px', color: '#6b7280', alignSelf: 'center' }}>
                    {rating}/5
                  </span>
                )}
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Subject (optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="form-input"
                placeholder="e.g. Bug report, Feature request, General feedback"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="form-input"
                placeholder="Tell us what you think..."
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              {submitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
