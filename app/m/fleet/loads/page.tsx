'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/AuthContext'
import { brandColors } from '@/lib/brandColors'
import { useRouter } from 'next/navigation'

interface Load {
  id: string
  pickup_location: string
  delivery_location: string
  vehicle_type: string | null
  budget: number | null
  pickup_datetime: string | null
  distance_miles: number | null
}

export default function FleetLoadsPage() {
  const { companyId } = useAuth()
  const router = useRouter()
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('id, pickup_location, delivery_location, vehicle_type, budget, pickup_datetime, distance_miles')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(40)
        setLoads(data || [])
      } catch (e) {
        console.error('Fleet loads error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  const filtered = loads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.pickup_location.toLowerCase().includes(q) ||
      l.delivery_location.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return <div style={{ padding: '16px', color: brandColors.text.secondary }}>Loading loads…</div>
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '18px', fontWeight: '700', color: brandColors.text.primary, marginBottom: '12px' }}>
        Available Loads
      </h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by pickup or delivery…"
        style={{
          width: '100%', padding: '10px 14px', marginBottom: '14px',
          fontSize: '14px', borderRadius: '10px', border: '1px solid #e5e7eb',
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      {filtered.length === 0 ? (
        <div style={{
          background: '#ffffff', border: '1px solid #e5e7eb',
          borderRadius: '12px', padding: '32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
          <p style={{ color: brandColors.text.secondary, fontSize: '14px' }}>
            {search ? 'No loads match your search.' : 'No open loads available right now.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((load) => (
            <button
              key={load.id}
              onClick={() => router.push(`/loads/${load.id}`)}
              style={{
                background: '#ffffff', border: '1px solid #e5e7eb',
                borderRadius: '12px', padding: '14px',
                textAlign: 'left', cursor: 'pointer', width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: brandColors.text.primary }}>
                    {load.pickup_location} → {load.delivery_location}
                  </div>
                  <div style={{ fontSize: '12px', color: brandColors.text.secondary, marginTop: '4px' }}>
                    {load.vehicle_type ?? 'Any vehicle'}
                    {load.distance_miles ? ` · ${load.distance_miles} mi` : ''}
                    {load.pickup_datetime
                      ? ` · ${new Date(load.pickup_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : ''}
                  </div>
                </div>
                {load.budget != null && (
                  <span style={{
                    fontSize: '15px', fontWeight: '700',
                    color: brandColors.primary.gold, flexShrink: 0, marginLeft: '8px',
                  }}>
                    £{load.budget}
                  </span>
                )}
              </div>
            </button>
          ))}
          <p style={{ fontSize: '12px', color: brandColors.text.secondary, textAlign: 'center', marginTop: '4px' }}>
            Showing {filtered.length} open loads · tap to bid
          </p>
        </div>
      )}
    </div>
  )
}

