'use client'

import { Job } from '@/lib/types'

interface JobTimelineProps {
  job: Job
}

export default function JobTimeline({ job }: JobTimelineProps) {
  const events = [
    {
      label: 'Job Posted',
      date: new Date(job.created_at),
      icon: '📝',
      status: 'completed'
    },
    ...(job.pickup_datetime ? [{
      label: 'Scheduled Pickup',
      date: new Date(job.pickup_datetime),
      icon: '📦',
      status: new Date(job.pickup_datetime) < new Date() ? 'completed' : 'pending'
    }] : []),
    ...(job.delivery_datetime ? [{
      label: 'Scheduled Delivery',
      date: new Date(job.delivery_datetime),
      icon: '🚚',
      status: new Date(job.delivery_datetime) < new Date() ? 'completed' : 'pending'
    }] : []),
    ...(job.status === 'completed' ? [{
      label: 'Job Completed',
      date: new Date(job.updated_at),
      icon: '✅',
      status: 'completed'
    }] : [])
  ]

  return (
    <div style={{
      backgroundColor: '#0B1623',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '600', 
        marginBottom: '20px',
        color: '#fff'
      }}>
        📅 Job Timeline
      </h3>
      
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '0',
          bottom: '0',
          width: '2px',
          backgroundColor: 'rgba(200, 166, 77, 0.3)'
        }} />
        
        {/* Timeline events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {events.map((event, index) => (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: event.status === 'completed' ? 'var(--gold-premium)' : '#132433',
                border: '2px solid ' + (event.status === 'completed' ? 'var(--gold-premium)' : 'rgba(255,255,255,0.2)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
                zIndex: 1
              }}>
                {event.icon}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, paddingTop: '4px' }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '4px',
                  color: event.status === 'completed' ? '#fff' : '#94a3b8'
                }}>
                  {event.label}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {event.date.toLocaleDateString('en-GB', { 
                    weekday: 'short',
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric'
                  })} at {event.date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Status */}
      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          Current Status:
        </span>
        <span style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          backgroundColor: job.status === 'open' ? 'rgba(16, 185, 129, 0.2)' :
                          job.status === 'assigned' ? 'rgba(59, 130, 246, 0.2)' :
                          job.status === 'in-transit' ? 'rgba(245, 158, 11, 0.2)' :
                          job.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                          'rgba(156, 163, 175, 0.2)',
          color: job.status === 'open' ? '#10b981' :
                 job.status === 'assigned' ? '#3b82f6' :
                 job.status === 'in-transit' ? '#f59e0b' :
                 job.status === 'completed' ? '#22c55e' :
                 '#9ca3af'
        }}>
          {job.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  )
}
