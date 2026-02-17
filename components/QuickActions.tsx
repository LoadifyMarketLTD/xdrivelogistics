'use client'

interface QuickActionsProps {
  jobId: string
  isOwner: boolean
  canEdit: boolean
  onContactPoster?: () => void
  onEditJob?: () => void
  onWithdrawBid?: () => void
  posterEmail?: string
}

export default function QuickActions({
  jobId,
  isOwner,
  canEdit,
  onContactPoster,
  onEditJob,
  onWithdrawBid,
  posterEmail
}: QuickActionsProps) {
  const shareJob = () => {
    const url = `${window.location.origin}/marketplace/${jobId}`
    navigator.clipboard.writeText(url)
    
    // Show temporary toast (simple implementation)
    const toast = document.createElement('div')
    toast.textContent = '✅ Link copied to clipboard!'
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(47,143,91,0.9);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const contactPoster = () => {
    if (posterEmail) {
      window.location.href = `mailto:${posterEmail}?subject=Inquiry about job ${jobId}`
    } else if (onContactPoster) {
      onContactPoster()
    }
  }

  return (
    <div style={{
      backgroundColor: '#132433',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '24px'
    }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '16px',
        color: '#fff'
      }}>
        ⚡ Quick Actions
      </h3>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        {/* Share Job - Available to everyone */}
        <button
          onClick={shareJob}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.borderColor = 'var(--gold-premium)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        >
          <span style={{ fontSize: '16px' }}>🔗</span>
          Share Job
        </button>

        {/* Contact Poster - For non-owners */}
        {!isOwner && (
          <button
            onClick={contactPoster}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'var(--gold-premium)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            <span style={{ fontSize: '16px' }}>✉️</span>
            Contact Poster
          </button>
        )}

        {/* Edit Job - For owners with edit permission */}
        {isOwner && canEdit && onEditJob && (
          <button
            onClick={onEditJob}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'var(--gold-premium)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            <span style={{ fontSize: '16px' }}>✏️</span>
            Edit Job
          </button>
        )}

        {/* Withdraw Bid - For bidders */}
        {!isOwner && onWithdrawBid && (
          <button
            onClick={onWithdrawBid}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span style={{ fontSize: '16px' }}>↩️</span>
            Withdraw Bid
          </button>
        )}

        {/* Back to Marketplace */}
        <a
          href="/marketplace"
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.borderColor = 'var(--gold-premium)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
          }}
        >
          <span style={{ fontSize: '16px' }}>←</span>
          Back to Marketplace
        </a>
      </div>
    </div>
  )
}
