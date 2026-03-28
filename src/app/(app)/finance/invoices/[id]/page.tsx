import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getInvoice } from '@/lib/db/queries'
import PageHeader from '@/components/layout/PageHeader'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import InvoiceActions from '@/components/finance/InvoiceActions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Invoice' }
export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth()
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) notFound()

  const subtotal = invoice.lineItems.reduce((s, li) => s + li.total, 0)

  return (
    <div className="animate-in">
      <PageHeader
        title={invoice.number}
        subtitle={`${invoice.client?.companyName} · ${invoice.title}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/finance" className="btn btn-ghost">
              <ArrowLeft size={14} /> Back
            </Link>
            <StatusBadge status={invoice.status} />
            <InvoiceActions invoice={{
              id:        invoice.id,
              number:    invoice.number,
              title:     invoice.title,
              status:    invoice.status,
              issueDate: invoice.issueDate,
              dueDate:   invoice.dueDate,
              currency:  invoice.currency ?? 'EUR',
              subtotal:  invoice.subtotal,
              tax:       invoice.tax ?? 0,
              total:     invoice.total,
              notes:     invoice.notes ?? undefined,
              terms:     invoice.terms ?? undefined,
              client: {
                companyName:   invoice.client?.companyName ?? '',
                contactName:   invoice.client?.contactName ?? '',
                contactEmail:  invoice.client?.contactEmail ?? '',
                billingAddress: invoice.client?.billingAddress ?? undefined,
                vatNumber:     invoice.client?.vatNumber ?? undefined,
              },
              lineItems: invoice.lineItems.map(li => ({
                description: li.description,
                quantity:    li.quantity,
                unit:        li.unit ?? 'hours',
                unitPrice:   li.unitPrice,
                total:       li.total,
              })),
            }} />
          </div>
        }
      />

      {/* Invoice preview */}
      <div className="px-8 py-6">
        <div className="max-w-3xl">
          <div className="card p-8">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-mx-white">MECHANIXER</h2>
                <p className="text-xs text-mx-mid mt-1">Engineering Design Studio</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mx-mid uppercase tracking-wider mb-0.5">Invoice</p>
                <p className="font-display text-lg font-bold text-mx-white">{invoice.number}</p>
              </div>
            </div>

            {/* Accent line */}
            <div className="accent-bar mb-8" />

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-2xs text-mx-mid uppercase tracking-wider mb-2">From</p>
                <p className="text-xs text-mx-light font-medium">Mechanixer Engineering Studio</p>
                <p className="text-xs text-mx-dim">blagoj@mechanixer.com</p>
                <p className="text-xs text-mx-dim">mechanixer.com</p>
              </div>
              <div>
                <p className="text-2xs text-mx-mid uppercase tracking-wider mb-2">To</p>
                <p className="text-xs text-mx-light font-medium">{invoice.client?.companyName}</p>
                <p className="text-xs text-mx-dim">{invoice.client?.contactName}</p>
                <p className="text-xs text-mx-dim">{invoice.client?.contactEmail}</p>
                {invoice.client?.billingAddress && (
                  <p className="text-xs text-mx-dim">{invoice.client.billingAddress}</p>
                )}
                {invoice.client?.vatNumber && (
                  <p className="text-xs text-mx-dim">VAT: {invoice.client.vatNumber}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-8 mb-8">
              <div>
                <p className="text-2xs text-mx-mid uppercase tracking-wider mb-1">Issue Date</p>
                <p className="text-xs text-mx-light font-mono">{formatDate(invoice.issueDate, 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-2xs text-mx-mid uppercase tracking-wider mb-1">Due Date</p>
                <p className="text-xs text-mx-light font-mono">{formatDate(invoice.dueDate, 'MMMM d, yyyy')}</p>
              </div>
              {invoice.paidDate && (
                <div>
                  <p className="text-2xs text-mx-mid uppercase tracking-wider mb-1">Paid Date</p>
                  <p className="text-xs text-mx-green font-mono">{formatDate(invoice.paidDate, 'MMMM d, yyyy')}</p>
                </div>
              )}
            </div>

            {/* Line items */}
            <table className="mx-table mb-6">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right w-16">Qty</th>
                  <th className="w-16">Unit</th>
                  <th className="text-right w-28">Unit Price</th>
                  <th className="text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map(li => (
                  <tr key={li.id}>
                    <td className="text-mx-light">{li.description}</td>
                    <td className="text-right font-mono">{li.quantity}</td>
                    <td className="text-mx-dim">{li.unit}</td>
                    <td className="text-right font-mono">{formatCurrency(li.unitPrice, invoice.currency ?? 'EUR')}</td>
                    <td className="text-right font-mono font-semibold text-mx-light">
                      {formatCurrency(li.total, invoice.currency ?? 'EUR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-mx-mid">Subtotal</span>
                  <span className="font-mono text-mx-light">{formatCurrency(subtotal, invoice.currency ?? 'EUR')}</span>
                </div>
                {(invoice.tax ?? 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-mx-mid">Tax</span>
                    <span className="font-mono text-mx-light">{formatCurrency(invoice.tax ?? 0, invoice.currency ?? 'EUR')}</span>
                  </div>
                )}
                <div className="divider" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-mx-light">Total</span>
                  <span className="font-display text-xl font-bold text-mx-accent">
                    {formatCurrency(invoice.total, invoice.currency ?? 'EUR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes + terms */}
            {(invoice.notes || invoice.terms) && (
              <>
                <div className="divider mt-8" />
                <div className="grid grid-cols-2 gap-6">
                  {invoice.notes && (
                    <div>
                      <p className="text-2xs text-mx-mid uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-xs text-mx-dim leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-2xs text-mx-mid uppercase tracking-wider mb-1">Payment Terms</p>
                      <p className="text-xs text-mx-dim leading-relaxed">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
