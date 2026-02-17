'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function TopActions() {
  const router = useRouter()
  const { signOut } = useAuth()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  return (
    <div className="portal-actions-group">
      <button
        onClick={() => router.push('/jobs/new')}
        className="portal-btn portal-btn-primary"
      >
        POST LOAD
      </button>
      <button
        onClick={() => router.push('/loads/book-direct')}
        className="portal-btn portal-btn-dark"
      >
        BOOK DIRECT
      </button>
      <button
        onClick={handleLogout}
        className="portal-btn portal-btn-outline"
      >
        Logout
      </button>
    </div>
  )
}
