'use client'

interface Company {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
}

interface CompanyInfoCardProps {
  company: Company
  showContact?: boolean
}

export default function CompanyInfoCard({ company, showContact = true }: CompanyInfoCardProps) {
  return (
    <div style={{
      backgroundColor: '#0B1623',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '20px',
        color: '#fff'
      }}>
        🏢 Company Information
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Company Name */}
        <div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8', 
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Company
          </div>
          <div style={{ 
            fontSize: '16px', 
            color: '#fff',
            fontWeight: '600'
          }}>
            {company.name}
          </div>
        </div>

        {/* Address */}
        {company.address && (
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#94a3b8', 
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Address
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#fff',
              lineHeight: '1.6'
            }}>
              📍 {company.address}
            </div>
          </div>
        )}

        {showContact && (
          <>
            {/* Phone */}
            {company.phone && (
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8', 
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Phone
                </div>
                <a 
                  href={`tel:${company.phone}`}
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--gold-premium)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  📞 {company.phone}
                </a>
              </div>
            )}

            {/* Email */}
            {company.email && (
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8', 
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </div>
                <a 
                  href={`mailto:${company.email}`}
                  style={{ 
                    fontSize: '14px', 
                    color: 'var(--gold-premium)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    wordBreak: 'break-all'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  📧 {company.email}
                </a>
              </div>
            )}
          </>
        )}

        {/* Description */}
        {company.description && (
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: '#94a3b8', 
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              About
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#94a3b8',
              lineHeight: '1.6'
            }}>
              {company.description}
            </div>
          </div>
        )}

        {/* Stats Placeholder */}
        <div style={{
          marginTop: '8px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '20px', 
              color: 'var(--gold-premium)',
              fontWeight: '700'
            }}>
              -
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#94a3b8',
              marginTop: '4px'
            }}>
              Jobs Posted
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '20px', 
              color: 'var(--gold-premium)',
              fontWeight: '700'
            }}>
              -
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#94a3b8',
              marginTop: '4px'
            }}>
              Completed
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
