// Mechanixer team — seed data reference
export const TEAM = [
  { id: 'blagoj', name: 'Blagoj', role: 'owner' as const },
  { id: 'tomche', name: 'Tomche', role: 'engineer' as const },
  { id: 'katerina', name: 'Katerina', role: 'engineer' as const },
]

// Working hours assumptions
export const WORKING_HOURS_PER_WEEK = 40
export const WORKING_HOURS_PER_MONTH = 168

// Pipeline stages in order
export const PIPELINE_STAGES = [
  { id: 'new',           label: 'New',            color: '#6B6B7A' },
  { id: 'qualified',     label: 'Qualified',       color: '#3D8EF0' },
  { id: 'proposal_sent', label: 'Proposal Sent',   color: '#F59E0B' },
  { id: 'negotiation',   label: 'Negotiation',     color: '#8B5CF6' },
  { id: 'won',           label: 'Won',             color: '#22C55E' },
  { id: 'lost',          label: 'Lost',            color: '#EF4444' },
] as const

// Default invoice payment terms
export const DEFAULT_PAYMENT_TERMS = 'Payment due within 30 days of invoice date.'
export const DEFAULT_INVOICE_TERMS = `
Mechanixer – Engineering Design Services
Bank transfer details will be provided upon invoice confirmation.
Late payments may incur a 1.5% monthly interest charge.
`.trim()

// Default quote validity
export const DEFAULT_QUOTE_VALIDITY_DAYS = 30

// VAT rate (adjust per country)
export const DEFAULT_VAT_RATE = 0 // 0 for B2B international, set 20 for local

// Revenue target
export const ANNUAL_REVENUE_TARGET = 450_000 // EUR

// Navigation items by role
export const NAV_OWNER = [
  { href: '/dashboard',          label: 'Dashboard',     icon: 'LayoutDashboard' },
  { href: '/crm',                label: 'CRM',           icon: 'Users' },
  { href: '/projects',           label: 'Projects',      icon: 'FolderKanban' },
  { href: '/time',               label: 'Time',          icon: 'Clock' },
  { href: '/capacity',           label: 'Capacity',      icon: 'BarChart2' },
  { href: '/finance',            label: 'Finance',       icon: 'Receipt' },
  { href: '/settings',           label: 'Settings',      icon: 'Settings' },
]

export const NAV_ENGINEER = [
  { href: '/dashboard',          label: 'Dashboard',     icon: 'LayoutDashboard' },
  { href: '/projects',           label: 'Projects',      icon: 'FolderKanban' },
  { href: '/time',               label: 'Time',          icon: 'Clock' },
]
