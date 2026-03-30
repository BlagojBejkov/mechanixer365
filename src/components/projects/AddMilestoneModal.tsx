'use client'
import { useRef, useState, useTransition } from 'react'
import { X, Plus } from 'lucide-react'
import { createMilestone } from '@/lib/actions/projects'

export default function AddMilestoneModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const name = formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.value || ''
  const dueDateStr = formRef.current?.querySelector<HTMLInputElement>('input[name="dueDate"]')?.value
  startTransition(async () => {
    await createMilestone({
      projectId,
      name,
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
    })
    setOpen(false)
  })
}

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary flex items-center gap-1.5 text-xs"
      >
        <Plus size={14} /> Add Milestone
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mx-text">New Milestone</h3>
              <button onClick={() => setOpen(false)} className="text-mx-dim hover:text-mx-text">
                <X size={16} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-2xs text-mx-mid mb-1 block">Milestone Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Design Review"
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-2xs text-mx-mid mb-1 block">Due Date (optional)</label>
                <input
                  name="dueDate"
                  type="date"
                  className="input w-full"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="btn-primary flex-1 text-xs"
                >
                  {pending ? 'Creating…' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}