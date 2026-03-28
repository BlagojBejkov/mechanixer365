'use client'

import { formatCurrency } from '@/lib/utils'

interface CRMStatsProps {
  totalPipeline: number
  weighted: number
  activeCount: number
  wonThisMonth: number
}

export default function CRMStats({ totalPipeline, weighted, activeCount, wonThisMonth }: CRMStatsProps) {
  return (
    <div
      className="flex items-center gap-6 px-8 py-3"
      style={{ borderBottom: '1px solid #1E1E24' }}
    >
      <div>
        <span className="section-title mr-2">Total Pipeline</span>
        <span className="font-mono text-sm font-semibold text-mx-light">
          {formatCurrency(totalPipeline)}
        </span>
      </div>
      <div className="w-px h-4 bg-mx-border" />
      <div>
        <span className="section-title mr-2">Weighted</span>
        <span className="font-mono text-sm font-semibold text-mx-accent">
          {formatCurrency(weighted)}
        </span>
      </div>
      <div className="w-px h-4 bg-mx-border" />
      <div>
        <span className="section-title mr-2">Active Leads</span>
        <span className="font-mono text-sm font-semibold text-mx-light">{activeCount}</span>
      </div>
      <div className="w-px h-4 bg-mx-border" />
      <div>
        <span className="section-title mr-2">Won</span>
        <span className="font-mono text-sm font-semibold text-mx-green">{wonThisMonth}</span>
      </div>
    </div>
  )
}
