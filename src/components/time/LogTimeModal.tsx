'use client'

import { useState } from 'react'
import { X, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { logTime } from '@/lib/actions/time'

interface LogTimeModalProps {
  open: boolean
  onClose: () => void
  projects: { id: string; name: string; client: string }[]
  userId: string
}

export default function LogTimeModal({ open, onClose, projects, userId }: LogTimeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('userId', userId)
    const result = await logTime(fd)
    setLoading(false)
    if ('error' in result) {
      setError('Please check all fields and try again.')
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-[420px] animate-in" style={{ background: '#16161A' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1E1E24' }}>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-mx-accent" />
            <span className="font-semibold text-mx-light text-sm">Log Time</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-mx-muted transition-colors">
            <X size={14} className="text-mx-mid" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Project */}
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Project *</label>
            <select name="projectId" className="mx-input" required>
              <option value="">Select project…</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
              ))}
            </select>
          </div>

          {/* Date + Hours */}
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

          {/* Description */}
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Description</label>
            <input
              type="text"
              name="description"
              className="mx-input"
              placeholder="What did you work on?"
            />
          </div>

          {/* Billable toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="billable"
              id="billable"
              defaultChecked
              className="w-4 h-4 rounded"
              style={{ accentColor: '#3D8EF0' }}
            />
            <label htmlFor="billable" className="text-xs text-mx-dim cursor-pointer">
              Billable hours
            </label>
          </div>

          {error && <p className="text-xs text-mx-red">{error}</p>}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
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
