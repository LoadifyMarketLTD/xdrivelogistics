'use client'

import EnterpriseSidebar from './EnterpriseSidebar'
import EnterpriseHeader from './EnterpriseHeader'

export default function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f3f4f6',
    }}>
      {/* Fixed Sidebar */}
      <EnterpriseSidebar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '220px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Compact Header */}
        <EnterpriseHeader />
        
        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
