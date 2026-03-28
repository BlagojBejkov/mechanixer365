import { requireAuth } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  return (
    <AppShell user={{
      name:  session.user.name,
      email: session.user.email,
      role:  session.user.role,
    }}>
      {children}
    </AppShell>
  )
}
