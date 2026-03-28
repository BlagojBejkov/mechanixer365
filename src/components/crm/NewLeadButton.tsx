'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import LeadDetailPanel from './LeadDetailPanel'
import type { Lead } from '@/lib/db/schema'

export default function NewLeadButton() {
  const [open, setOpen] = useState(false)

  function handleCreated(lead: Lead) {
    setOpen(false)
    window.location.reload()
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={14} />
        New Lead
      </button>
      {open && (
        <LeadDetailPanel
          lead={null}
          defaultStage="new"
          onClose={() => setOpen(false)}
          onUpdated={() => {}}
          onCreated={handleCreated}
          onDeleted={() => {}}
        />
      )}
    </>
  )
}
