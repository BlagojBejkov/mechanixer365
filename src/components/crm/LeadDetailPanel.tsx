'use client'

import { useState, useTransition } from 'react'
import { X, Save, Trash2, ChevronDown, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createLead, updateLead, deleteLead, updateLeadStage } from '@/lib/actions/leads'
import type { Lead } from '@/lib/db/schema'
import { PIPELINE_STAGES } from '@/lib/constants'

const STAGE_COLORS: Record<string, string> = {
  new:           '#6B6B7A',
  qualified:     '#3D8EF0',
  proposal_sent: '#F59E0B',
  negotiation:   '#8B5CF6',
  won:           '#22C55E',
  lost:          '#EF4444',
}

interface LeadDetailPanelProps {
  lead: Lead | null
  defaultStage?: string
  onClose: () => void
  onUpdated: (lead: Lead) => void
  onCreated: (lead: Lead) => void
  onDeleted: (id: string) => void
}

export default function LeadDetailPanel({
  lead, defaultStage, onClose, onUpdated, onCreated, onDeleted
}: LeadDetailPanelProps) {
  const isNew = !lead
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [stageMenuOpen, setStageMenuOpen] = useState(false)
  const [localStage, setLocalStage] = useState(lead?.stage ?? (defaultStage as Lead['stage']) ?? 'new')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('stage', localStage)

    startTransition(async () => {
      if (isNew) {
        const result = await createLead(fd)
        if ('error' in result) { setError('Check required fields'); return }
        // optimistic: close and let parent refresh
        onClose()
        window.location.reload()
      } else {
        const data: Record<string, any> = {
          companyName:    fd.get('companyName') as string,
          contactName:    fd.get('contactName') as string,
          contactEmail:   fd.get('contactEmail') as string,
          contactPhone:   fd.get('contactPhone') as string || undefined,
          country:        fd.get('country') as string || undefined,
          industry:       fd.get('industry') as string || undefined,
          estimatedValue: fd.get('estimatedValue') ? Number(fd.get('estimatedValue')) : undefined,
          probability:    fd.get('probability') ? Number(fd.get('probability')) : undefined,
          source:         fd.get('source') as string || undefined,
          notes:          fd.get('notes') as string || undefined,
          nextAction:     fd.get('nextAction') as string || undefined,
          nextActionDate: fd.get('nextActionDate') ? new Date(fd.get('nextActionDate') as string) : undefined,
          stage:          localStage,
        }
        const result = await updateLead(lead.id, data)
        if ('error' in result) { setError('Save failed'); return }
        onUpdated({ ...lead, ...data })
      }
    })
  }

  async function handleStageChange(newStage: Lead['stage']) {
    setLocalStage(newStage)
    setStageMenuOpen(false)
    if (!isNew && lead) {
      startTransition(async () => {
        await updateLeadStage(lead.id, newStage)
        onUpdated({ ...lead, stage: newStage })
      })
    }
  }

  async function handleDelete() {
    if (!lead) return
    startTransition(async () => {
      await deleteLead(lead.id)
      onDeleted(lead.id)
    })
  }

  const stageColor = STAGE_COLORS[localStage]

  return (
    <div
      className="fixed inset-y-0 right-0 w-[420px] z-40 flex flex-col"
      style={{ background: '#111114', borderLeft: '1px solid #1E1E24', boxShadow: '-20px 0 60px rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #1E1E24' }}
      >
        <h2 className="font-display font-semibold text-mx-light text-sm">
          {isNew ? 'New Lead' : lead.companyName}
        </h2>
        <button onClick={onClose} className="p-1.5 rounded hover:bg-mx-muted transition-colors">
          <X size={14} className="text-mx-mid" />
        </button>
      </div>

      {/* Stage selector */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #1E1E24' }}>
        <p className="text-2xs text-mx-mid mb-2 uppercase tracking-wider">Stage</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setStageMenuOpen(!stageMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md w-full text-left transition-colors"
            style={{ background: `${stageColor}15`, border: `1px solid ${stageColor}40` }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stageColor }} />
            <span className="text-xs font-semibold flex-1" style={{ color: stageColor }}>
              {PIPELINE_STAGES.find(s => s.id === localStage)?.label ?? localStage}
            </span>
            <ChevronDown size={12} style={{ color: stageColor }} />
          </button>
          {stageMenuOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-md z-50 overflow-hidden"
              style={{ background: '#1E1E24', border: '1px solid #2A2A32' }}
            >
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStageChange(s.id as Lead['stage'])}
                  className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-mx-muted transition-colors"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs text-mx-dim">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Company *</label>
            <input
              name="companyName"
              className="mx-input"
              defaultValue={lead?.companyName}
              placeholder="Acme GmbH"
              required
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Contact Name *</label>
            <input
              name="contactName"
              className="mx-input"
              defaultValue={lead?.contactName}
              placeholder="Klaus Müller"
              required
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Country</label>
            <input
              name="country"
              className="mx-input"
              defaultValue={lead?.country ?? ''}
              placeholder="DE"
            />
          </div>
          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Email *</label>
            <input
              name="contactEmail"
              type="email"
              className="mx-input"
              defaultValue={lead?.contactEmail}
              placeholder="k.muller@acme.de"
              required
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Phone</label>
            <input
              name="contactPhone"
              className="mx-input"
              defaultValue={lead?.contactPhone ?? ''}
              placeholder="+49 123 456"
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Est. Value (EUR)</label>
            <input
              name="estimatedValue"
              type="number"
              className="mx-input font-mono"
              defaultValue={lead?.estimatedValue ?? ''}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Probability %</label>
            <input
              name="probability"
              type="number"
              min="0"
              max="100"
              className="mx-input font-mono"
              defaultValue={lead?.probability ?? 20}
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Industry</label>
            <select name="industry" className="mx-input" defaultValue={lead?.industry ?? ''}>
              <option value="">Select…</option>
              <option>CNC machine builder</option>
              <option>Industrial automation</option>
              <option>Equipment manufacturer</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Source</label>
            <select name="source" className="mx-input" defaultValue={lead?.source ?? ''}>
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
            <input
              name="nextAction"
              className="mx-input"
              defaultValue={lead?.nextAction ?? ''}
              placeholder="Discovery call"
            />
          </div>
          <div>
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Action Date</label>
            <input
              name="nextActionDate"
              type="date"
              className="mx-input"
              defaultValue={lead?.nextActionDate ? formatDate(lead.nextActionDate, 'yyyy-MM-dd') : ''}
            />
          </div>
          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Notes</label>
            <textarea
              name="notes"
              className="mx-input resize-none"
              rows={3}
              defaultValue={lead?.notes ?? ''}
              placeholder="Context, requirements, how they found us…"
            />
          </div>
        </div>

        {error && <p className="text-xs text-mx-red">{error}</p>}

        {/* Meta info for existing leads */}
        {!isNew && lead && (
          <div className="pt-2" style={{ borderTop: '1px solid #1E1E24' }}>
            <p className="text-2xs text-mx-subtle">
              Created {formatDate(lead.createdAt!, 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </form>

      {/* Footer actions */}
      <div
        className="px-5 py-4 flex items-center gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid #1E1E24' }}
      >
        {!isNew && !confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="btn btn-danger p-2"
            title="Delete lead"
          >
            <Trash2 size={14} />
          </button>
        )}
        {confirmDelete && (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-mx-red flex-1">Delete this lead?</span>
            <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost text-xs py-1.5 px-3">No</button>
            <button onClick={handleDelete} disabled={isPending} className="btn btn-danger text-xs py-1.5 px-3">
              {isPending ? '…' : 'Yes, delete'}
            </button>
          </div>
        )}
        {!confirmDelete && (
          <>
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button
              form=""
              type="submit"
              disabled={isPending}
              onClick={(e) => {
                const form = e.currentTarget.closest('.flex')?.parentElement?.querySelector('form')
                form?.requestSubmit()
              }}
              className="btn btn-primary flex-1"
            >
              <Save size={13} />
              {isPending ? 'Saving…' : isNew ? 'Create Lead' : 'Save'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
