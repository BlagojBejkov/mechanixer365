'use client'

import { useState } from 'react'
import { Timer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LogTimeModal from './LogTimeModal'

interface LogTimeButtonProps {
  projectId: string
  projectName: string
}

export default function LogTimeButton({ projectId, projectName }: LogTimeButtonProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    // Refresh the page server data so Recent Time list updates
    router.refresh()
  }

  return (
    <>
      <button
        className="btn btn-ghost text-xs"
        onClick={() => setOpen(true)}
      >
        <Timer size={14} /> Log Time
      </button>

      {open && (
        <LogTimeModal
          projectId={projectId}
          projectName={projectName}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
