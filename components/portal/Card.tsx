import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
  noPadding?: boolean
}

export default function Card({ 
  children, 
  className = '',
  title,
  subtitle,
  action,
  noPadding = false
}: CardProps) {
  return (
    <div className={`premium-card ${className}`}>
      {(title || action) && (
        <div className="premium-card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {title && <h3 className="premium-card-title">{title}</h3>}
              {subtitle && <p className="premium-card-subtitle">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div style={noPadding ? {} : undefined}>
        {children}
      </div>
    </div>
  )
}
