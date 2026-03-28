'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatDate, formatHours } from '@/lib/utils'
import { logTime, deleteTimeEntry } from '@/lib/actions/time'
import { Plus, ChevronLeft, ChevronRight, Play, Trash2, Clock } from 'lucide-react'

interface TimeEntry {
  id: string
  date: Date
  hours: number
  description: string | null
  billable: boolean
  user: { id: string; name: string }
  project: { id: string; name: string; client: { companyName: string } | null } | null
  task: { title: string } | null
}

interface DayGroup {
  date: Date
  entries: TimeEntry[]
}

interface EngineerStat {
  id: string
  name: string
  weekHours: number
  monthHours: number
  billableHours: number
  utilization: number
}

interface Props {
  weekStart: Date
  weekEnd: Date
  entriesByDay: DayGroup[]
  engineerStats: EngineerStat[]
  totalWeekHours: number
  billableWeekHours: number
  activeProjects: { id: string; name: string; client: string }[]
}

function LogTimeModal({ open, onClose, projects }: {
  open: boolean
  onClose: () => void
  projects: { id: string; name: string; client: string }[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    // Use first engineer as default user — in real auth this comes from session
    fd.set('userId', 'tomche-placeholder')
    const result = await logTime(fd)
    setLoading(false)
    if ('error' in result) { setError('Check all fields'); return }
    onClose()
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-[400px] animate-in" style={{ background: '#16161A' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1E1E24' }}>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-mx-accent" />
            <span className="font-semibold text-mx-light text-sm">Log Time</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-mx-muted">
            <span className="text-mx-mid text-lg leading-none">×</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Project *</label>
            <select name="projectId" className="mx-input" required>
              <option value="">Select project…</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Date *</label>
              <input
                type="date"
                name="date"
                className="mx-input"
                defaultValue={formatDate(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Hours *</label>
              <input
                type="number"
                name="hours"
                className="mx-input font-mono"
                placeholder="0.0"
                step="0.25"
                min="0.25"
                max="24"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Engineer *</label>
            <select name="engineerName" className="mx-input" required>
              <option value="">Select engineer…</option>
              <option value="Tomche">Tomche</option>
              <option value="Katerina">Katerina</option>
              <option value="Blagoj">Blagoj</option>
            </select>
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Description</label>
            <input type="text" name="description" className="mx-input" placeholder="What did you work on?" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="billable" id="billable" defaultChecked style={{ accentColor: '#3D8EF0' }} />
            <label htmlFor="billable" className="text-xs text-mx-dim cursor-pointer">Billable hours</label>
          </div>
          {error && <p className="text-xs text-mx-red">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving…' : 'Log Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TimeWeekView({
  weekStart, weekEnd, entriesByDay, engineerStats,
  totalWeekHours, billableWeekHours, activeProjects
}: Props) {
  const [logOpen, setLogOpen] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    if (!timerRunning) return
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [timerRunning])

  const timerStr = `${String(Math.floor(timer / 3600)).padStart(2, '0')}:${String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`

  const weekLabel = `${formatDate(weekStart, 'MMM d')} – ${formatDate(weekEnd, 'MMM d, yyyy')}`

  return (
    <div className="animate-in">
      <PageHeader
        title="Time Tracking"
        subtitle="Log and review team time entries"
        actions={
          <div className="flex items-center gap-2">
            {timerRunning ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: '#22C55E10', border: '1px solid #22C55E30' }}>
                <div className="time-dot" />
                <span className="text-xs text-mx-green font-mono">{timerStr}</span>
                <button
                  onClick={() => { setTimerRunning(false); setTimer(0) }}
                  className="text-2xs text-mx-mid hover:text-mx-red ml-1"
                >Stop</button>
              </div>
            ) : (
              <button
                onClick={() => setTimerRunning(true)}
                className="btn btn-ghost text-xs"
              >
                <Play size={12} /> Start Timer
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setLogOpen(true)}>
              <Plus size={14} /> Log Time
            </button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* Week nav + summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost p-2"><ChevronLeft size={14} /></button>
            <span className="text-sm font-semibold text-mx-light">{weekLabel}</span>
            <button className="btn btn-ghost p-2"><ChevronRight size={14} /></button>
          </div>
          <div className="flex items-center gap-4 text-xs text-mx-mid">
            <span>Total: <span className="font-mono text-mx-light font-semibold">{formatHours(totalWeekHours)}</span></span>
            <span>Billable: <span className="font-mono text-mx-green font-semibold">{formatHours(billableWeekHours)}</span></span>
            <span>Non-billable: <span className="font-mono text-mx-amber font-semibold">{formatHours(totalWeekHours - billableWeekHours)}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Time log */}
          <div className="col-span-2 space-y-3">
            {entriesByDay.map(day => {
              const dayTotal = day.entries.reduce((s, e) => s + e.hours, 0)
              return (
                <div key={day.date.toISOString()} className="card overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E24' }}>
                    <span className="text-xs font-semibold text-mx-light">{formatDate(day.date, 'EEEE, MMM d')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-mx-mid">{formatHours(dayTotal)}</span>
                      <button onClick={() => setLogOpen(true)} className="p-1 rounded hover:bg-mx-muted">
                        <Plus size={12} className="text-mx-mid" />
                      </button>
                    </div>
                  </div>
                  {day.entries.length === 0 ? (
                    <div className="px-4 py-3 text-2xs text-mx-subtle italic">No entries</div>
                  ) : (
                    <div className="divide-y divide-mx-muted">
                      {day.entries.map(e => (
                        <div key={e.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-mx-muted/50 group">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.billable ? '#22C55E' : '#6B6B7A' }} />
                          <Avatar name={e.user.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-mx-light truncate">{e.description || e.task?.title || 'No description'}</p>
                            <p className="text-2xs text-mx-mid">{e.project?.name}</p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-mx-light">{formatHours(e.hours)}</span>
                          <button
                            onClick={async () => { await deleteTimeEntry(e.id); window.location.reload() }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-mx-red transition-all"
                          >
                            <Trash2 size={11} className="text-mx-subtle" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Engineer sidebar */}
          <div className="space-y-4">
            <p className="section-title">Engineer Hours</p>
            {engineerStats.length === 0 ? (
              <p className="text-xs text-mx-subtle">No engineers found. Run the seed script.</p>
            ) : (
              engineerStats.map(eng => (
                <div key={eng.id} className="card p-4">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Avatar name={eng.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-mx-light">{eng.name}</p>
                      <p className="text-2xs text-mx-mid">Engineer</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-mx-mid">This week</span>
                      <span className="font-mono text-mx-light">{formatHours(eng.weekHours)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-mx-mid">This month</span>
                      <span className="font-mono text-mx-light">{formatHours(eng.monthHours)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-mx-mid">Billable</span>
                      <span className="font-mono text-mx-green">{formatHours(eng.billableHours)}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-2xs text-mx-mid mb-1">
                        <span>Utilization</span>
                        <span className="font-mono">{eng.utilization}%</span>
                      </div>
                      <ProgressBar
                        value={eng.utilization}
                        color={eng.utilization > 90 ? 'amber' : 'blue'}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Daily heatmap */}
            <div className="card p-4">
              <p className="section-title mb-3">Daily Load</p>
              <div className="flex gap-1.5">
                {entriesByDay.map(day => {
                  const dayTotal = day.entries.reduce((s, e) => s + e.hours, 0)
                  const intensity = Math.min(dayTotal / 8, 1)
                  return (
                    <div key={day.date.toISOString()} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm"
                        style={{
                          height: '40px',
                          background: `rgba(61, 142, 240, ${0.08 + intensity * 0.85})`,
                          border: '1px solid rgba(61, 142, 240, 0.15)',
                        }}
                        title={`${formatDate(day.date, 'EEE')}: ${formatHours(dayTotal)}`}
                      />
                      <span className="text-2xs text-mx-subtle">{formatDate(day.date, 'EEE').slice(0, 2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LogTimeModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        projects={activeProjects}
      />
    </div>
  )
}
