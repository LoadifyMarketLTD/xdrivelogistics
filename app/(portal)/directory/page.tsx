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
  email: string | null
  created_at: string
}

interface CompanyProfile {
  company: Company
  rating: number
  completedJobs: number
  fleetSize: number
}

export default function DirectoryPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('')
  const [sortColumn, setSortColumn] = useState<'name' | 'city'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Set timeout to ensure loading always resolves
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Directory data fetch timeout - resolving loading state')
            setLoading(false)
          }
        }, 10000) // 10 second timeout
        
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, city, postcode, phone, email, created_at')
          .order('name', { ascending: true })
        
        if (error) throw error
        
        if (!mounted) return
        
        setCompanies(data || [])
      } catch (err: any) {
        console.error('Error fetching companies:', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    fetchData()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const fetchCompanyProfile = async (company: Company) => {
    try {
      setLoadingProfile(true)
      
      // Fetch completed jobs count
      const { data: completedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('posted_by_company_id', company.id)
        .in('status', ['completed', 'delivered'])
      
      if (jobsError) throw jobsError
      
      // Fetch fleet size
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('company_id', company.id)
      
      if (vehiclesError) throw vehiclesError
      
      // Calculate rating (placeholder - could be based on reviews later)
      const rating = 4.5 // Default rating
      
      setSelectedCompany({
        company,
        rating,
        completedJobs: completedJobs?.length || 0,
        fleetSize: vehicles?.length || 0,
      })
    } catch (err: any) {
      console.error('Error fetching company profile:', err)
    } finally {
      setLoadingProfile(false)
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
    .filter(company => {
      // Search filter
      if (searchTerm && !(
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.postcode?.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false
      }
      
      return true
    })
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
    <>
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
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Vehicle Type Filter */}
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                color: '#1f2937',
              }}
            >
              <option value="">All Vehicle Types</option>
              <option value="Small Van">Small Van</option>
              <option value="Medium Van">Medium Van</option>
              <option value="Large Van">Large Van</option>
              <option value="Luton Van">Luton Van</option>
              <option value="7.5 Tonne">7.5 Tonne</option>
              <option value="18 Tonne">18 Tonne</option>
              <option value="Artic">Artic</option>
            </select>

            {/* Search */}
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
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr 100px',
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
            <div></div>
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
                  gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr 100px',
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
                  {company.phone || company.email || 'No contact'}
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
                <div>
                  <button
                    onClick={() => fetchCompanyProfile(company)}
                    style={{
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
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

      {/* Company Profile Modal */}
      {selectedCompany && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            {loadingProfile ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                Loading profile...
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '24px',
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '4px',
                    }}>
                      {selectedCompany.company.name}
                    </h3>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                    }}>
                      Member since {new Date(selectedCompany.company.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#f59e0b',
                      marginBottom: '4px',
                    }}>
                      {selectedCompany.rating.toFixed(1)} ★
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    }}>
                      Rating
                    </div>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '4px',
                    }}>
                      {selectedCompany.completedJobs}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    }}>
                      Completed Jobs
                    </div>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#3b82f6',
                      marginBottom: '4px',
                    }}>
                      {selectedCompany.fleetSize}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    }}>
                      Fleet Size
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}>
                    Contact Information
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCompany.company.city && (
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        <strong>Location:</strong> {selectedCompany.company.city}
                        {selectedCompany.company.postcode && ` ${selectedCompany.company.postcode}`}
                      </div>
                    )}
                    {selectedCompany.company.phone && (
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        <strong>Phone:</strong> {selectedCompany.company.phone}
                      </div>
                    )}
                    {selectedCompany.company.email && (
                      <div style={{ fontSize: '13px', color: '#374151' }}>
                        <strong>Email:</strong> {selectedCompany.company.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    Contact Company
                  </button>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    style={{
                      padding: '10px 20px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
