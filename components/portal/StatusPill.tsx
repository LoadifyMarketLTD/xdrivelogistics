export default function StatusPill({ 
  status, 
  variant = 'success' 
}: { 
  status: string
  variant?: 'success' | 'warning' | 'info' | 'error'
}) {
  return (
    <span className={`portal-status-pill ${variant}`}>
      {status}
    </span>
  )
}
