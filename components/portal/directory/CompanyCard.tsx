'use client'

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
}

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    })
  }
  
  return (
    <div className="portal-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--portal-text-primary)',
            marginBottom: '4px'
          }}>
            {company.name}
          </h3>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--portal-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Member since {formatDate(company.created_at)}
            {company.is_active && (
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--portal-success)',
                display: 'inline-block'
              }} />
            )}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {company.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📧</span>
            <a 
              href={`mailto:${company.email}`}
              style={{ 
                fontSize: '14px', 
                color: 'var(--portal-accent)',
                textDecoration: 'none'
              }}
            >
              {company.email}
            </a>
          </div>
        )}
        
        {company.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📞</span>
            <a 
              href={`tel:${company.phone}`}
              style={{ 
                fontSize: '14px', 
                color: 'var(--portal-text-primary)',
                textDecoration: 'none'
              }}
            >
              {company.phone}
            </a>
          </div>
        )}
        
        {company.address && (
          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{ 
              fontSize: '14px', 
              color: 'var(--portal-text-secondary)',
              lineHeight: '1.5'
            }}>
              {company.address}
            </span>
          </div>
        )}
        
        {!company.email && !company.phone && !company.address && (
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--portal-text-muted)',
            fontStyle: 'italic',
            padding: '8px 0'
          }}>
            No contact information available
          </div>
        )}
      </div>
      
      {!company.is_active && (
        <div style={{ 
          marginTop: '12px',
          padding: '8px',
          backgroundColor: 'var(--portal-warning-bg)',
          borderRadius: '6px',
          fontSize: '12px',
          color: 'var(--portal-warning)',
          textAlign: 'center'
        }}>
          Inactive
        </div>
      )}
    </div>
  )
}
