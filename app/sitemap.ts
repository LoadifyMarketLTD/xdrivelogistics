import type { MetadataRoute } from 'next'

const LAST_MODIFIED = new Date('2026-02-21')

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://xdrivelogistics.co.uk'
  return [
    { url: base, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/register`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookies`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
