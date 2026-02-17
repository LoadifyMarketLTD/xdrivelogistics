export default function StatCard({ 
  label, 
  value, 
  change,
  trend 
}: { 
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="portal-stat-card">
      <div className="portal-stat-label">{label}</div>
      <div className="portal-stat-value">{value}</div>
      {change && (
        <div className={`portal-stat-change ${trend === 'down' ? 'negative' : ''}`}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {change}
        </div>
      )}
    </div>
  )
}
