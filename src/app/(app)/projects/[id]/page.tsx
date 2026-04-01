import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import ProjectStatusButton from '@/components/projects/ProjectStatusButton'
import ProgressBar from '@/components/ui/ProgressBar'
import Avatar from '@/components/ui/Avatar'
import { formatCurrency, formatDate, formatHours } from '@/lib/utils'
import { getProject, getProjectStats } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import {
  FileDown, DollarSign, Users, Calendar
} from 'lucide-react'
import ProjectTaskManager from '@/components/projects/ProjectTaskManager'
import LogTimeButton from '@/components/projects/LogTimeButton'
import FileUploadButton from '@/components/projects/FileUploadButton'

export const metadata: Metadata = { title: 'Project' }
export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const stats = await getProjectStats(id)
  const teamUsers = await db.select({ id: users.id, name: users.name }).from(users).orderBy(users.name)

  const progress = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  const budgetAmount = project.budgetAmount ?? 0
  const spent = stats.loggedHours * (project.hourlyRate ?? 80)
  const budgetPct = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0
  const hourPct = project.budgetHours ? Math.round((stats.loggedHours / project.budgetHours) * 100) : 0
  const daysLeft = project.endDate
    ? Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const budgetColor = budgetPct > 95 ? 'red' as const : budgetPct > 80 ? 'amber' as const : 'green' as const

  const milestones = (project.milestones ?? []).map(m => ({
    id: m.id,
    name: m.name,
    status: (m.status ?? 'pending') as string,
    dueDate: m.dueDate,
    tasks: (m.tasks ?? []).map(t => ({
      id: t.id,
      title: t.title,
      status: (t.status ?? 'todo') as string,
      estimatedHours: t.estimatedHours,
      dueDate: t.dueDate,
      assignedUser: t.assignedUser ? { id: t.assignedUser.id, name: t.assignedUser.name } : null,
    })),
  }))

  return (
    <div className="animate-in">
      <PageHeader
        title={project.name}
        subtitle={`${project.client?.companyName} · ${project.type.replace(/_/g, ' ')}`}
        actions={
          <div className="flex items-center gap-2">
            {/* Client component — handles modal open/close state */}
            <LogTimeButton projectId={project.id} projectName={project.name} />
            <ProjectStatusButton projectId={project.id} initialStatus={project.status} />
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="section-title mb-2">Progress</p>
            <p className="stat-number mb-2">{progress}%</p>
            <ProgressBar value={progress} />
            <p className="text-2xs text-mx-mid mt-1">{stats.completedTasks}/{stats.totalTasks} tasks</p>
          </div>
          <div className="card p-4">
            <p className="section-title mb-2">Budget</p>
            <p className="stat-number mb-1">{formatCurrency(spent)}</p>
            {budgetAmount > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  <ProgressBar value={budgetPct} className="flex-1" color={budgetColor} />
                  <span className="font-mono text-2xs text-mx-mid">{budgetPct}%</span>
                </div>
                <p className="text-2xs text-mx-mid mt-1">of {formatCurrency(budgetAmount)}</p>
              </>
            )}
          </div>
          <div className="card p-4">
            <p className="section-title mb-2">Hours Logged</p>
            <p className="stat-number mb-1">{formatHours(stats.loggedHours)}</p>
            {project.budgetHours && (
              <>
                <div className="flex items-center gap-1.5">
                  <ProgressBar value={hourPct} className="flex-1" color={hourPct > 90 ? 'amber' : 'blue'} />
                  <span className="font-mono text-2xs text-mx-mid">{hourPct}%</span>
                </div>
                <p className="text-2xs text-mx-mid mt-1">of {project.budgetHours}h budget</p>
              </>
            )}
          </div>
          <div className="card p-4">
            <p className="section-title mb-2">Deadline</p>
            {daysLeft !== null ? (
              <>
                <p className="stat-number mb-1" style={{ color: daysLeft < 7 ? '#EF4444' : undefined }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d over` : `${daysLeft}d`}
                </p>
                <p className="text-2xs text-mx-mid">{formatDate(project.endDate!, 'MMM d, yyyy')}</p>
              </>
            ) : (
              <p className="text-xs text-mx-subtle">No deadline set</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="col-span-2">
            <ProjectTaskManager projectId={project.id} milestones={milestones} users={teamUsers} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <p className="section-title">Details</p>
              <div className="space-y-2.5">
                {project.leadEngineerUser && (
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Lead engineer</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <Avatar name={project.leadEngineerUser.name} size="sm" />
                      <span className="text-xs text-mx-light">{project.leadEngineerUser.name}</span>
                    </div>
                  </div>
                )}
                {project.hourlyRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Rate</span>
                    <span className="ml-auto font-mono text-xs text-mx-light">€{project.hourlyRate}/h</span>
                  </div>
                )}
                {project.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Start</span>
                    <span className="ml-auto font-mono text-xs text-mx-light">
                      {formatDate(project.startDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              {project.internalNotes && (
                <>
                  <div className="divider" />
                  <div>
                    <p className="text-2xs text-mx-mid mb-1.5">Internal notes</p>
                    <p className="text-xs text-mx-dim leading-relaxed">{project.internalNotes}</p>
                  </div>
                </>
              )}
            </div>

            {/* Recent time */}
            <div className="card p-4">
              <div className="section-header">
                <p className="section-title">Recent Time</p>
                <a href="/time" className="text-2xs text-mx-accent hover:underline">All</a>
              </div>
              {(project.timeEntries ?? []).length === 0 ? (
                <p className="text-2xs text-mx-subtle py-2">No time logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {(project.timeEntries ?? []).slice(0, 6).map((e: any) => (
                    <div key={e.id} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: e.billable ? '#22C55E' : '#6B6B7A' }} />
                      <Avatar name={e.user?.name ?? '?'} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs text-mx-dim truncate">{e.description || 'No description'}</p>
                        <p className="text-2xs text-mx-subtle">{formatDate(e.date, 'MMM d')}</p>
                      </div>
                      <span className="font-mono text-xs text-mx-light flex-shrink-0">{formatHours(e.hours)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Files */}
            <div className="card p-4">
              <div className="section-header">
                <p className="section-title">Files</p>
                <FileUploadButton projectId={project.id} />
              </div>
              {(project.files ?? []).length === 0 ? (
                <p className="text-2xs text-mx-subtle py-2">No files yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {(project.files ?? []).map((f: any) => (
                    <div key={f.id} className="flex items-center gap-2 p-2 rounded hover:bg-mx-muted cursor-pointer">
                      <FileDown size={12} className="text-mx-accent flex-shrink-0" />
                      <p className="text-2xs text-mx-light truncate flex-1">{f.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
