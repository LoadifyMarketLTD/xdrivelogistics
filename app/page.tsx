'use client'

// This page serves the Vite-built landing page
// The actual HTML and assets are in public/ (copied from dist/ during build)

import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    // Load Vite landing page CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/assets/index-CCXABSC2.css'
    document.head.appendChild(link)

    // Load Vite landing page JS
    const script = document.createElement('script')
    script.type = 'module'
    script.src = '/assets/index-Bd_MaviS.js'
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)

    return () => {
      // Cleanup
      link.remove()
      script.remove()
    }
  }, [])

  return <div id="root"></div>
}
