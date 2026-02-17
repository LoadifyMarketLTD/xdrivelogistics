'use client'

import StatusPill from '../StatusPill'

interface Driver {
  notes: string | null
  id: string
  full_name: string
  phone: string | null
  email: string | null
  license_number: string | null
  is_active: boolean
  created_at: string
}

interface DriversTableProps {
  drivers: Driver[]
  onEdit: (driver: Driver) => void
  onDelete: (driverId: string) => void
}

export default function DriversTable({ drivers, onEdit, onDelete }: DriversTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
  
  const handleDelete = (driver: Driver) => {
    if (confirm(`Are you sure you want to delete driver "${driver.full_name}"?`)) {
      onDelete(driver.id)
    }
  }
  
  if (drivers.length === 0) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        color: 'var(--portal-text-secondary)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No drivers found</p>
        <p style={{ fontSize: '14px' }}>Add your first driver to get started.</p>
      </div>
    )
  }
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '13px'
      }}>
        <thead>
          <tr style={{ 
            borderBottom: '2px solid var(--portal-divider)',
            color: 'var(--portal-text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: '11px',
            letterSpacing: '0.5px'
          }}>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Phone</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>License</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Added</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr 
              key={driver.id}
              style={{ 
                borderBottom: '1px solid var(--portal-divider)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--portal-bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-primary)', fontWeight: '500' }}>
                {driver.full_name}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {driver.phone ? (
                  <a href={`tel:${driver.phone}`} style={{ color: 'var(--portal-accent)', textDecoration: 'none' }}>
                    {driver.phone}
                  </a>
                ) : (
                  <span style={{ color: 'var(--portal-text-muted)', fontStyle: 'italic' }}>-</span>
                )}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {driver.email ? (
                  <a href={`mailto:${driver.email}`} style={{ color: 'var(--portal-accent)', textDecoration: 'none' }}>
                    {driver.email}
                  </a>
                ) : (
                  <span style={{ color: 'var(--portal-text-muted)', fontStyle: 'italic' }}>-</span>
                )}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {driver.license_number || <span style={{ color: 'var(--portal-text-muted)', fontStyle: 'italic' }}>-</span>}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <StatusPill 
                  status={driver.is_active ? 'Active' : 'Inactive'} 
                  variant={driver.is_active ? 'success' : 'error'}
                />
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-muted)' }}>
                {formatDate(driver.created_at)}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    onClick={() => onEdit(driver)}
                    className="portal-btn portal-btn-outline"
                    style={{ 
                      padding: '4px 12px',
                      fontSize: '12px',
                      textTransform: 'none'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver)}
                    className="portal-btn portal-btn-outline"
                    style={{ 
                      padding: '4px 12px',
                      fontSize: '12px',
                      textTransform: 'none',
                      borderColor: 'var(--portal-error)',
                      color: 'var(--portal-error)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
