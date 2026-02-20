'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Panel from '@/components/portal/Panel'
import '@/styles/portal.css'

export const dynamic = 'force-dynamic'

interface CompletedJob {
  id: string
  pickup_location: string
  delivery_location: string
  delivery_lat: number | null
  delivery_lng: number | null
  budget: number | null
  created_at: string
}

interface OpenLoad {
  id: string
  pickup_location: string
  delivery_location: string
  pickup_lat: number | null
  pickup_lng: number | null
  budget: number | null
  vehicle_type: string | null
  pickup_datetime: string | null
  distance_miles: number | null
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function ReturnJourneysPage() {
  const { user } = useAuth()
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [openLoads, setOpenLoads] = useState<OpenLoad[]>([])
  const [loading, setLoading] = useState(true)
  const [lastDelivery, setLastDelivery] = useState<{ location: string; lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!user) return
    let mounted = true

    const fetchData = async () => {
      try {
        setLoading(true)

        const [{ data: myBids }, { data: loads }] = await Promise.all([
          supabase
            .from('job_bids')
            .select('job_id, jobs(id, pickup_location, delivery_location, delivery_lat, delivery_lng, budget, created_at)')
            .eq('bidder_id', user.id)
            .eq('status', 'accepted')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('jobs')
            .select('id, pickup_location, delivery_location, pickup_lat, pickup_lng, budget, vehicle_type, pickup_datetime, distance_miles')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(50),
        ])

        if (!mounted) return

        const completed: CompletedJob[] = (myBids ?? [])
          .map((b: any) => b.jobs)
          .filter(Boolean)

        setCompletedJobs(completed)
        setOpenLoads(loads ?? [])

        // Determine last delivery point (most recent accepted bid with coordinates)
        const lastWithCoords = completed.find((j) => j.delivery_lat && j.delivery_lng)
        if (lastWithCoords) {
          setLastDelivery({
            location: lastWithCoords.delivery_location,
            lat: lastWithCoords.delivery_lat!,
            lng: lastWithCoords.delivery_lng!,
          })
        }
      } catch (e) {
        console.error('Error fetching return journeys:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()

    return () => { mounted = false }
  }, [user])

  // Smart Return Optimiser: find open loads whose pickup is close to last delivery
  const smartSuggestions = useMemo(() => {
    if (!lastDelivery || openLoads.length === 0) return []

    return openLoads
      .filter((l) => l.pickup_lat && l.pickup_lng)
      .map((l) => {
        const distKm = haversineKm(lastDelivery.lat, lastDelivery.lng, l.pickup_lat!, l.pickup_lng!)
        const distMiles = Math.round(distKm * 0.621371)
        return { ...l, distToPickupMiles: distMiles }
      })
      .filter((l) => l.distToPickupMiles <= 75) // within 75 miles of last drop-off
      .sort((a, b) => a.distToPickupMiles - b.distToPickupMiles)
      .slice(0, 8)
  }, [lastDelivery, openLoads])

  const gold = '#C8A64D'
  const navy = '#0A2239'

  if (loading) return <div className="loading-screen"><div>Loading…</div></div>

  return (
    <div className="portal-layout">
      <div className="portal-header">
        <h1 className="portal-title">Return Journeys</h1>
        <p className="page-description">Smart Return Optimiser — find loads near your drop-off point</p>
      </div>

      <div className="portal-main">

        {/* ── SMART RETURN OPTIMISER ───────────────────────────────── */}
        <div style={{ background: navy, borderRadius: '10px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🧠</span>
            <div>
              <div style={{ color: gold, fontWeight: '700', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Return Optimiser</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                {lastDelivery
                  ? `Based on your last drop-off: ${lastDelivery.location}`
                  : 'Accept a job to activate return load suggestions'}
              </div>
            </div>
          </div>

          {!lastDelivery ? (
            <div style={{ color: '#6b7280', fontSize: '14px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              🔄 No completed jobs found. Once you accept and complete a load, the optimiser will suggest return loads near your delivery point.
            </div>
          ) : smartSuggestions.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '14px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              No open loads found within 75 miles of your last delivery point ({lastDelivery.location}). Check back soon!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {smartSuggestions.map((load) => (
                <div key={load.id} style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${gold}40`,
                  borderRadius: '8px',
                  padding: '14px',
                }}>
                  <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '6px', fontSize: '14px' }}>
                    {load.pickup_location} → {load.delivery_location}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
                    <span style={{ color: gold }}>📍 {load.distToPickupMiles} mi to pickup</span>
                    {load.budget && <span style={{ color: '#22c55e' }}>💰 £{load.budget.toFixed(0)}</span>}
                    {load.vehicle_type && <span style={{ color: '#94a3b8' }}>🚛 {load.vehicle_type}</span>}
                    {load.distance_miles && <span style={{ color: '#94a3b8' }}>↔ {load.distance_miles} mi</span>}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                    📍 {load.distToPickupMiles} miles from your last drop-off
                  </div>
                  <a href={`/loads/${load.id}`} style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '6px 14px',
                    background: gold,
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}>
                    View & Bid →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PREVIOUS JOURNEYS ───────────────────────────────────── */}
        <Panel title="My Completed Journeys" subtitle="Recent deliveries for return trip planning">
          {completedJobs.length === 0 ? (
            <div className="portal-card">
              <div className="section-header">🔄</div>
              <p>No completed journeys yet</p>
              <p className="page-description">
                Return journey suggestions appear here after deliveries are completed
              </p>
            </div>
          ) : (
            <div className="portal-list">
              {completedJobs.map((job) => (
                <div key={job.id} className="portal-card">
                  <div className="portal-card-header">
                    <div>
                      <h3 className="section-header">
                        {job.pickup_location} → {job.delivery_location}
                      </h3>
                      <p className="page-description">
                        Return: {job.delivery_location} → {job.pickup_location}
                        {job.budget ? ` · Est. return savings: £${((job.budget || 0) * 0.4).toFixed(0)}` : ''}
                      </p>
                    </div>
                    <a href="/loads" className="btn-secondary" style={{ textDecoration: 'none' }}>
                      Find Return Load
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

