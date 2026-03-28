import type { Metadata } from 'next'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import Avatar from '@/components/ui/Avatar'
import { formatCurrency, formatDate, formatHours } from '@/lib/utils'
import {
  CheckCircle2, Circle, Clock, AlertCircle,
  FileDown, Plus, ChevronRight, MoreHorizontal,
  DollarSign, Users, Calendar, Timer
} from 'lucide-react'

export const metadata: Metadata = { title: 'Project Detail' }

// ── Mock project detail data ──────────────────────────
const project = {
  id: '1',
  name: 'Conveyor System Redesign',
  client: 'AutoLine GmbH',
  type: 'fixed_price' as const,
  status: 'active' as const,
  description: 'Full mechanical redesign of the main production line conveyor system including drive assembly, frame structure, and all associated sub-components.',
  engineer: 'Tomche',
  startDate: new Date('2025-01-06'),
  endDate: new Date('2025-03-15'),
  budget: 24000,
  hourlyRate: 80,
  budgetHours: 300,
  loggedHours: 210,
  billableHours: 206,
  spent: 16800,
  progress: 68,
  internalNotes: 'Client wants ISO drawings for the frame. Check with Katerina on bolt standard.',
}

const milestones = [
  {
    id: 'm1', name: 'Requirements & Scope', status: 'completed' as const,
    dueDate: new Date('2025-01-15'), completedAt: new Date('2025-01-14'),
    tasks: [
      { id: 't1', title: 'Kickoff call with AutoLine team',   status: 'done' as const,    hours: 2, assignee: 'Blagoj' },
      { id: 't2', title: 'Document existing conveyor specs',  status: 'done' as const,    hours: 4, assignee: 'Tomche' },
      { id: 't3', title: 'Define deliverables and timeline',  status: 'done' as const,    hours: 3, assignee: 'Blagoj' },
    ],
  },
  {
    id: 'm2', name: 'Concept Design', status: 'completed' as const,
    dueDate: new Date('2025-01-31'), completedAt: new Date('2025-01-30'),
    tasks: [
      { id: 't4', title: 'Sketch 3 conveyor layout options',  status: 'done' as const,    hours: 12, assignee: 'Tomche' },
      { id: 't5', title: 'Client review presentation',        status: 'done' as const,    hours: 3,  assignee: 'Blagoj' },
      { id: 't6', title: 'Finalise selected concept',         status: 'done' as const,    hours: 6,  assignee: 'Tomche' },
    ],
  },
  {
    id: 'm3', name: 'Detail CAD — Drive System', status: 'completed' as const,
    dueDate: new Date('2025-02-14'), completedAt: new Date('2025-02-14'),
    tasks: [
      { id: 't7', title: 'Drive shaft tolerance analysis',    status: 'done' as const,    hours: 18, assignee: 'Tomche' },
      { id: 't8', title: 'Motor mount bracket design',        status: 'done' as const,    hours: 14, assignee: 'Tomche' },
      { id: 't9', title: 'Drive system CAD assembly',         status: 'done' as const,    hours: 24, assignee: 'Tomche' },
    ],
  },
  {
    id: 'm4', name: 'Detail CAD — Frame Assembly', status: 'in_progress' as const,
    dueDate: new Date('2025-03-01'),
    tasks: [
      { id: 't10', title: 'Main frame structural members',    status: 'in_progress' as const, hours: 20, assignee: 'Tomche',  estimated: 28 },
      { id: 't11', title: 'Cross-beam connection points',     status: 'todo' as const,         hours: 0,  assignee: 'Tomche',  estimated: 16 },
      { id: 't12', title: 'Leg assembly and floor mounting',  status: 'todo' as const,         hours: 0,  assignee: 'Tomche',  estimated: 12 },
      { id: 't13', title: 'Frame assembly review',            status: 'todo' as const,         hours: 0,  assignee: 'Blagoj',  estimated: 4  },
    ],
  },
  {
    id: 'm5', name: 'BOM & Manufacturing Drawings', status: 'pending' as const,
    dueDate: new Date('2025-03-15'),
    tasks: [
      { id: 't14', title: 'Full BOM export',                  status: 'todo' as const,         hours: 0, assignee: 'Tomche',  estimated: 6 },
      { id: 't15', title: 'Manufacturing drawings package',    status: 'todo' as const,         hours: 0, assignee: 'Tomche',  estimated: 16 },
      { id: 't16', title: 'Final client delivery',            status: 'todo' as const,         hours: 0, assignee: 'Blagoj',  estimated: 2 },
    ],
  },
]

