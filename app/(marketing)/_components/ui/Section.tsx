import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export default function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={className} style={{
      width: '100%',
      paddingTop: '4rem',
      paddingBottom: '4rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}>
        {children}
      </div>
    </section>
  )
}
