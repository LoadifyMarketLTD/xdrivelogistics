'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface CompanyData {
  id: string
  name: string
  phone: string
  email: string
  vat_number: string
  company_number: string
  address_line1: string
  address_line2: string
  city: string
  postcode: string
  country: string
}

export default function CompanySettingsPage() {
  const router = useRouter()
  const { user, companyId, loading: authLoading } = useAuth()
  
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [companyNumber, setCompanyNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch company by created_by (only company owner can access settings)
        const { data, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', user.id)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (data) {
          setCompany(data)
          // Populate form fields
          setName(data.name || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setVatNumber(data.vat_number || '')
          setCompanyNumber(data.company_number || '')
          setAddressLine1(data.address_line1 || '')
          setAddressLine2(data.address_line2 || '')
          setCity(data.city || '')
          setPostcode(data.postcode || '')
          setCountry(data.country || '')
        } else {
          // User doesn't own a company - redirect to onboarding
          setError('You must create a company first to access settings.')
          setTimeout(() => {
            router.push('/onboarding/company')
          }, 2000)
        }
      } catch (err: any) {
        console.error('Error fetching company:', err)
        setError(err.message || 'Failed to load company details')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCompany()
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Company name is required')
      return
    }

    if (!user) {
      setError('You must be logged in to update company details')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)

      // Update company details (updated_at is automatically set by database trigger)
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          vat_number: vatNumber.trim() || null,
          company_number: companyNumber.trim() || null,
          address_line1: addressLine1.trim() || null,
          address_line2: addressLine2.trim() || null,
          city: city.trim() || null,
          postcode: postcode.trim() || null,
          country: country.trim() || null
        })
        .eq('created_by', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error updating company:', err)
      setError(err.message || 'Failed to update company details')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  // Shared input class for consistent styling
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Company Settings</h1>
      </div>

      <main className="py-10 px-5 max-w-4xl mx-auto">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">
              Company Settings
            </h1>
            <p className="text-sm text-slate-600">
              Manage your company details and information.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg mb-6 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="px-4 py-3 bg-green-50 border border-green-300 rounded-lg mb-6 text-green-600 text-sm">
              ✓ Company details updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+44 7xxx xxx xxx"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Company Registration */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Company Registration
              </h2>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    className={inputClass}
                    placeholder="GB123456789"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Company Number
                  </label>
                  <input
                    type="text"
                    value={companyNumber}
                    onChange={(e) => setCompanyNumber(e.target.value)}
                    className={inputClass}
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Address Information
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className={inputClass}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className={inputClass}
                    placeholder="Suite 100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      placeholder="London"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className={inputClass}
                      placeholder="SW1A 1AA"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputClass}
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-slate-800 font-semibold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
