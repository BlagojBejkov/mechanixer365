'use client'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, X, FileText } from 'lucide-react'

interface UploadedFile { id: string; name: string; url: string; size: number }

export default function FileUploadButton({
  projectId,
  onUpload,
}: {
  projectId: string
  onUpload?: (file: UploadedFile) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setDone('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('projectId', projectId)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Upload failed')
      } else {
        setDone(file.name)
        onUpload?.({ id: data.id, name: data.name, url: data.url, size: data.size })
        router.refresh()
        setTimeout(() => setDone(''), 3000)
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-2xs text-mx-accent hover:underline flex items-center gap-1 disabled:opacity-50"
      >
        {uploading ? (
          <span className="text-mx-mid animate-pulse">Uploading...</span>
        ) : done ? (
          <><Check size={11} className="text-green-400" /><span className="text-green-400">Uploaded</span></>
        ) : (
          <><Upload size={11} />Upload</>
        )}
      </button>
      {error && (
        <span className="text-2xs text-red-400 flex items-center gap-1">
          <X size={10} />{error}
        </span>
      )}
    </div>
  )
}
