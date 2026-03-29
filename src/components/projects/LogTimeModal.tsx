'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Timer, CheckCircle, AlertCircle } from 'lucide-react'

interface LogTimeModalProps {
  projectId: string
  projectName: string
  onClose: () => void
  onSuccess: () => void
}

export default function LogTimeModal({ projectId, projectName, onClose, onSuccess }: LogTimeModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')
  const [billable, setBillable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const h = parseFloat(hours)
    if (!hours || isNaN(h) || h <= 0 || h > 24) {
      setError('Enter a valid number of hours (0–24).')
      return
    }
    if (!date) {
      setError('Please select a date.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, date, hours: h, description: description.trim(), billable }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to log time')

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-xl border shadow-2xl animate-in"
        style={{ background: '#16161A', borderColor: '#2A2A35' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2A2A35' }}>
          <div className="flex items-center gap-2.5">
            <Timer size={16} className="text-mx-accent" />
            <div>
              <p className="text-sm font-semibold text-mx-light">Log Time</p>
              <p className="text-2xs text-mx-mid truncate max-w-[220px]">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-mx-muted transition-colors"
          >
            <X size={15} className="text-mx-mid" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Date + Hours row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs text-mx-mid mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
                className="w-full rounded-lg px-3 py-2 text-xs text-mx-light border outline-none focus:border-mx-accent transition-colors"
                style={{ background: '#0A0A0B', borderColor: '#2A2A35' }}
              />
            </div>
            <div>
              <label className="block text-2xs text-mx-mid mb-1.5">Hours</label>
              <input
                type="number"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="e.g. 3.5"
                step="0.25"
                min="0.25"
                max="24"
                required
                autoFocus
                className="w-full rounded-lg px-3 py-2 text-xs font-mono text-mx-light border outline-none focus:border-mx-accent transition-colors"
                style={{ background: '#0A0A0B', borderColor: '#2A2A35' }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-2xs text-mx-mid mb-1.5">Description <span className="text-mx-subtle">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-xs text-mx-light border outline-none focus:border-mx-accent transition-colors resize-none"
              style={{ background: '#0A0A0B', borderColor: '#2A2A35' }}
            />
          </div>

          {/* Billable toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBillable(!billable)}
              className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
              style={{ background: billable ? '#3D8EF0' : '#2A2A35' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: billable ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
            <span className="text-xs text-mx-dim">Billable</span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={13} className="flex-shrink-0" />
              Time logged successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary text-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Logging…
                </>
              ) : (
                <>
                  <Timer size={13} />
                  Log Time
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
