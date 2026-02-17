'use client'

import StatCard from '../StatCard'

interface QuotesStatsProps {
  totalQuotes: number
  acceptedQuotes: number
  totalValue: number
  acceptanceRate: number
}

export default function QuotesStats({ 
  totalQuotes, 
  acceptedQuotes, 
  totalValue,
  acceptanceRate 
}: QuotesStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  return (
    <div className="portal-grid-2" style={{ marginBottom: '24px' }}>
      <StatCard 
        label="Total Quotes" 
        value={totalQuotes}
        change={acceptedQuotes > 0 ? `${acceptedQuotes} accepted` : undefined}
        trend={acceptedQuotes > 0 ? 'up' : 'neutral'}
      />
      <StatCard 
        label="Acceptance Rate" 
        value={`${acceptanceRate.toFixed(1)}%`}
        change={totalValue > 0 ? `${formatCurrency(totalValue)} total value` : undefined}
        trend={acceptanceRate > 30 ? 'up' : acceptanceRate > 15 ? 'neutral' : 'down'}
      />
    </div>
  )
}
