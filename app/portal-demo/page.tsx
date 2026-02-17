'use client'

import PortalShell from '@/components/portal/PortalShell'
import Panel from '@/components/portal/Panel'
import StatCard from '@/components/portal/StatCard'
import TileList from '@/components/portal/TileList'
import ActivityList from '@/components/portal/ActivityList'
import CompliancePanel from '@/components/portal/CompliancePanel'

export default function PortalDemoPage() {
  const mockActivities = [
    {
      id: 'abc123',
      route: 'London → Manchester',
      vehicle: 'Luton Van',
      pickup: '10:00',
      delivery: '14:00',
      status: 'Delivered',
      statusVariant: 'success' as const
    },
    {
      id: 'def456',
      route: 'Birmingham → Leeds',
      vehicle: 'Medium Van',
      pickup: '08:00',
      delivery: '12:00',
      status: 'In Transit',
      statusVariant: 'warning' as const
    },
    {
      id: 'ghi789',
      route: 'Glasgow → Edinburgh',
      vehicle: 'Small Van',
      pickup: '14:00',
      delivery: '16:00',
      status: 'Open',
      statusVariant: 'info' as const
    }
  ]
  
  return (
    <PortalShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Panel title="Reports & Statistics" subtitle="Overview of your transport operations">
          <div className="portal-grid-2">
            <StatCard label="Total Loads" value={45} change="+15% this month" trend="up" />
            <StatCard label="Active Drivers" value={12} change="+2 this week" trend="up" />
          </div>
        </Panel>
        
        <div className="portal-grid-2">
          <Panel title="Accounts Payable" subtitle="Payment tracking">
            <TileList items={[
              { label: 'Overdue', value: '3' },
              { label: 'Due Soon', value: '7' },
              { label: 'Paid', value: '25' },
              { label: 'Total Outstanding', value: '£12.5k' }
            ]} />
          </Panel>
          
          <Panel title="Reports" subtitle="Generated reports">
            <TileList items={[
              { label: 'Daily Reports', value: '5' },
              { label: 'Weekly Reports', value: '2' },
              { label: 'Monthly Reports', value: '1' },
              { label: 'Custom Reports', value: '0' }
            ]} />
          </Panel>
        </div>
        
        <Panel title="Latest Bookings" subtitle="Activity at a glance">
          <ActivityList activities={mockActivities} />
        </Panel>
        
        <Panel title="Compliance" subtitle="Manage Your Suppliers">
          <CompliancePanel />
        </Panel>
      </div>
    </PortalShell>
  )
}
