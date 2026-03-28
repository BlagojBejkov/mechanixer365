import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import { Zap } from 'lucide-react'

export const metadata: Metadata = { title: 'Sign In · Mechanixer 365' }

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0A0B' }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(61,142,240,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,142,240,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Accent glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(61,142,240,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm px-6 animate-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #1a2a3a 0%, #0d1a2a 100%)',
              border: '1px solid #3D8EF040',
              boxShadow: '0 0 30px rgba(61,142,240,0.1)',
            }}
          >
            <Zap size={22} className="text-mx-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-mx-white tracking-tight">
            Mechanixer 365
          </h1>
          <p className="text-mx-mid text-sm mt-1">Internal operations system</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: '#111114',
            border: '1px solid #1E1E24',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-mx-accent/40 to-transparent rounded-full" />

          <p className="text-xs text-mx-mid mb-5 text-center">Sign in to your account</p>
          <LoginForm />
        </div>

        <p className="text-center text-2xs text-mx-subtle mt-6">
          Private system · Mechanixer Engineering Studio
        </p>
      </div>
    </div>
  )
}
