'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

interface Company {
  id: string
  name: string
  city: string | null
  postcode: string | null
  phone: string | null
  created_at: string
}

export default function DirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<'name' | 'city'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, city, postcode, phone, created_at')
        .order('name', { ascending: true })
      
      if (error) throw error
      
      setCompanies(data || [])
    } catch (err: any) {
      console.error('Error fetching companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (column: 'name' | 'city') => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedCompanies = companies
    .filter(company =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.postcode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = ''
      let bVal = ''
      
      if (sortColumn === 'name') {
        aVal = a.name || ''
        bVal = b.name || ''
      } else if (sortColumn === 'city') {
        aVal = a.city || ''
        bVal = b.city || ''
      }
      
      const comparison = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading directory...
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f2937',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Company Directory
        </h1>
        
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            width: '300px',
            color: '#1f2937',
          }}
        />
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr',
          gap: '12px',
          padding: '12px 16px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '700',
          color: '#6b7280',
          textTransform: 'uppercase',
        }}>
          <div
            onClick={() => handleSort('name')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            Company {sortColumn === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div
            onClick={() => handleSort('city')}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            Location {sortColumn === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
          </div>
          <div>Rating</div>
          <div>Contact</div>
          <div>Status</div>
        </div>

        {/* Table Rows */}
        {filteredAndSortedCompanies.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#9ca3af',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No companies found
            </div>
            <div style={{ fontSize: '13px' }}>
              {searchTerm ? 'Try adjusting your search' : 'No companies in directory'}
            </div>
          </div>
        ) : (
          filteredAndSortedCompanies.map((company) => (
            <div
              key={company.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{ fontWeight: '600' }}>{company.name}</div>
              <div>
                {company.city || '—'}
                {company.postcode && ` ${company.postcode}`}
              </div>
              <div>
                <span style={{
                  color: '#f59e0b',
                  fontSize: '14px',
                }}>
                  ★★★★☆
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {company.phone || 'No phone'}
              </div>
              <div>
                <span style={{
                  padding: '2px 8px',
                  background: '#d1fae5',
                  color: '#065f46',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        marginTop: '16px',
        fontSize: '13px',
        color: '#6b7280',
      }}>
        Showing {filteredAndSortedCompanies.length} of {companies.length} companies
      </div>
    </div>
  )
}
