import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ───────────────────────────────
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'de-DE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Hours ──────────────────────────────────
export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── Dates ──────────────────────────────────
export function formatDate(date: Date | string | number | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—'
  try {
    return format(new Date(date as Date), fmt)
  } catch {
    return '—'
  }
}

export function formatDateRelative(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ─── Numbers ────────────────────────────────
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

// ─── Invoice/Quote numbering ─────────────────
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(sequence).padStart(3, '0')}`
}

export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `Q-${year}-${String(sequence).padStart(3, '0')}`
}

// ─── Project progress ───────────────────────
export function calcProjectProgress(
  completedTasks: number,
  totalTasks: number
): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}

// ─── Retainer health ────────────────────────
export function calcRetainerHealth(
  usedHours: number,
  contractedHours: number
): { percent: number; status: 'healthy' | 'warning' | 'over' } {
  const percent = Math.round((usedHours / contractedHours) * 100)
  const status = percent > 100 ? 'over' : percent > 85 ? 'warning' : 'healthy'
  return { percent, status }
}

// ─── Initials ───────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Status colors ──────────────────────────
export const statusColors = {
  // Lead stages
  new:             'text-mx-dim bg-mx-muted',
  qualified:       'text-mx-accent bg-mx-accent-glow',
  proposal_sent:   'text-mx-amber bg-amber-950/30',
  negotiation:     'text-mx-purple bg-purple-950/30',
  won:             'text-mx-green bg-green-950/30',
  lost:            'text-mx-red bg-red-950/30',
  // Project status
  scoping:         'text-mx-dim bg-mx-muted',
  active:          'text-mx-green bg-green-950/30',
  on_hold:         'text-mx-amber bg-amber-950/30',
  review:          'text-mx-purple bg-purple-950/30',
  completed:       'text-mx-accent bg-mx-accent-glow',
  cancelled:       'text-mx-red bg-red-950/30',
  // Invoice status
  draft:           'text-mx-dim bg-mx-muted',
  sent:            'text-mx-accent bg-mx-accent-glow',
  paid:            'text-mx-green bg-green-950/30',
  overdue:         'text-mx-red bg-red-950/30',
} as const
