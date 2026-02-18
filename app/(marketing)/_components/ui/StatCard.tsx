interface StatCardProps {
  value: string
  label: string
  icon?: string
}

export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--brand)',
        marginBottom: '0.25rem',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--muted)',
      }}>
        {label}
      </div>
    </div>
  )
}
