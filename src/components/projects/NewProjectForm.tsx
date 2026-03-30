'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions/projects'

export default function NewProjectForm({
  clients,
  engineers,
}: {
  clients: { id: string; name: string }[]
  engineers: { id: string; name: string }[]
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const formData = new FormData(formRef.current!)
    startTransition(async () => {
      try {
        const result = await createProject(formData)
        if (result?.id) router.push(`/projects/${result.id}`)
        else setError('Failed to create project')
      } catch (err: any) {
        setError(err.message || 'Failed to create project')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-mx-text">New Project</h1>
        <p className="text-xs text-mx-dim mt-1">Create a new engineering project</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1 block">Project Name *</label>
            <input name="name" required placeholder="e.g. CNC Frame Redesign" className="input w-full" />
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">Client *</label>
            <select name="clientId" required className="input w-full">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">Lead Engineer</label>
            <select name="leadEngineerId" className="input w-full">
              <option value="">Unassigned</option>
              {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">Type</label>
            <select name="type" className="input w-full">
              <option value="fixed_price">Fixed Price</option>
              <option value="time_and_materials">Time &amp; Materials</option>
              <option value="retainer">Retainer</option>
            </select>
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">Budget (€)</label>
            <input name="budget" type="number" min="0" placeholder="0" className="input w-full" />
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">Start Date</label>
            <input name="startDate" type="date" className="input w-full" />
          </div>

          <div>
            <label className="text-2xs text-mx-mid mb-1 block">End Date</label>
            <input name="endDate" type="date" className="input w-full" />
          </div>

          <div className="col-span-2">
            <label className="text-2xs text-mx-mid mb-1 block">Description</label>
            <textarea name="description" rows={3} placeholder="Project scope and objectives…" className="input w-full resize-none" />
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn-primary flex-1">
            {pending ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
