import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import CRMBoard from '@/components/crm/CRMBoard'
import CRMStats from '@/components/crm/CRMStats'
import NewLeadButton from '@/components/crm/NewLeadButton'
import { getLeads } from '@/lib/db/queries'
import { PIPELINE_STAGES } from '@/lib/constants'

export const metadata: Metadata = { title: 'CRM' }
export const dynamic = 'force-dynamic'

export default async function CRMPage() {
  const leads = await getLeads()

  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage))
  const totalPipeline = activeLeads.reduce((s, l) => s + (l.estimatedValue ?? 0), 0)
  const weighted = activeLeads.reduce((s, l) => s + ((l.estimatedValue ?? 0) * (l.probability ?? 50) / 100), 0)

  return (
    <div className="h-full flex flex-col animate-in">
      <PageHeader
        title="CRM"
        subtitle="Sales pipeline & lead management"
        actions={<NewLeadButton />}
      />
      <CRMStats
        totalPipeline={totalPipeline}
        weighted={weighted}
        activeCount={activeLeads.length}
        wonThisMonth={leads.filter(l => l.stage === 'won').length}
      />
      <div className="flex-1 overflow-auto px-8 py-6">
        <CRMBoard leads={leads} stages={PIPELINE_STAGES} />
      </div>
    </div>
  )
}
