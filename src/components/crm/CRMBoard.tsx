'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { updateLeadStage } from '@/lib/actions/leads'
import { Calendar, Plus, ChevronDown } from 'lucide-react'
import type { Lead } from '@/lib/db/schema'
import type { PIPELINE_STAGES } from '@/lib/constants'
import LeadDetailPanel from './LeadDetailPanel'

interface CRMBoardProps {
  leads: Lead[]
  stages: typeof PIPELINE_STAGES
}

const STAGE_COLORS: Record<string, string> = {
  new:           '#6B6B7A',
  qualified:     '#3D8EF0',
  proposal_sent: '#F59E0B',
  negotiation:   '#8B5CF6',
  won:           '#22C55E',
  lost:          '#EF4444',
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [stage, setStage] = useState(lead.stage)
  const color = STAGE_COLORS[stage]

  return (
    <div
      onClick={onClick}
      className="card-elevated p-3.5 cursor-pointer hover:border-mx-subtle transition-all group"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-mx-light group-hover:text-mx-white transition-colors truncate">
            {lead.companyName}
          </p>
          <p className="text-2xs text-mx-mid mt-0.5">
            {lead.country && `${lead.country} · `}{lead.contactName}
          </p>
        </div>
        <span className="font-mono text-xs text-mx-light flex-shrink-0">
          {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '—'}
        </span>
      </div>

      {/* Probability bar */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex-1 h-0.5 rounded-full" style={{ background: '#2A2A32' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${lead.probability ?? 50}%`, background: color }}
          />
        </div>
        <span className="font-mono text-2xs text-mx-mid">{lead.probability ?? 50}%</span>
      </div>

      {/* Next action */}
      {lead.nextAction && (
        <div
          className="flex items-center gap-1.5 pt-2"
          style={{ borderTop: '1px solid #1E1E24' }}
        >
          <Calendar size={10} className="text-mx-subtle flex-shrink-0" />
          <p className="text-2xs text-mx-mid truncate flex-1">{lead.nextAction}</p>
          {lead.nextActionDate && (
            <span className="text-2xs text-mx-subtle flex-shrink-0">
              {formatDate(lead.nextActionDate, 'MMM d')}
            </span>
          )}
        </div>
      )}

      {/* Industry tag */}
      {lead.industry && (
        <div className="mt-2">
          <span className="text-2xs px-1.5 py-0.5 rounded" style={{ background: '#1E1E24', color: '#6B6B7A' }}>
            {lead.industry}
          </span>
        </div>
      )}
    </div>
  )
}

function PipelineColumn({
  stage,
  leads,
  onLeadClick,
  onAddLead,
}: {
  stage: typeof PIPELINE_STAGES[number]
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
  onAddLead: (stage: string) => void
}) {
  const total = leads.reduce((s, l) => s + (l.estimatedValue ?? 0), 0)

  return (
    <div className="flex-1 min-w-[220px] max-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: stage.color }} />
          <span className="text-xs font-semibold text-mx-light">{stage.label}</span>
          <span
            className="text-2xs px-1.5 py-0.5 rounded font-mono"
            style={{ background: '#1E1E24', color: '#6B6B7A' }}
          >
            {leads.length}
          </span>
        </div>
        {leads.length > 0 && (
          <span className="font-mono text-2xs text-mx-mid">{formatCurrency(total)}</span>
        )}
      </div>

      <div className="space-y-2">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
        ))}
        <button
          onClick={() => onAddLead(stage.id)}
          className="w-full p-2.5 rounded-md text-2xs text-mx-subtle hover:text-mx-mid transition-colors flex items-center justify-center gap-1.5"
          style={{ border: '1px dashed #2A2A32' }}
        >
          <Plus size={11} />
          Add lead
        </button>
      </div>
    </div>
  )
}

export default function CRMBoard({ leads, stages }: CRMBoardProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [newLeadStage, setNewLeadStage] = useState<string | null>(null)
  const [localLeads, setLocalLeads] = useState(leads)

  const activeStages = stages.filter(s => !['won', 'lost'].includes(s.id))

  function handleLeadClick(lead: Lead) {
    setSelectedLead(lead)
  }

  function handleAddLead(stage: string) {
    setNewLeadStage(stage)
    setSelectedLead(null)
  }

  function handleLeadUpdated(updated: Lead) {
    setLocalLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelectedLead(updated)
  }

  function handleLeadCreated(newLead: Lead) {
    setLocalLeads(prev => [newLead, ...prev])
    setNewLeadStage(null)
  }

  function handleLeadDeleted(id: string) {
    setLocalLeads(prev => prev.filter(l => l.id !== id))
    setSelectedLead(null)
  }

  return (
    <div className="flex gap-4 h-full min-w-max">
      {activeStages.map(stage => (
        <PipelineColumn
          key={stage.id}
          stage={stage}
          leads={localLeads.filter(l => l.stage === stage.id)}
          onLeadClick={handleLeadClick}
          onAddLead={handleAddLead}
        />
      ))}

      {/* Lead detail / new lead panel */}
      {(selectedLead || newLeadStage) && (
        <LeadDetailPanel
          lead={selectedLead}
          defaultStage={newLeadStage ?? undefined}
          onClose={() => { setSelectedLead(null); setNewLeadStage(null) }}
          onUpdated={handleLeadUpdated}
          onCreated={handleLeadCreated}
          onDeleted={handleLeadDeleted}
        />
      )}
    </div>
  )
}
