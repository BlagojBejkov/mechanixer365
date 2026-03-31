import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import SettingsForm from '@/components/settings/SettingsForm'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAuth()
  const team = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  }).from(users).orderBy(users.createdAt)

  return (
    <div className="animate-in">
      <PageHeader title="Settings" subtitle="Company, team & billing configuration" />
      <div className="px-8 py-6 max-w-2xl">
        <SettingsForm team={team} />
      </div>
    </div>
  )
}
