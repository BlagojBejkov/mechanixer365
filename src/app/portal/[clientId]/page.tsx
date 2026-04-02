import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FileDown, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { getPortalData } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ clientId: string }> }): Promise<Metadata> {
  const { clientId } = await params
  const data = await getPortalData(clientId)
  return { title: data ? `${data.companyName} · Client Portal` : 'Client Portal' }
}

const MILESTONE_STATUS = {
  completed:   { icon: CheckCircle2, color: '#22C55E', label: 'Complete' },
  in_progress: { icon: Clock,        color: '#3D8EF0', label: 'In Progress' },
  pending:     { icon: Clock,        color: '#3A3A45', label: 'Upcoming' },
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default async function PortalPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params

  // ── Auth check ──────────────────────────────────────────
  const cookieStore = await cookies()
  const portalCookie = cookieStore.get(`portal_${clientId}`)
  if (!portalCookie?.value) {
    redirect(`/portal/${clientId}/login`)
  }

  // ── Fetch real data ──────────────────────────────────────
  const client = await getPortalData(clientId)
  if (!client) notFound()

  const activeProjects = client.projects.filter(p =>
    ['active', 'review', 'scoping'].includes(p.status)
  )

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0B', fontFamily: 'var(--font-body)' }}>
      {/* Portal header */}
      <header
        className="px-8 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E24', background: '#111114' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: '#3D8EF015', border: '1px solid #3D8EF030' }}>
            <span className="font-bold text-xs" style={{ color: '#3D8EF0' }}>M</span>
          </div>
          <div>
            <span className="font-display text-sm font-semibold text-mx-light">Mechanixer</span>
            <span className="text-mx-mid text-xs ml-2">Client Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-mx-mid">Welcome, {client.contactName}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-2xs font-semibold"
            style={{ background: '#3D8EF020', color: '#3D8EF0', border: '1px solid #3D8EF030' }}
          >
            {getInitials(client.contactName)}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-2xl font-bold text-mx-white">{client.companyName}</h1>
          <p className="text-mx-mid text-sm mt-1">
            {formatDate(new Date(), 'EEEE, MMMM d yyyy')} · {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {activeProjects.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-mx-mid text-sm">No active projects at this time.</p>
            <p className="text-mx-subtle text-xs mt-1">Your project manager will update this portal when work begins.</p>
          </div>
        )}

        {/* Project cards */}
        {activeProjects.map(project => {
          // Calculate progress from milestones
          const totalMilestones = project.milestones.length
          const completedMilestones = project.milestones.filter(m => m.status === 'completed').length
          const progress = totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0

          return (
            <div key={project.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-base font-semibold text-mx-white">{project.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xs text-mx-mid mb-1">Milestone Progress</p>
                  <p className="font-display text-2xl font-bold text-mx-white">{progress}%</p>
                </div>
              </div>

              <ProgressBar value={progress} className="mb-4" />

              {/* Client note */}
              {project.clientNotes && (
                <div
                  className="p-3.5 rounded-md mb-5 text-xs text-mx-dim leading-relaxed"
                  style={{ background: '#1E1E24', border: '1px solid #2A2A32' }}
                >
                  <p className="text-2xs text-mx-mid mb-1 uppercase tracking-wider">Latest Update from Mechanixer</p>
                  {project.clientNotes}
                </div>
              )}

              {/* Milestones */}
              {project.milestones.length > 0 && (
                <div className="mb-5">
                  <p className="section-title mb-3">Milestones</p>
                  <div className="space-y-2">
                    {project.milestones.map((m, i) => {
                      const cfg = MILESTONE_STATUS[m.status ?? 'pending']
                      const Icon = cfg.icon
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
                          <span
                            className="text-xs flex-1"
                            style={{ color: m.status === 'pending' ? '#3A3A45' : '#C8C8D4' }}
                          >
                            {m.name}
                          </span>
                          {m.dueDate && (
                            <span className="font-mono text-2xs text-mx-subtle">
                              {formatDate(m.dueDate instanceof Date ? m.dueDate : new Date(Number(m.dueDate)), 'MMM d, yyyy')}
                            </span>
                          )}
                          {m.status === 'in_progress' && (
                            <span className="badge" style={{ background: '#3D8EF015', color: '#3D8EF0' }}>Active</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Files */}
              {project.files.length > 0 && (
                <div>
                  <p className="section-title mb-3">Deliverables & Files</p>
                  <div className="space-y-2">
                    {project.files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-md"
                        style={{ background: '#111114', border: '1px solid #1E1E24' }}
                      >
                        <FileDown size={14} className="text-mx-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-mx-light font-medium truncate">{f.name}</p>
                          <p className="text-2xs text-mx-mid">
                            {f.size ? `${(f.size / 1024 / 1024).toFixed(1)} MB · ` : ''}
                            {formatDate(new Date(f.createdAt!), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {f.url && (
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-1 px-2.5 text-2xs">
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Invoices */}
        {client.invoices.length > 0 && (
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
                </tr>
              </thead>
              <tbody>
                {client.invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-mx-accent">{inv.number}</td>
                    <td className="font-mono text-xs text-mx-dim">
                      {formatDate(inv.issueDate instanceof Date ? inv.issueDate : new Date(Number(inv.issueDate)), 'MMM d, yyyy')}
                    </td>
                    <td className="font-mono text-xs text-mx-dim">
                      {formatDate(inv.dueDate instanceof Date ? inv.dueDate : new Date(Number(inv.dueDate)), 'MMM d, yyyy')}
                    </td>
                    <td className="font-mono font-semibold text-mx-light">
                      {formatCurrency(inv.total)}
                    </td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contact */}
        <div
          className="p-4 rounded-lg flex items-center gap-4 text-xs text-mx-mid"
          style={{ border: '1px solid #1E1E24', background: '#111114' }}
        >
          <MessageSquare size={14} className="text-mx-accent flex-shrink-0" />
          <span>
            Questions about your project? Contact your project manager at{' '}
            <span style={{ color: '#3D8EF0' }}>blagoj@mechanixer.com</span>
          </span>
        </div>
      </main>
    </div>
  )
}
