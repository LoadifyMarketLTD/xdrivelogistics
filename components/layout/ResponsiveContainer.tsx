import React from 'react'

interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
}

const maxWidthMap = {
  sm: '640px',
  md: '896px',
  lg: '1200px',
  xl: '1400px',
  full: '100%',
}

/**
 * ResponsiveContainer - Provides consistent max-width and padding across the application
 * Uses clamp() for fluid spacing that scales with viewport width
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  className = '',
  as: Component = 'div',
}: ResponsiveContainerProps) {
  return (
    <Component
      style={{
        width: '100%',
        maxWidth: maxWidthMap[maxWidth],
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'clamp(12px, 2vw, 28px)',
        paddingRight: 'clamp(12px, 2vw, 28px)',
      }}
      className={className}
    >
      {children}
    </Component>
  )
}
