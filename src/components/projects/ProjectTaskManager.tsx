'use client'
import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { updateTaskStatus, createTask, updateMilestoneStatus } from '@/lib/actions/projects'
import Avatar from '@/components/ui/Avatar'
import AddMilestoneModal from './AddMilestoneModal'

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

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
  status: string
  dueDate: Date | null
  tasks: Task[]
}
interface User { id: string; name: string }
interface Props {
  projectId: string
  milestones: Milestone[]
  users?: User[]
}

const TASK_CFG: Record<string, { icon: any; color: string; next: string }> = {
  todo:      { icon: Circle,       color: '#3A3A45', next: 'in_progress' },
  in_progress:{ icon: Clock,       color: '#3D8EF0', next: 'review' },
  review:    { icon: AlertCircle,  color: '#8B5CF6', next: 'done' },
  done:      { icon: CheckCircle2, color: '#22C55E', next: 'todo' },
  pending:   { icon: Circle,       color: '#3A3A45', next: 'in_progress' },
  completed: { icon: CheckCircle2, color: '#22C55E', next: 'todo' },
}
const MILESTONE_CFG: Record<string, { color: string }> = {
  pending:    { color: '#3A3A45' },
  in_progress:{ color: '#3D8EF0' },
  completed:  { color: '#22C55E' },
}
const MILESTONE_NEXT: Record<string, 'pending' | 'in_progress' | 'completed'> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

function TaskRow({ task, projectId, onStatusChange }: {
  task: Task
  projectId: string
  onStatusChange: (id: string, status: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const cfg = TASK_CFG[task.status] ?? TASK_CFG['todo']
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
      {task.assignedUser && <Avatar name={task.assignedUser.name} size="sm" />}
    </div>
  )
}

function MilestoneSection({ milestone, projectId, users = [] }: {
  milestone: Milestone
  projectId: string
  users?: User[]
}) {
  const [expanded, setExpanded] = useState(milestone.status !== 'completed')
  const [tasks, setTasks] = useState(milestone.tasks)
  const [mStatus, setMStatus] = useState(milestone.status)
  const [addingTask, setAddingTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [isPending, startTransition] = useTransition()

  const mcfg = MILESTONE_CFG[mStatus] ?? MILESTONE_CFG['pending']
  const done = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
  const total = tasks.length

  function handleStatusChange(taskId: string, newStatus: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  function cycleMilestone(e: React.MouseEvent) {
    e.stopPropagation()
    const next = MILESTONE_NEXT[mStatus] ?? 'in_progress'
    setMStatus(next)
    startTransition(async () => {
      await updateMilestoneStatus(milestone.id, projectId, next)
    })
  }

  async function handleAddTask() {
    if (!newTitle.trim()) return
    startTransition(async () => {
      const result = await createTask({
        projectId,
        milestoneId: milestone.id,
        title: newTitle.trim(),
        assignedTo: newAssignee || undefined,
      })
      if (result.success && result.id) {
        const assignedUser = users.find(u => u.id === newAssignee) ?? null
        setTasks(prev => [...prev, {
          id: result.id!,
          title: newTitle.trim(),
          status: 'todo',
          estimatedHours: null,
          dueDate: null,
          assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name } : null,
        }])
        setNewTitle('')
        setNewAssignee('')
        setAddingTask(false)
      }
    })
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-mx-muted/30 transition-colors"
        style={{ borderBottom: expanded ? '1px solid #1E1E24' : 'none' }}
      >
        <button
          onClick={cycleMilestone}
          className="w-3 h-3 rounded-full flex-shrink-0 hover:scale-125 transition-transform cursor-pointer border-0 p-0"
          style={{ background: mcfg.color }}
          title={`Status: ${mStatus} — click to advance`}
        />
        {expanded
          ? <ChevronDown size={13} className="text-mx-mid flex-shrink-0" />
          : <ChevronRight size={13} className="text-mx-mid flex-shrink-0" />
        }
        <span className="text-sm font-semibold text-mx-light flex-1 text-left">{milestone.name}</span>
        <div className="flex items-center gap-3 text-2xs text-mx-mid">
          <span className="font-mono">{done}/{total}</span>
          {milestone.dueDate && (
            <span className="font-mono">{formatDate(milestone.dueDate, 'MMM d')}</span>
          )}
          {mStatus === 'completed' && (
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

          {addingTask ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Circle size={15} className="text-mx-subtle flex-shrink-0" />
              {users.length > 0 && (
                <select
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  className="mx-input text-xs w-28 flex-shrink-0"
                  disabled={isPending}
                >
                  <option value="">Assign...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              )}
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTask()
                  if (e.key === 'Escape') { setAddingTask(false); setNewTitle('') }
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
              <Plus size={11} /> Add task
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectTaskManager({ projectId, milestones, users = [] }: Props) {
  return (
    <div className="space-y-3">
      <div className="section-header">
        <span className="section-title">Milestones & Tasks</span>
        <AddMilestoneModal projectId={projectId} />
      </div>
      {milestones.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-mx-subtle text-sm">No milestones yet.</p>
          <p className="text-mx-subtle text-xs mt-1">Add milestones to organize project work.</p>
        </div>
      ) : (
        milestones.map(m => (
          <MilestoneSection key={m.id} milestone={m} projectId={projectId} users={users} />
        ))
      )}
    </div>
  )
}
