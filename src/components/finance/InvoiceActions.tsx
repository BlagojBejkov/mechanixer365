'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileDown, Send, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { markInvoiceSent, markInvoicePaid } from '@/lib/actions/finance'

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
  const [pdfLoading, setPdfLoading] = useState(false)

  async function handleExportPDF() {
    setMenuOpen(false)
    setPdfLoading(true)
    try {
      const { generateInvoicePDF } = await import('@/lib/utils/pdf')
      await generateInvoicePDF({
        number: invoice.number,
        title: invoice.title,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        client: invoice.client,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        notes: invoice.notes,
        terms: invoice.terms,
        currency: invoice.currency,
      })
    } finally {
      setPdfLoading(false)
    }
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
      <button
        onClick={handleExportPDF}
        disabled={pdfLoading}
        className="btn btn-ghost text-xs"
        title="Export as PDF"
      >
        {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
        {pdfLoading ? 'Generating…' : 'Export PDF'}
      </button>

      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            disabled={isPending}
            className="btn btn-primary text-xs"
          >
            {isPending
              ? <><Loader2 size={12} className="animate-spin" /> Updating…</>
              : <>Actions <ChevronDown size={12} /></>
            }
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-lg z-40 overflow-hidden shadow-xl"
                style={{ background: '#1E1E24', border: '1px solid #2A2A32' }}
              >
                {invoice.status === 'draft' && (
                  <button
                    onClick={handleMarkSent}
                    className="flex items-center gap-2.5 px-4 py-3 w-full text-left hover:bg-mx-muted text-xs text-mx-dim transition-colors"
                  >
                    <Send size={13} className="text-mx-accent flex-shrink-0" />
                    Mark as Sent
                  </button>
                )}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <button
                    onClick={handleMarkPaid}
                    className="flex items-center gap-2.5 px-4 py-3 w-full text-left hover:bg-mx-muted text-xs text-mx-dim transition-colors"
                  >
                    <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {invoice.status === 'paid' && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
          <CheckCircle2 size={14} /> Paid
        </span>
      )}
    </div>
  )
}
