import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { getClients } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import NewInvoiceForm from '@/components/finance/NewInvoiceForm'

export const metadata: Metadata = { title: 'New Invoice' }
export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
  await requireAuth()

  const clients = await getClients()
  const activeProjects = await db.query.projects.findMany({
    where: eq(projects.status, 'active'),
    with: { client: true },
  })

  return (
    <NewInvoiceForm
      clients={clients.map(c => ({ id: c.id, name: c.companyName, currency: c.currency ?? 'EUR' }))}
      projects={activeProjects.map(p => ({
        id: p.id,
        name: p.name,
        clientId: p.clientId,
        clientName: p.client?.companyName ?? '',
        hourlyRate: p.hourlyRate ?? 80,
      }))}
    />
  )
}
