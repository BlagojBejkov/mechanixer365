import { cn, statusColors } from '@/lib/utils'

type StatusKey = keyof typeof statusColors

interface BadgeProps {
  status: StatusKey
  label?: string
  className?: string
}

const STATUS_LABELS: Record<StatusKey, string> = {
  new:           'New',
  qualified:     'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiation:   'Negotiation',
  won:           'Won',
  lost:          'Lost',
  scoping:       'Scoping',
  active:        'Active',
  on_hold:       'On Hold',
  review:        'Review',
  completed:     'Completed',
  cancelled:     'Cancelled',
  draft:         'Draft',
  sent:          'Sent',
  paid:          'Paid',
  overdue:       'Overdue',
}

export default function StatusBadge({ status, label, className }: BadgeProps) {
  return (
    <span className={cn('badge', statusColors[status], className)}>
      {label ?? STATUS_LABELS[status]}
    </span>
  )
}