const recentTime = [
  { date: new Date('2025-02-21'), user: 'Tomche',   task: 'Main frame structural members',  hours: 6,   billable: true },
  { date: new Date('2025-02-20'), user: 'Tomche',   task: 'Main frame structural members',  hours: 7.5, billable: true },
  { date: new Date('2025-02-19'), user: 'Blagoj',   task: 'Client check-in call',           hours: 1,   billable: false },
  { date: new Date('2025-02-18'), user: 'Tomche',   task: 'Drive system CAD assembly',      hours: 6.5, billable: true },
]

const projectFiles = [
  { name: 'Conveyor_Concept_Rev2.pdf',     size: '4.2 MB',  date: new Date('2025-01-31'), category: 'deliverable' },
  { name: 'Drive_System_Analysis.pdf',     size: '1.8 MB',  date: new Date('2025-02-14'), category: 'deliverable' },
  { name: 'Frame_Assembly_Draft_v1.stp',   size: '28.4 MB', date: new Date('2025-02-20'), category: 'deliverable' },
  { name: 'AutoLine_Specs_Original.pdf',   size: '3.1 MB',  date: new Date('2025-01-07'), category: 'reference' },
]

// ── Sub-components ────────────────────────────────────

const TASK_STATUS_ICON = {
  done:        { icon: CheckCircle2, color: '#22C55E' },
  in_progress: { icon: Clock,        color: '#3D8EF0' },
  review:      { icon: AlertCircle,  color: '#8B5CF6' },
  todo:        { icon: Circle,       color: '#3A3A45' },
}

function TaskRow({ task }: { task: typeof milestones[0]['tasks'][0] & { estimated?: number } }) {
  const cfg = TASK_STATUS_ICON[task.status]
  const Icon = cfg.icon

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded hover:bg-mx-muted/50 transition-colors group cursor-pointer">
      <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
      <span className={`text-xs flex-1 ${task.status === 'done' ? 'line-through text-mx-subtle' : 'text-mx-dim'}`}>
        {task.title}
      </span>
      {task.assignee && (
        <Avatar name={task.assignee} size="sm" />
      )}
      {task.estimated && task.status !== 'done' && (
        <span className="text-2xs font-mono text-mx-subtle">{task.estimated}h est.</span>
      )}
      {task.hours > 0 && (
        <span className="text-2xs font-mono text-mx-mid">{formatHours(task.hours)}</span>
      )}
      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-mx-border transition-all">
        <MoreHorizontal size={12} className="text-mx-mid" />
      </button>
    </div>
  )
}

