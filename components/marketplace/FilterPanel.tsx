'use client'

import { useState } from 'react'

export interface JobFilters {
  searchQuery: string
  vehicleType: string
  budgetMin: string
  budgetMax: string
  status: string
  sortBy: 'created_at' | 'budget' | 'pickup_datetime'
  sortOrder: 'asc' | 'desc'
}

interface FilterPanelProps {
  filters: JobFilters
  onFilterChange: (filters: JobFilters) => void
  onClear: () => void
  jobCount: number
}

export default function FilterPanel({ filters, onFilterChange, onClear, jobCount }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (key: keyof JobFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    })
  }

  const activeFilterCount = [
    filters.searchQuery,
    filters.vehicleType,
    filters.budgetMin,
    filters.budgetMax,
    filters.status !== 'all'
  ].filter(Boolean).length

  return (
    <div style={{
      backgroundColor: '#132433',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)',
      marginBottom: '24px',
      overflow: 'hidden'
    }}>
      {/* Filter Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.08)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            🔍 Filters & Search
          </span>
          {activeFilterCount > 0 && (
            <span style={{
              backgroundColor: 'var(--gold-premium)',
              color: '#0B1623',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {activeFilterCount} active
            </span>
          )}
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            {jobCount} {jobCount === 1 ? 'job' : 'jobs'} found
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: '#94a3b8'
        }}>
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                color: 'var(--gold-premium)',
                border: '1px solid var(--gold-premium)',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Clear All
            </button>
          )}
          <span style={{ fontSize: '20px' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div style={{ padding: '20px' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#94a3b8'
            }}>
              Search Location
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              placeholder="Search pickup or delivery location..."
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0B1623',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Vehicle Type */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#94a3b8'
              }}>
                Vehicle Type
              </label>
              <select
                value={filters.vehicleType}
                onChange={(e) => handleChange('vehicleType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0B1623',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Types</option>
                <option value="Van">Van</option>
                <option value="Luton">Luton</option>
                <option value="7.5T">7.5T</option>
                <option value="18T">18T</option>
                <option value="Artic">Artic</option>
                <option value="Flatbed">Flatbed</option>
              </select>
            </div>

            {/* Budget Min */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#94a3b8'
              }}>
                Min Budget (£)
              </label>
              <input
                type="number"
                value={filters.budgetMin}
                onChange={(e) => handleChange('budgetMin', e.target.value)}
                placeholder="0"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0B1623',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Budget Max */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#94a3b8'
              }}>
                Max Budget (£)
              </label>
              <input
                type="number"
                value={filters.budgetMax}
                onChange={(e) => handleChange('budgetMax', e.target.value)}
                placeholder="Any"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0B1623',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Sort By */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#94a3b8'
              }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleChange('sortBy', e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0B1623',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="created_at">Date Posted</option>
                <option value="budget">Budget</option>
                <option value="pickup_datetime">Pickup Date</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: '#94a3b8'
              }}>
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleChange('sortOrder', e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#0B1623',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="desc">
                  {filters.sortBy === 'budget' ? 'High to Low' : 'Newest First'}
                </option>
                <option value="asc">
                  {filters.sortBy === 'budget' ? 'Low to High' : 'Oldest First'}
                </option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.08)' 
          }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#94a3b8'
            }}>
              Quick Filters
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleChange('status', 'all')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filters.status === 'all' ? 'var(--gold-premium)' : 'transparent',
                  color: filters.status === 'all' ? '#0B1623' : '#fff',
                  border: '1px solid ' + (filters.status === 'all' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                📋 All Jobs
              </button>
              <button
                onClick={() => handleChange('status', 'open')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filters.status === 'open' ? 'var(--gold-premium)' : 'transparent',
                  color: filters.status === 'open' ? '#0B1623' : '#fff',
                  border: '1px solid ' + (filters.status === 'open' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🟢 Open Only
              </button>
              <button
                onClick={() => handleChange('status', 'urgent')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filters.status === 'urgent' ? 'var(--gold-premium)' : 'transparent',
                  color: filters.status === 'urgent' ? '#0B1623' : '#fff',
                  border: '1px solid ' + (filters.status === 'urgent' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🔥 Urgent
              </button>
              <button
                onClick={() => {
                  handleChange('sortBy', 'budget')
                  handleChange('sortOrder', 'desc')
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                💰 Highest Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
