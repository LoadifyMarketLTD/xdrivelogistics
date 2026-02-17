'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Panel from '@/components/portal/Panel'
import CompanyCard from '@/components/portal/directory/CompanyCard'
import DirectoryFilters from '@/components/portal/directory/DirectoryFilters'

export const dynamic = 'force-dynamic'

interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
}

export default function DirectoryPage() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('id, name, email, phone, address, is_active, created_at')
          .order('name', { ascending: true })
        
        if (fetchError) throw fetchError
        
        setCompanies(data || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching companies:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompanies()
  }, [supabase])
  
  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Active filter
      if (activeFilter === 'active' && !company.is_active) return false
      if (activeFilter === 'inactive' && company.is_active) return false
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        if (!company.name.toLowerCase().includes(search)) return false
      }
      
      return true
    })
  }, [companies, activeFilter, searchTerm])
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', color: 'var(--portal-text-secondary)' }}>
          Loading directory...
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div>
        <Panel title="Directory" subtitle="Company and carrier directory">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: 'var(--portal-error)'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>Error loading directory</p>
            <p style={{ fontSize: '14px' }}>{error}</p>
          </div>
        </Panel>
      </div>
    )
  }
  
  return (
    <div>
      <Panel 
        title="Company Directory" 
        subtitle={`${filteredCompanies.length} ${filteredCompanies.length === 1 ? 'company' : 'companies'} found`}
      >
        <DirectoryFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onActiveChange={setActiveFilter}
        />
        
        {filteredCompanies.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center',
            color: 'var(--portal-text-secondary)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No companies found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
