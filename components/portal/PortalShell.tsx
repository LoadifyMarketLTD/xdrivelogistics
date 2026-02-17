'use client'

import LeftIconRail from './LeftIconRail'
import TopNavTabs from './TopNavTabs'
import TopActions from './TopActions'
import '@/styles/portal.css'

export default function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-shell">
      <LeftIconRail />
      
      <div className="portal-main">
        <div className="portal-top-nav">
          <div className="portal-top-nav-container">
            <div className="portal-top-actions">
              <div className="portal-brand">XDrive Logistics</div>
              <TopActions />
            </div>
            <TopNavTabs />
          </div>
        </div>
        
        <div className="portal-content">
          {children}
        </div>
      </div>
    </div>
  )
}
