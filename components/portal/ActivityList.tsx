'use client'

import { useState } from 'react'
import StatusPill from './StatusPill'

interface Activity {
  id: string
  route: string
  vehicle: string
  pickup: string
  delivery: string
  status: string
  statusVariant: 'success' | 'warning' | 'info' | 'error'
}

export default function ActivityList({ 
  activities 
}: { 
  activities: Activity[]
}) {
  const [memberFilter, setMemberFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [loadIdFilter, setLoadIdFilter] = useState('')
  
  const filtered = activities.filter(activity => {
    const matchesMember = !memberFilter || activity.id.toLowerCase().includes(memberFilter.toLowerCase())
    const matchesLocation = !locationFilter || activity.route.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesLoadId = !loadIdFilter || activity.id.toLowerCase().includes(loadIdFilter.toLowerCase())
    return matchesMember && matchesLocation && matchesLoadId
  })
  
  return (
    <div className="portal-activity-list">
      <div className="portal-activity-filters">
        <input
          type="text"
          placeholder="Filter by Member/Driver"
          className="portal-filter-input"
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Location"
          className="portal-filter-input"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Load ID/Ref"
          className="portal-filter-input"
          value={loadIdFilter}
          onChange={(e) => setLoadIdFilter(e.target.value)}
        />
      </div>
      
      <div className="portal-activity-row portal-activity-header">
        <div>Route</div>
        <div>Vehicle</div>
        <div>Pickup Time</div>
        <div>Delivery</div>
        <div>Load ID</div>
        <div>Status</div>
      </div>
      
      {filtered.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--portal-text-muted)' }}>
          No activities found
        </div>
      ) : (
        filtered.map((activity) => (
          <div key={activity.id} className="portal-activity-row">
            <div className="portal-activity-cell">{activity.route}</div>
            <div className="portal-activity-cell">{activity.vehicle}</div>
            <div className="portal-activity-cell">{activity.pickup}</div>
            <div className="portal-activity-cell">{activity.delivery}</div>
            <div className="portal-activity-cell-muted">{activity.id}</div>
            <div>
              <StatusPill status={activity.status} variant={activity.statusVariant} />
            </div>
          </div>
        ))
      )}
    </div>
  )
}
