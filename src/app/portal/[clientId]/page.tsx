import type { Metadata } from 'next'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FileDown, CheckCircle2, Clock, Receipt, MessageSquare } from 'lucide-react'

export const metadata: Metadata = { title: 'Project Portal · AutoLine GmbH' }

// ── Mock: what AutoLine GmbH sees ─────────────────────
const client = {
  name: 'AutoLine GmbH',
  contact: 'Hans Weber',
}

const projects = [
  {
    id: '1',
    name: 'Conveyor System Redesign',
    status: 'active' as const,
    progress: 68,
    clientNote: 'Phase 2 CAD work is progressing on schedule. Drive shaft tolerance analysis is complete; we are now working on the frame assembly drawings for your review.',
    milestones: [
      { name: 'Requirements & Scope', status: 'completed' as const, date: new Date('2025-01-15') },
      { name: 'Concept Design', status: 'completed' as const, date: new Date('2025-01-31') },
      { name: 'Detail CAD — Drive System', status: 'completed' as const, date: new Date('2025-02-14') },
      { name: 'Detail CAD — Frame Assembly', status: 'in_progress' as const, date: new Date('2025-03-01') },
      { name: 'BOM & Manufacturing Drawings', status: 'pending' as const, date: new Date('2025-03-15') },
    ],
    files: [
      { name: 'Conveyor_Concept_Rev2.pdf',     size: '4.2 MB',  date: new Date('2025-01-31') },
      { name: 'Drive_System_Analysis.pdf',      size: '1.8 MB',  date: new Date('2025-02-14') },
      { name: 'Frame_Assembly_Draft_v1.stp',    size: '28.4 MB', date: new Date('2025-02-20') },
    ],
  },
]

const invoices = [
  { number: 'INV-2025-014', amount: 9600,  status: 'sent' as const,  dueDate: new Date('2025-03-20'), issueDate: new Date('2025-02-20') },
  { number: 'INV-2025-010', amount: 11200, status: 'paid' as const,   dueDate: new Date('2025-02-10'), issueDate: new Date('2025-01-10') },
]

const MILESTONE_STATUS = {
  completed:   { icon: CheckCircle2, color: '#22C55E', label: 'Complete' },
  in_progress: { icon: Clock,        color: '#3D8EF0', label: 'In Progress' },
  pending:     { icon: Clock,        color: '#3A3A45', label: 'Upcoming' },
}

export default function PortalPage() {
  const project = projects[0]

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0A0A0B', fontFamily: 'var(--font-body)' }}
    >
      {/* Portal header */}
      <header
        className="px-8 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E24', background: '#111114' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: '#3D8EF015', border: '1px solid #3D8EF030' }}
          >
            <span className="text-mx-accent font-bold text-xs">M</span>
          </div>
          <div>
            <span className="font-display text-sm font-semibold text-mx-light">Mechanixer</span>
            <span className="text-mx-mid text-xs ml-2">Client Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-mx-mid">Welcome, {client.contact}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-2xs font-semibold"
            style={{ background: '#3D8EF020', color: '#3D8EF0', border: '1px solid #3D8EF030' }}
          >
            HW
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl font-bold text-mx-white">{client.name}</h1>
          <p className="text-mx-mid text-sm mt-1">
            {formatDate(new Date(), 'EEEE, MMMM d yyyy')} · {projects.length} active project
          </p>
        </div>

        {/* Project card */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-mx-white">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={project.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xs text-mx-mid mb-1">Overall Progress</p>
              <p className="font-display text-2xl font-bold text-mx-white">{project.progress}%</p>
            </div>
          </div>

          <ProgressBar value={project.progress} className="mb-4" />

          {/* Status note */}
          <div
            className="p-3.5 rounded-md mb-5 text-xs text-mx-dim leading-relaxed"
            style={{ background: '#1E1E24', border: '1px solid #2A2A32' }}
          >
            <p className="text-2xs text-mx-mid mb-1 uppercase tracking-wider">Latest Update from Mechanixer</p>
            {project.clientNote}
          </div>

          {/* Milestones */}
          <div className="mb-5">
            <p className="section-title mb-3">Milestones</p>
            <div className="space-y-2">
              {project.milestones.map((m, i) => {
                const cfg = MILESTONE_STATUS[m.status]
                const Icon = cfg.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                    <span className="text-xs flex-1" style={{ color: m.status === 'pending' ? '#3A3A45' : '#C8C8D4' }}>
                      {m.name}
                    </span>
                    <span className="font-mono text-2xs text-mx-subtle">{formatDate(m.date, 'MMM d')}</span>
                    {m.status === 'in_progress' && (
                      <span className="badge" style={{ background: '#3D8EF015', color: '#3D8EF0' }}>Active</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Files */}
          <div>
            <p className="section-title mb-3">Deliverables & Files</p>
            <div className="space-y-2">
              {project.files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-mx-muted transition-colors"
                  style={{ background: '#111114', border: '1px solid #1E1E24' }}
                >
                  <FileDown size={14} className="text-mx-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-mx-light font-medium truncate">{f.name}</p>
                    <p className="text-2xs text-mx-mid">{f.size} · {formatDate(f.date, 'MMM d, yyyy')}</p>
                  </div>
                  <button
                    className="btn btn-ghost py-1 px-2.5 text-2xs"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="card overflow-hidden">
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #1E1E24' }}>
            <p className="section-title">Invoices</p>
          </div>
          <table className="mx-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.number}>
                  <td className="font-mono text-xs text-mx-accent">{inv.number}</td>
                  <td className="font-mono text-xs text-mx-dim">{formatDate(inv.issueDate, 'MMM d, yyyy')}</td>
                  <td className="font-mono text-xs text-mx-dim">{formatDate(inv.dueDate, 'MMM d, yyyy')}</td>
                  <td className="font-mono font-semibold text-mx-light">{formatCurrency(inv.amount)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <button className="btn btn-ghost py-1 px-2 text-2xs">
                      <FileDown size={11} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contact */}
        <div
          className="p-4 rounded-lg flex items-center gap-4 text-xs text-mx-mid"
          style={{ border: '1px solid #1E1E24', background: '#111114' }}
        >
          <MessageSquare size={14} className="text-mx-accent flex-shrink-0" />
          <span>Questions about your project? Contact your project manager at <span className="text-mx-accent">blagoj@mechanixer.com</span></span>
        </div>
      </main>
    </div>
  )
}
