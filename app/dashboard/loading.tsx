export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0E1A26',
      color: '#E5E7EB'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '18px', 
          marginBottom: '16px',
          fontWeight: 600
        }}>
          Loading Dashboard...
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: 'rgba(229, 231, 235, 0.72)' 
        }}>
          Please wait while we load your data
        </div>
      </div>
    </div>
  )
}
