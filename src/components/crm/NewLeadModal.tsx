'use client'

import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { createLead } from '@/lib/actions/leads'

interface NewLeadModalProps {
  open: boolean
  onClose: () => void
}

export default function NewLeadModal({ open, onClose }: NewLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await createLead(fd)
    setLoading(false)
    if ('error' in result) {
      setError('Please check required fields.')
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
      <div className="card w-[500px] animate-in" style={{ background: '#16161A' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1E1E24' }}>
          <div className="flex items-center gap-2">
            <Users size={15} className="text-mx-accent" />
            <span className="font-semibold text-mx-light text-sm">New Lead</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-mx-muted transition-colors">
            <X size={14} className="text-mx-mid" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Company *</label>
              <input name="companyName" className="mx-input" placeholder="Acme GmbH" required />
            </div>
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Country</label>
              <input name="country" className="mx-input" placeholder="DE" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Contact Name *</label>
              <input name="contactName" className="mx-input" placeholder="Klaus Müller" required />
            </div>
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Contact Email *</label>
              <input name="contactEmail" type="email" className="mx-input" placeholder="k.muller@acme.de" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Est. Value (EUR)</label>
              <input name="estimatedValue" type="number" className="mx-input font-mono" placeholder="0" />
            </div>
            <div>
              <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Industry</label>
              <select name="industry" className="mx-input">
                <option value="">Select…</option>
                <option>CNC machine builder</option>
                <option>Industrial automation</option>
                <option>Equipment manufacturer</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Source</label>
            <select name="source" className="mx-input">
              <option value="">Select…</option>
              <option>Referral</option>
              <option>LinkedIn</option>
              <option>Conference</option>
              <option>Website</option>
              <option>Cold outreach</option>
            </select>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Next Action</label>
            <div className="grid grid-cols-2 gap-3">
              <input name="nextAction" className="mx-input" placeholder="Discovery call" />
              <input name="nextActionDate" type="date" className="mx-input" />
            </div>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Notes</label>
            <textarea name="notes" className="mx-input resize-none" rows={2} placeholder="Context, requirements, how they found us…" />
          </div>

          {error && <p className="text-xs text-mx-red">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Creating…' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
