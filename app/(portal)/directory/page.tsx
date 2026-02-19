'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ResponsiveContainer from '@/components/layout/ResponsiveContainer'
import ResponsiveGrid from '@/components/layout/ResponsiveGrid'
import '@/styles/portal.css'

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

    const fetchData = async () => {
      try {
        setLoading(true)
        
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
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  const fetchCompanyProfile = async (company: Company) => {
    try {
      setLoadingProfile(true)
      
      const { data: completedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('posted_by_company_id', company.id)
        .in('status', ['completed', 'delivered'])
      
      if (jobsError) throw jobsError
      
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('company_id', company.id)
      
      if (vehiclesError) throw vehiclesError
      
      const rating = 4.5
      
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
      <div className="loading-screen">
        <div className="loading-text">Loading directory...</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer maxWidth="xl">
      <div>
        <div className="directory-header">
          <h1 className="directory-title">
            Company Directory
          </h1>
          
          <div className="directory-filters">
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="form-input"
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

            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="table-container">
          <div className="table-header directory-grid">
            <div
              onClick={() => handleSort('name')}
              className="sort-header"
            >
              Company {sortColumn === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => handleSort('city')}
              className="sort-header"
            >
              Location {sortColumn === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div>Rating</div>
            <div>Contact</div>
            <div>Status</div>
            <div></div>
          </div>

          {filteredAndSortedCompanies.length === 0 ? (
            <div className="table-empty">
              <div>📁</div>
              <div>
                No companies found
              </div>
              <div>
                {searchTerm ? 'Try adjusting your search' : 'No companies in directory'}
              </div>
            </div>
          ) : (
            filteredAndSortedCompanies.map((company) => (
              <div
                key={company.id}
                className="table-row directory-grid"
              >
                <div className="company-name">{company.name}</div>
                <div>
                  {company.city || '—'}
                  {company.postcode && ` ${company.postcode}`}
                </div>
                <div>
                  <span className="rating-stars">
                    ★★★★☆
                  </span>
                </div>
                <div className="contact-info">
                  {company.phone || company.email || 'No contact'}
                </div>
                <div>
                  <span className="status-badge completed">
                    Active
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => fetchCompanyProfile(company)}
                    className="btn-view"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="directory-footer">
          Showing {filteredAndSortedCompanies.length} of {companies.length} companies
        </div>
      </div>

      {selectedCompany && (
        <div className="modal-overlay">
          <div className="modal-content">
            {loadingProfile ? (
              <div className="loading-text">
                Loading profile...
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div>
                    <h3 className="modal-title">
                      {selectedCompany.company.name}
                    </h3>
                    <div className="modal-subtitle">
                      Member since {new Date(selectedCompany.company.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="modal-close"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-stats-grid">
                  <div className="modal-stat-card">
                    <div className="modal-stat-value orange">
                      {selectedCompany.rating.toFixed(1)} ★
                    </div>
                    <div className="modal-stat-label">
                      Rating
                    </div>
                  </div>

                  <div className="modal-stat-card">
                    <div className="modal-stat-value green">
                      {selectedCompany.completedJobs}
                    </div>
                    <div className="modal-stat-label">
                      Completed Jobs
                    </div>
                  </div>

                  <div className="modal-stat-card">
                    <div className="modal-stat-value blue">
                      {selectedCompany.fleetSize}
                    </div>
                    <div className="modal-stat-label">
                      Fleet Size
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4 className="modal-section-title">
                    Contact Information
                  </h4>
                  <div className="modal-info-list">
                    {selectedCompany.company.city && (
                      <div className="modal-info-item">
                        <strong>Location:</strong> {selectedCompany.company.city}
                        {selectedCompany.company.postcode && ` ${selectedCompany.company.postcode}`}
                      </div>
                    )}
                    {selectedCompany.company.phone && (
                      <div className="modal-info-item">
                        <strong>Phone:</strong> {selectedCompany.company.phone}
                      </div>
                    )}
                    {selectedCompany.company.email && (
                      <div className="modal-info-item">
                        <strong>Email:</strong> {selectedCompany.company.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn-success">
                    Contact Company
                  </button>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ResponsiveContainer>
  )
}
