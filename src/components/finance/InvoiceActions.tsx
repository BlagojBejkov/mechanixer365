'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileDown, Send, CheckCircle2, ChevronDown } from 'lucide-react'
import { markInvoiceSent, markInvoicePaid } from '@/lib/actions/finance'
import { generateInvoicePDF } from '@/lib/utils/pdf'

interface InvoiceData {
  id: string
  number: string
  title: string
  status: string
  issueDate: Date
  dueDate: Date
  currency: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  terms?: string
  client: {
    companyName: string
    contactName: string
    contactEmail: string
    billingAddress?: string
    vatNumber?: string
  }
  lineItems: {
    description: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }[]
}

export default function InvoiceActions({ invoice }: { invoice: InvoiceData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleExportPDF() {
    generateInvoicePDF({
      number:    invoice.number,
      title:     invoice.title,
      issueDate: new Date(invoice.issueDate),
      dueDate:   new Date(invoice.dueDate),
      client:    invoice.client,
      lineItems: invoice.lineItems,
      subtotal:  invoice.subtotal,
      tax:       invoice.tax,
      total:     invoice.total,
      notes:     invoice.notes,
      terms:     invoice.terms,
      currency:  invoice.currency,
    })
    setMenuOpen(false)
  }

  async function handleMarkSent() {
    setMenuOpen(false)
    startTransition(async () => {
      await markInvoiceSent(invoice.id)
      router.refresh()
    })
  }

  async function handleMarkPaid() {
    setMenuOpen(false)
    startTransition(async () => {
      await markInvoicePaid(invoice.id)
      router.refresh()
    })
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* PDF export — always available */}
      <button
        onClick={handleExportPDF}
        className="btn btn-ghost text-xs"
        title="Export as PDF"
      >
        <FileDown size={14} />
        Export PDF
      </button>

      {/* Status actions dropdown */}
      {invoice.status !== 'paid' && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            disabled={isPending}
            className="btn btn-primary text-xs"
          >
            {isPending ? 'Updating…' : 'Actions'}
            <ChevronDown size={12} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-md z-40 overflow-hidden"
                style={{ background: '#1E1E24', border: '1px solid #2A2A32' }}
              >
                {invoice.status === 'draft' && (
                  <button
                    onClick={handleMarkSent}
                    className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-mx-muted text-xs text-mx-dim transition-colors"
                  >
                    <Send size={13} className="text-mx-accent" />
                    Mark as Sent
                  </button>
                )}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <button
                    onClick={handleMarkPaid}
                    className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-mx-muted text-xs text-mx-dim transition-colors"
                  >
                    <CheckCircle2 size={13} className="text-mx-green" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {invoice.status === 'paid' && (
        <button onClick={handleExportPDF} className="btn btn-ghost text-xs">
          <CheckCircle2 size={14} className="text-mx-green" />
          Paid
        </button>
      )}
    </div>
  )
}
