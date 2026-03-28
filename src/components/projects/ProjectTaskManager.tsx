'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDate, formatHours } from '@/lib/utils'
import { updateTaskStatus, createTask } from '@/lib/actions/projects'
import Avatar from '@/components/ui/Avatar'

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

interface Task {
  id: string
  title: string
  status: TaskStatus | string
  estimatedHours: number | null
  dueDate: Date | null
  assignedUser: { id: string; name: string } | null
}

interface Milestone {
  id: string
  name: string
  status: MilestoneStatus | string
  dueDate: Date | null
  tasks: Task[]
}

interface Props {
  projectId: string
  milestones: Milestone[]
}

const TASK_STATUS_CFG: Record<string, { icon: any; color: string; next: string }> = {
  todo:        { icon: Circle,       color: '#3A3A45', next: 'in_progress' },
  in_progress: { icon: Clock,        color: '#3D8EF0', next: 'review' },
  review:      { icon: AlertCircle,  color: '#8B5CF6', next: 'done' },
  done:        { icon: CheckCircle2, color: '#22C55E', next: 'todo' },
  pending:     { icon: Circle,       color: '#3A3A45', next: 'in_progress' },
  completed:   { icon: CheckCircle2, color: '#22C55E', next: 'todo' },
}

const MILESTONE_STATUS_CFG: Record<string, { color: string }> = {
  pending:     { color: '#3A3A45' },
  in_progress: { color: '#3D8EF0' },
  completed:   { color: '#22C55E' },
}

function TaskRow({
  task,
  projectId,
  onStatusChange,
}: {
  task: Task
  projectId: string
  onStatusChange: (taskId: string, newStatus: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const cfg = TASK_STATUS_CFG[task.status] ?? TASK_STATUS_CFG['todo']
  const Icon = cfg.icon

  function cycleStatus() {
    const next = cfg.next as TaskStatus
    startTransition(async () => {
      await updateTaskStatus(task.id, projectId, next)
      onStatusChange(task.id, next)
    })
  }

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded hover:bg-mx-muted/40 transition-colors group"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      {/* Status toggle */}
      <button
        onClick={cycleStatus}
        className="flex-shrink-0 hover:scale-110 transition-transform"
        title={`Mark as ${cfg.next}`}
      >
        <Icon size={15} style={{ color: cfg.color }} />
      </button>

      <span className={`text-xs flex-1 leading-relaxed ${
        task.status === 'done' || task.status === 'completed'
          ? 'line-through text-mx-subtle'
          : 'text-mx-dim'
      }`}>
        {task.title}
      </span>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.estimatedHours && (
          <span className="text-2xs font-mono text-mx-subtle">{task.estimatedHours}h</span>
        )}
        {task.dueDate && (
          <span className="text-2xs font-mono text-mx-subtle">{formatDate(task.dueDate, 'MMM d')}</span>
        )}
      </div>

      {task.assignedUser && (
        <Avatar name={task.assignedUser.name} size="sm" />
      )}
    </div>
  )
}

function MilestoneSection({
  milestone,
  projectId,
}: {
  milestone: Milestone
  projectId: string
}) {
  const [expanded, setExpanded] = useState(milestone.status !== 'completed')
  const [tasks, setTasks] = useState(milestone.tasks)
  const [addingTask, setAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const cfg = MILESTONE_STATUS_CFG[milestone.status] ?? MILESTONE_STATUS_CFG['pending']
  const done = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
  const total = tasks.length

  function handleStatusChange(taskId: string, newStatus: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  async function handleAddTask() {
    if (!newTaskTitle.trim()) return
    startTransition(async () => {
      const result = await createTask({
        projectId,
        milestoneId: milestone.id,
        title: newTaskTitle.trim(),
      })
      if (result.success && result.id) {
        setTasks(prev => [...prev, {
          id: result.id!,
          title: newTaskTitle.trim(),
          status: 'todo',
          estimatedHours: null,
          dueDate: null,
          assignedUser: null,
        }])
        setNewTaskTitle('')
        setAddingTask(false)
      }
    })
  }

  return (
    <div className="card overflow-hidden">
      {/* Milestone header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-mx-muted/30 transition-colors"
        style={{ borderBottom: expanded ? '1px solid #1E1E24' : 'none' }}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
        {expanded ? (
          <ChevronDown size={13} className="text-mx-mid flex-shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-mx-mid flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-mx-light flex-1 text-left">{milestone.name}</span>
        <div className="flex items-center gap-3 text-2xs text-mx-mid">
          <span className="font-mono">{done}/{total}</span>
          {milestone.dueDate && (
            <span className="font-mono">{formatDate(milestone.dueDate, 'MMM d')}</span>
          )}
          {milestone.status === 'completed' && (
            <span className="badge" style={{ background: '#22C55E15', color: '#22C55E' }}>Done</span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-2 py-1">
          {tasks.length === 0 && !addingTask && (
            <p className="text-2xs text-mx-subtle px-3 py-2">No tasks yet.</p>
          )}
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              projectId={projectId}
              onStatusChange={handleStatusChange}
            />
          ))}

          {/* Add task inline */}
          {addingTask ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Circle size={15} className="text-mx-subtle flex-shrink-0" />
              <input
                autoFocus
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTask()
                  if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle('') }
                }}
                placeholder="Task title… (Enter to save, Esc to cancel)"
                className="mx-input flex-1 py-1 text-xs"
                disabled={isPending}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-2xs text-mx-subtle hover:text-mx-mid transition-colors rounded"
            >
              <Plus size={11} />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectTaskManager({ projectId, milestones }: Props) {
  return (
    <div className="space-y-3">
      <div className="section-header">
        <span className="section-title">Milestones & Tasks</span>
        <button className="btn btn-ghost text-xs">
          <Plus size={12} /> Add Milestone
        </button>
      </div>
      {milestones.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-mx-subtle text-sm">No milestones yet.</p>
          <p className="text-mx-subtle text-xs mt-1">Add milestones to organize project work.</p>
        </div>
      ) : (
        milestones.map(m => (
          <MilestoneSection key={m.id} milestone={m} projectId={projectId} />
        ))
      )}
    </div>
  )
}
