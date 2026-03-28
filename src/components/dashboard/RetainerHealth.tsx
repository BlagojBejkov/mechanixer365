import { calcRetainerHealth, formatHours } from '@/lib/utils'

interface RetainerHealthProps {
  clientName:      string
  usedHours:       number
  contractedHours: number
  month:           string
}

export default function RetainerHealth({
  clientName, usedHours, contractedHours, month
}: RetainerHealthProps) {
  const { percent, status } = calcRetainerHealth(usedHours, contractedHours)
  const remaining = contractedHours - usedHours

  const colors = {
    healthy: { bar: '#22C55E', text: 'text-mx-green', bg: '#22C55E15' },
    warning: { bar: '#F59E0B', text: 'text-mx-amber', bg: '#F59E0B15' },
    over:    { bar: '#EF4444', text: 'text-mx-red',   bg: '#EF444415' },
  }

  const c = colors[status]

  return (
    <div className="card p-4" style={{ borderColor: status !== 'healthy' ? c.bar + '40' : undefined }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-mx-light">{clientName}</p>
          <p className="text-2xs text-mx-mid">{month} retainer</p>
        </div>
        <span
          className={`badge ${c.text}`}
          style={{ background: c.bg }}
        >
          {status === 'over' ? 'Over' : status === 'warning' ? 'Near limit' : 'On track'}
        </span>
      </div>

      {/* Bar */}
      <div className="progress-bar mb-2">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: c.bar,
          }}
        />
      </div>

      <div className="flex justify-between text-2xs">
        <span className={`font-mono font-semibold ${c.text}`}>
          {formatHours(usedHours)} used
        </span>
        <span className="text-mx-mid font-mono">
          {formatHours(contractedHours)} contracted
        </span>
      </div>

      {status === 'over' && (
        <p className="text-2xs text-mx-red mt-2">
          {formatHours(Math.abs(remaining))} over contract — discuss with client
        </p>
      )}
      {status !== 'over' && (
        <p className="text-2xs text-mx-mid mt-1">
          {formatHours(remaining)} remaining
        </p>
      )}
    </div>
  )
}
