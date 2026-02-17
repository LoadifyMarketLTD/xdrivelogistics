'use client'

interface QuotesFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export default function QuotesFilters({
  statusFilter,
  onStatusChange,
  searchTerm,
  onSearchChange
}: QuotesFiltersProps) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <input
        type="text"
        placeholder="Search by route or location..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="portal-filter-input"
        style={{ flex: '1', minWidth: '200px' }}
      />
      
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="portal-filter-input"
        style={{ minWidth: '150px' }}
      >
        <option value="all">All Status</option>
        <option value="submitted">Submitted</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
        <option value="withdrawn">Withdrawn</option>
      </select>
    </div>
  )
}
