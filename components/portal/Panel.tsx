export default function Panel({ 
  title, 
  subtitle, 
  children,
  action 
}: { 
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="portal-panel">
      <div className="portal-panel-header">
        <div>
          <div className="portal-panel-title">{title}</div>
          {subtitle && <div className="portal-panel-subtitle">{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
