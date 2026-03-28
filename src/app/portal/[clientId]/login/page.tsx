'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalLoginPage({ params }: { params: { clientId: string } }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(`/api/portal/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: params.clientId, password }),
    })
    const data = await res.json()
    if (res.ok && data.ok) {
      router.push(`/portal/${params.clientId}`)
      router.refresh()
    } else {
      setError(data.error ?? 'Invalid password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0A0A0B' }}>
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ background: '#3D8EF015', border: '1px solid #3D8EF030' }}>
            <span className="font-bold text-lg" style={{ color: '#3D8EF0' }}>M</span>
          </div>
          <h1 className="font-display text-lg font-bold text-mx-white">Client Portal</h1>
          <p className="text-mx-mid text-xs mt-1">Mechanixer Engineering Studio</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <p className="text-xs text-mx-mid text-center mb-5">Enter your portal password to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-mx-mid mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-mx-red text-center">{error}</p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Checking…' : 'Access Portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-2xs text-mx-subtle mt-4">
          Need access? Contact <span style={{ color: '#3D8EF0' }}>blagoj@mechanixer.com</span>
        </p>
      </div>
    </div>
  )
}
