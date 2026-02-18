import { ReactNode } from 'react'

interface PrimaryButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export default function PrimaryButton({ 
  children, 
  href, 
  onClick, 
  variant = 'primary',
  size = 'md'
}: PrimaryButtonProps) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--r-md)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    border: 'none',
  }

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  }

  const variantStyles = {
    primary: {
      background: 'var(--brand)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
  }

  const style = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  }

  if (href) {
    return (
      <a href={href} style={style}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  )
}
