'use client'

interface DirectoryFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  activeFilter: string
  onActiveChange: (filter: string) => void
}

export default function DirectoryFilters({
  searchTerm,
  onSearchChange,
  activeFilter,
  onActiveChange
}: DirectoryFiltersProps) {
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
        placeholder="Search by company name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="portal-filter-input"
        style={{ flex: '1', minWidth: '200px' }}
      />
      
      <select
        value={activeFilter}
        onChange={(e) => onActiveChange(e.target.value)}
        className="portal-filter-input"
        style={{ minWidth: '150px' }}
      >
        <option value="all">All Companies</option>
        <option value="active">Active Only</option>
        <option value="inactive">Inactive Only</option>
      </select>
    </div>
  )
}
