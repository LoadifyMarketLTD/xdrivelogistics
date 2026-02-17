'use client'

import StatusPill from '../StatusPill'

interface Vehicle {
  notes: string | null
  id: string
  vehicle_type: string
  registration: string
  make: string | null
  model: string | null
  year: number | null
  capacity_kg: number | null
  is_available: boolean
  created_at: string
}

interface VehiclesTableProps {
  vehicles: Vehicle[]
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicleId: string) => void
}

export default function VehiclesTable({ vehicles, onEdit, onDelete }: VehiclesTableProps) {
  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Delete vehicle "${vehicle.registration}"?`)) {
      onDelete(vehicle.id)
    }
  }
  
  if (vehicles.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--portal-text-secondary)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚛</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No vehicles found</p>
        <p style={{ fontSize: '14px' }}>Add your first vehicle to get started.</p>
      </div>
    )
  }
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--portal-divider)', color: 'var(--portal-text-secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px' }}>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Registration</th>
            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Make/Model</th>
            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Capacity</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--portal-divider)' }}>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-primary)', fontWeight: '500' }}>
                {vehicle.vehicle_type}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-primary)' }}>
                {vehicle.registration}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--portal-text-secondary)' }}>
                {vehicle.make && vehicle.model ? `${vehicle.make} ${vehicle.model}` : '-'}
                {vehicle.year && ` (${vehicle.year})`}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--portal-text-secondary)' }}>
                {vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : '-'}
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <StatusPill status={vehicle.is_available ? 'Available' : 'In Use'} variant={vehicle.is_available ? 'success' : 'warning'} />
              </td>
              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => onEdit(vehicle)} className="portal-btn portal-btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }}>Edit</button>
                  <button onClick={() => handleDelete(vehicle)} className="portal-btn portal-btn-outline" style={{ padding: '4px 12px', fontSize: '12px', borderColor: 'var(--portal-error)', color: 'var(--portal-error)' }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
