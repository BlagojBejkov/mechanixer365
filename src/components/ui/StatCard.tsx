import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  accent?: boolean
  className?: string
}

export default function StatCard({ label, value, sub, icon: Icon, trend, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'card p-5 relative overflow-hidden',
        accent && 'border-mx-accent/20',
        className
      )}
    >
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mx-accent/60 to-transparent" />
      )}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="section-title mb-2">{label}</p>
          <p className="stat-number">{value}</p>
          {sub && <p className="text-mx-mid text-xs mt-1">{sub}</p>}
          {trend && (
            <p className={cn('text-xs mt-1.5 font-mono', trend.value >= 0 ? 'text-mx-green' : 'text-mx-red')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ml-3"
            style={{ background: accent ? '#3D8EF015' : '#1E1E24', border: '1px solid #2A2A32' }}
          >
            <Icon size={16} className={accent ? 'text-mx-accent' : 'text-mx-mid'} />
          </div>
        )}
      </div>
    </div>
  )
}
