import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getInvoices } from '@/lib/db/queries'
import { requireAuth } from '@/lib/auth'
import { Plus, Receipt, TrendingUp, AlertCircle, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Finance' }
export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  await requireAuth()
  const invoices = await getInvoices()
  const now = new Date()

  // Enrich with effective status
  const enriched = invoices.map(inv => ({
    ...inv,
    effectiveStatus: (inv.status === 'sent' && inv.dueDate && new Date(inv.dueDate) < now
      ? 'overdue'
      : inv.status) as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  }))

  const outstanding  = enriched.filter(i => i.effectiveStatus === 'sent').reduce((s, i) => s + i.total, 0)
  const overdue      = enriched.filter(i => i.effectiveStatus === 'overdue').reduce((s, i) => s + i.total, 0)
  const overdueCount = enriched.filter(i => i.effectiveStatus === 'overdue').length

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const paidThisMonth = enriched
    .filter(i => i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= monthStart)
    .reduce((s, i) => s + i.total, 0)

  return (
    <div className="animate-in">
      <PageHeader
        title="Finance"
        subtitle="Invoices, quotes & payment tracking"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost">
              <FileText size={14} /> New Quote
            </button>
            <Link href="/finance/invoices/new" className="btn btn-primary">
              <Plus size={14} /> New Invoice
            </Link>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Outstanding"    value={formatCurrency(outstanding)}  sub="Awaiting payment"                                  icon={Receipt}      accent />
          <StatCard label="Overdue"        value={formatCurrency(overdue)}      sub={`${overdueCount} invoice${overdueCount !== 1 ? 's' : ''} past due`} icon={AlertCircle} />
          <StatCard label="Paid This Month" value={formatCurrency(paidThisMonth)}                                                       icon={CheckCircle2} />
          <StatCard label="Total Invoiced" value={formatCurrency(invoices.reduce((s, i) => s + i.total, 0))} sub={`${invoices.length} invoices`} icon={TrendingUp} />
        </div>

        <div className="card overflow-hidden">
          <div className="section-header px-5 pt-5 pb-0">
            <span className="section-title">Invoices</span>
          </div>
          {enriched.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-mx-subtle text-sm">No invoices yet.</p>
              <Link href="/finance/invoices/new" className="btn btn-primary mt-4 inline-flex">
                <Plus size={14} /> Create First Invoice
              </Link>
            </div>
          ) : (
            <table className="mx-table mt-3">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enriched.map(inv => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-mx-accent">{inv.number}</td>
                    <td className="font-medium text-mx-light">{inv.client?.companyName}</td>
                    <td className="text-mx-dim">{inv.project?.name ?? '—'}</td>
                    <td className="font-mono font-semibold text-mx-light">{formatCurrency(inv.total)}</td>
                    <td className="font-mono text-xs text-mx-dim">{formatDate(inv.issueDate, 'MMM d')}</td>
                    <td className={`font-mono text-xs ${inv.effectiveStatus === 'overdue' ? 'text-mx-red' : 'text-mx-dim'}`}>
                      {formatDate(inv.dueDate, 'MMM d')}
                    </td>
                    <td><StatusBadge status={inv.effectiveStatus} /></td>
                    <td>
                      <Link href={`/finance/invoices/${inv.id}`} className="btn btn-ghost py-1 px-2 text-2xs">
                        <ArrowUpRight size={12} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {overdueCount > 0 && (
          <div className="p-4 rounded-lg flex items-center gap-4" style={{ background: '#EF444408', border: '1px solid #EF444420' }}>
            <AlertCircle size={16} className="text-mx-red flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-mx-red">
                {overdueCount} invoice{overdueCount !== 1 ? 's are' : ' is'} overdue
              </p>
              <p className="text-xs text-mx-mid mt-0.5">Send a payment reminder to your clients.</p>
            </div>
            <button className="btn btn-ghost text-xs" style={{ color: '#EF4444', borderColor: '#EF444430' }}>
              Send Reminders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
