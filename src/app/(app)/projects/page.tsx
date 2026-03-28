import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getProjects } from '@/lib/db/queries'
import { Plus, FolderKanban } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Projects' }
export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  fixed_price: 'Fixed',
  retainer: 'Retainer',
  time_and_materials: 'T&M',
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const activeCount = projects.filter(p => p.status === 'active').length

  return (
    <div className="animate-in">
      <PageHeader
        title="Projects"
        subtitle={`${activeCount} active · ${projects.length} total`}
        actions={
          <button className="btn btn-primary">
            <Plus size={14} />
            New Project
          </button>
        }
      />

      {/* Filters */}
      <div className="px-8 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid #1E1E24' }}>
        {(['all', 'active', 'review', 'scoping', 'completed'] as const).map(f => (
          <button
            key={f}
            className="px-3 py-1 rounded text-xs capitalize transition-colors"
            style={f === 'all'
              ? { background: '#3D8EF015', color: '#3D8EF0', border: '1px solid #3D8EF030' }
              : { background: 'transparent', color: '#6B6B7A', border: '1px solid transparent' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="px-8 py-6 space-y-3">
        {projects.length === 0 && (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started."
          />
        )}
        {projects.map(p => {
          const totalTasks = p.tasks?.length ?? 0
          const doneTasks = p.tasks?.filter(t => t.status === 'done').length ?? 0
          const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

          // Time-based progress from logged hours vs budget
          const loggedHours = p.timeEntries?.reduce((s: number, e: any) => s + e.hours, 0) ?? 0
          const budgetHours = p.budgetHours ?? 1
          const hourPct = Math.round((loggedHours / budgetHours) * 100)

          const budgetAmount = p.budgetAmount ?? 0
          const spent = loggedHours * (p.hourlyRate ?? 80)
          const budgetPct = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0
          const budgetColor = budgetPct > 95 ? 'red' as const : budgetPct > 80 ? 'amber' as const : 'green' as const

          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card p-5 block hover:border-mx-subtle transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-mx-light group-hover:text-mx-white transition-colors truncate">
                      {p.name}
                    </h3>
                    <span className="badge flex-shrink-0" style={{ background: '#1E1E24', color: '#6B6B7A' }}>
                      {TYPE_LABELS[p.type]}
                    </span>
                  </div>
                  <p className="text-xs text-mx-mid mb-3">{p.client?.companyName}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-2xs text-mx-mid mb-1">
                        <span>Tasks</span>
                        <span className="font-mono">{doneTasks}/{totalTasks}</span>
                      </div>
                      <ProgressBar value={progress} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-2xs text-mx-mid mb-1">
                        <span>Hours</span>
                        <span className="font-mono">{Math.round(loggedHours)}/{budgetHours}h</span>
                      </div>
                      <ProgressBar value={hourPct} color={hourPct > 90 ? 'amber' : 'blue'} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  {budgetAmount > 0 && (
                    <div className="text-right">
                      <p className="text-2xs text-mx-mid mb-1">Budget spent</p>
                      <p className={`font-mono text-sm font-semibold text-mx-${budgetColor}`}>
                        {formatCurrency(spent)}
                      </p>
                      <p className="text-2xs text-mx-subtle">of {formatCurrency(budgetAmount)}</p>
                    </div>
                  )}
                  {p.endDate && (
                    <div className="text-right">
                      <p className="text-2xs text-mx-mid mb-1">Due</p>
                      <p className="font-mono text-xs text-mx-light">{formatDate(p.endDate, 'MMM d')}</p>
                    </div>
                  )}
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={p.status} />
                    {p.leadEngineerUser && <Avatar name={p.leadEngineerUser.name} size="sm" />}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
