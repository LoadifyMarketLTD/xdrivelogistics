'use client'

import Panel from '@/components/portal/Panel'

export default function DiaryPage() {
  return (
    <div>
      <Panel title="Diary" subtitle="Schedule and calendar management">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h2 style={{ fontSize: '20px', color: 'var(--portal-text-primary)', marginBottom: '12px' }}>
            Diary & Calendar Coming Soon
          </h2>
          <p style={{ color: 'var(--portal-text-secondary)', marginBottom: '24px' }}>
            Manage schedules, delivery timelines, and driver assignments in calendar view.
          </p>
        </div>
      </Panel>
    </div>
  )
}
