import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XDrive Logistics LTD – Enterprise Exchange',
    short_name: 'XDrive',
    description: 'B2B logistics exchange platform connecting drivers, carriers and brokers across the UK.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A2239',
    theme_color: '#C8A64D',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