function MilestoneSection({ milestone }: { milestone: typeof milestones[0] }) {
  const cfg = TASK_STATUS_ICON[milestone.status]
  const Icon = cfg.icon
  const done = milestone.tasks.filter(t => t.status === 'done').length
  const total = milestone.tasks.length

  return (
    <div className="card overflow-hidden">
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid #1E1E24' }}
      >
        <Icon size={15} style={{ color: cfg.color, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-mx-light">{milestone.name}</span>
        </div>
        <div className="flex items-center gap-3 text-2xs text-mx-mid">
          <span className="font-mono">{done}/{total} tasks</span>
          <span className="font-mono">{formatDate(milestone.dueDate, 'MMM d')}</span>
          {milestone.completedAt && (
            <span className="badge" style={{ background: '#22C55E15', color: '#22C55E' }}>Done</span>
          )}
        </div>
        <button className="p-1 rounded hover:bg-mx-muted transition-colors">
          <Plus size={13} className="text-mx-subtle" />
        </button>
      </div>
      <div className="px-2 py-1">
        {milestone.tasks.map(task => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const budgetPct = Math.round((project.spent / project.budget) * 100)
  const hourPct   = Math.round((project.loggedHours / project.budgetHours) * 100)
  const daysLeft  = Math.ceil((project.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <AppShell>
      <div className="animate-in">
        <PageHeader
          title={project.name}
          subtitle={`${project.client} · ${project.type.replace('_', ' ')}`}
          actions={
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost">
                <Timer size={14} />
                Log Time
              </button>
              <StatusBadge status={project.status} />
            </div>
          }
        />

        <div className="px-8 py-6 space-y-6">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-4 gap-4">
            {/* Progress */}
            <div className="card p-4">
              <p className="section-title mb-2">Progress</p>
              <p className="stat-number mb-2">{project.progress}%</p>
              <ProgressBar value={project.progress} />
            </div>
            {/* Budget */}
            <div className="card p-4">
              <p className="section-title mb-2">Budget</p>
              <p className="stat-number mb-1">{formatCurrency(project.spent)}</p>
              <div className="flex items-center gap-1.5">
                <ProgressBar
                  value={budgetPct}
                  className="flex-1"
                  color={budgetPct > 90 ? 'red' : budgetPct > 75 ? 'amber' : 'green'}
                />
                <span className="font-mono text-2xs text-mx-mid">{budgetPct}%</span>
              </div>
              <p className="text-2xs text-mx-mid mt-1">of {formatCurrency(project.budget)}</p>
            </div>
            {/* Hours */}
            <div className="card p-4">
              <p className="section-title mb-2">Hours</p>
              <p className="stat-number mb-1">{project.loggedHours}h</p>
              <div className="flex items-center gap-1.5">
                <ProgressBar value={hourPct} className="flex-1" color={hourPct > 90 ? 'amber' : 'blue'} />
                <span className="font-mono text-2xs text-mx-mid">{hourPct}%</span>
              </div>
              <p className="text-2xs text-mx-mid mt-1">of {project.budgetHours}h budget</p>
            </div>
            {/* Deadline */}
            <div className="card p-4">
              <p className="section-title mb-2">Deadline</p>
              <p className="stat-number mb-1">{daysLeft}d</p>
              <p className="text-xs text-mx-mid">remaining</p>
              <p className="font-mono text-2xs text-mx-subtle mt-1">
                {formatDate(project.startDate, 'MMM d')} → {formatDate(project.endDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* ── Main content: tasks + sidebar ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Tasks / Milestones */}
            <div className="col-span-2 space-y-3">
              <div className="section-header">
                <span className="section-title">Milestones & Tasks</span>
                <button className="btn btn-ghost text-xs">
                  <Plus size={12} />
                  Add Milestone
                </button>
              </div>
              {milestones.map(m => (
                <MilestoneSection key={m.id} milestone={m} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Details */}
              <div className="card p-4 space-y-3">
                <p className="section-title">Details</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Lead engineer</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <Avatar name={project.engineer} size="sm" />
                      <span className="text-xs text-mx-light">{project.engineer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Hourly rate</span>
                    <span className="ml-auto font-mono text-xs text-mx-light">€{project.hourlyRate}/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-mx-mid flex-shrink-0" />
                    <span className="text-2xs text-mx-mid">Start date</span>
                    <span className="ml-auto font-mono text-xs text-mx-light">{formatDate(project.startDate, 'MMM d, yyyy')}</span>
                  </div>
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
                <div className="space-y-2">
                  {recentTime.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: e.billable ? '#22C55E' : '#6B6B7A' }}
                      />
                      <Avatar name={e.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs text-mx-dim truncate">{e.task}</p>
                        <p className="text-2xs text-mx-subtle">{formatDate(e.date, 'MMM d')}</p>
                      </div>
                      <span className="font-mono text-xs text-mx-light flex-shrink-0">{formatHours(e.hours)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Files */}
              <div className="card p-4">
                <div className="section-header">
                  <p className="section-title">Files</p>
                  <button className="text-2xs text-mx-accent hover:underline">Upload</button>
                </div>
                <div className="space-y-1.5">
                  {projectFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded hover:bg-mx-muted transition-colors cursor-pointer"
                    >
                      <FileDown size={12} className="text-mx-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs text-mx-light truncate">{f.name}</p>
                        <p className="text-2xs text-mx-subtle">{f.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
