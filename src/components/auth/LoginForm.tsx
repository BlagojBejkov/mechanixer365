'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/lib/actions/auth'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const result = await loginAction(fd)

    setLoading(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">
          Email
        </label>
        <input
          name="email"
          type="email"
          className="mx-input"
          placeholder="you@mechanixer.com"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="mx-input pr-10"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mx-subtle hover:text-mx-mid transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="px-3 py-2 rounded text-xs text-mx-red"
          style={{ background: '#EF444410', border: '1px solid #EF444430' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full justify-center mt-2"
        style={{ padding: '10px 16px', fontSize: '13px' }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn size={14} />
            Sign In
          </span>
        )}
      </button>
    </form>
  )
}
