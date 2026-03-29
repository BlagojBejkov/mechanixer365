'use client'
import { useRef, useState, useTransition } from 'react'
import { X, Plus } from 'lucide-react'
import { createTask } from '@/lib/actions/projects'

const ENGINEERS = [
  { id: 'usr_blagoj', name: 'Blagoj' },
  { id: 'usr_tomche', name: 'Tomche' },
  { id: 'usr_katerina', name: 'Katerina' },
]

export default function AddTaskModal({
  projectId,
  milestoneId,
}: {
  projectId: string
  milestoneId: string
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    startTransition(async () => {
      await createTask(projectId, milestoneId, formData)
      formRef.current?.reset()
      setOpen(false)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-2xs text-mx-accent hover:text-mx-text transition-colors"
      >
        <Plus size={12} /> Add Task
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mx-text">New Task</h3>
              <button onClick={() => setOpen(false)} className="text-mx-dim hover:text-mx-text">
                <X size={16} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-2xs text-mx-mid mb-1 block">Task Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Create CAD drawing"
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-2xs text-mx-mid mb-1 block">Assignee (optional)</label>
                <select name="assignedTo" className="input w-full">
                  <option value="">Unassigned</option>
                  {ENGINEERS.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="btn-primary flex-1 text-xs">
                  {pending ? 'Adding…' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}