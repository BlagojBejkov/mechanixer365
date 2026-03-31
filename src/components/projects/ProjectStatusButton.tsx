'use client'
import { useState, useTransition } from 'react'
import { updateProjectStatus } from '@/lib/actions/projects'
import { useRouter } from 'next/navigation'

type ProjectStatus = 'scoping' | 'active' | 'on_hold' | 'review' | 'completed' | 'cancelled'

const STATUS_CYCLE: ProjectStatus[] = ['scoping', 'active', 'on_hold', 'review', 'completed', 'cancelled']
const STATUS_CFG: Record<string, { bg: string; text: string; label: string }> = {
  scoping:   { bg: '#1A1A2E', text: '#A78BFA', label: 'SCOPING' },
  active:    { bg: '#0A2818', text: '#22C55E', label: 'ACTIVE' },
  on_hold:   { bg: '#1E1A10', text: '#F59E0B', label: 'ON HOLD' },
  review:    { bg: '#111827', text: '#3D8EF0', label: 'REVIEW' },
  completed: { bg: '#0D1F0D', text: '#16A34A', label: 'COMPLETED' },
  cancelled: { bg: '#1A0A0A', text: '#EF4444', label: 'CANCELLED' },
}

export default function ProjectStatusButton({
  projectId,
  initialStatus,
}: {
  projectId: string
  initialStatus: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['active']

  function changeStatus(next: ProjectStatus) {
    setOpen(false)
    setStatus(next)
    startTransition(async () => {
      await updateProjectStatus(projectId, next)
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={isPending}
        className="px-3 py-1.5 rounded text-xs font-bold tracking-wider border transition-all hover:opacity-80 cursor-pointer"
        style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.text + '40', opacity: isPending ? 0.6 : 1 }}
        title="Click to change status"
      >
        {cfg.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 card py-1 min-w-[150px] shadow-xl">
            {STATUS_CYCLE.map(s => {
              const c = STATUS_CFG[s]
              return (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-mx-muted transition-colors flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.text }} />
                  <span style={{ color: s === status ? c.text : undefined, fontWeight: s === status ? 600 : undefined }}>
                    {c.label}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
