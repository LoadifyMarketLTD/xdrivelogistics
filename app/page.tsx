'use client'

// This page serves the Vite-built landing page
// The actual HTML and assets are in public/ (copied from dist/ during build)

import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    scriptLoaded.current = true

    // Fetch and parse the Vite-built index.html to get the correct asset paths
    fetch('/index.html')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch index.html: ${res.status} ${res.statusText}`)
        }
        return res.text()
      })
      .then(html => {
        // Extract CSS link
        const cssMatch = html.match(/href="([^"]+\.css)"/)
        if (cssMatch) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = cssMatch[1]
          document.head.appendChild(link)
        }

        // Extract JS script
        const jsMatch = html.match(/src="([^"]+\.js)"/)
        if (jsMatch) {
          const script = document.createElement('script')
          script.type = 'module'
          script.src = jsMatch[1]
          script.crossOrigin = 'anonymous'
          document.body.appendChild(script)
        }
      })
      .catch(err => {
        console.error('Failed to load landing page assets:', err)
      })
  }, [])

  return <div id="root"></div>
}
