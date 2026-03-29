'use client'

import { useState } from 'react'
import { Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SendRemindersButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null)

  async function handleSend() {
    setState('loading')
    try {
      const res = await fetch('/api/cron/overdue')
      const data = await res.json()
      if (res.ok) {
        setResult({ sent: data.sent ?? 0, total: data.total ?? 0 })
        setState('done')
        // Reset after 5s
        setTimeout(() => setState('idle'), 5000)
      } else {
        setState('error')
        setTimeout(() => setState('idle'), 4000)
      }
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  if (state === 'done') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#22C55E' }}>
        <CheckCircle2 size={13} />
        {result?.sent === 0
          ? 'No emails to send'
          : `${result?.sent} reminder${result?.sent !== 1 ? 's' : ''} sent`}
      </span>
    )
  }

  if (state === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#EF4444' }}>
        <AlertCircle size={13} />
        Failed to send
      </span>
    )
  }

  return (
    <button
      onClick={handleSend}
      disabled={state === 'loading'}
      className="btn btn-ghost text-xs"
      style={{ color: '#EF4444', borderColor: '#EF444430' }}
    >
      {state === 'loading'
        ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
        : <><Bell size={13} /> Send Reminders</>
      }
    </button>
  )
}
