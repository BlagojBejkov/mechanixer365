import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  color?: 'blue' | 'green' | 'amber' | 'red'
}

const COLORS = {
  blue:  '#3D8EF0',
  green: '#22C55E',
  amber: '#F59E0B',
  red:   '#EF4444',
}

export default function ProgressBar({ value, className, color = 'blue' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const fill = clamped > 100 ? COLORS.red : COLORS[color]

  return (
    <div className={cn('progress-bar', className)}>
      <div
        className="progress-fill"
        style={{ width: `${clamped}%`, background: fill }}
      />
    </div>
  )
}
