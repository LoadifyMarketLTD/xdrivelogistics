import React from 'react'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    wide?: number
    ultrawide?: number
  }
  gap?: string
  className?: string
}

/**
 * ResponsiveGrid - Responsive grid that adapts column count based on screen size
 * Default: 1 col (mobile), 2 cols (tablet), 3 cols (desktop), 4+ cols (wide)
 */
export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4, ultrawide: 6 },
  gap = 'clamp(10px, 1.6vw, 20px)',
  className = '',
}: ResponsiveGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.mobile || 1}, minmax(0, 1fr))`,
        gap,
      }}
      className={`responsive-grid ${className}`}
    >
      <style jsx>{`
        .responsive-grid {
          display: grid;
          gap: ${gap};
        }

        /* Mobile */
        @media (max-width: 767px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.mobile || 1}, minmax(0, 1fr));
          }
        }

        /* Tablet */
        @media (min-width: 768px) and (max-width: 1023px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.tablet || 2}, minmax(0, 1fr));
          }
        }

        /* Desktop */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.desktop || 3}, minmax(0, 1fr));
          }
        }

        /* Wide Desktop */
        @media (min-width: 1440px) and (max-width: 2559px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.wide || 4}, minmax(0, 1fr));
          }
        }

        /* Ultra-wide (4K) */
        @media (min-width: 2560px) {
          .responsive-grid {
            grid-template-columns: repeat(${columns.ultrawide || 6}, minmax(0, 1fr));
          }
        }
      `}</style>
      {children}
    </div>
  )
}
