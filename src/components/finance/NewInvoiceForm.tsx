'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Save, FileDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createInvoice } from '@/lib/actions/finance'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'

interface LineItem {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
}

interface Props {
  clients: { id: string; name: string; currency: string }[]
  projects: { id: string; name: string; clientId: string; clientName: string; hourlyRate: number }[]
}

function genId() {
  return Math.random().toString(36).slice(2)
}

const DEFAULT_TERMS = 'Payment due within 30 days of invoice date. Bank transfer details provided upon request.'

export default function NewInvoiceForm({ clients, projects }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [title, setTitle] = useState('Engineering Services')
  const [issueDate, setIssueDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return formatDate(d, 'yyyy-MM-dd')
  })
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [taxRate, setTaxRate] = useState(0)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: genId(), description: 'Mechanical engineering design services', quantity: 1, unit: 'hours', unitPrice: 80 },
  ])

  const clientProjects = projects.filter(p => p.clientId === selectedClientId)
  const selectedClient = clients.find(c => c.id === selectedClientId)
  const currency = selectedClient?.currency ?? 'EUR'

  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  function addLineItem() {
    setLineItems(prev => [...prev, { id: genId(), description: '', quantity: 1, unit: 'hours', unitPrice: 80 }])
  }

  function removeLineItem(id: string) {
    setLineItems(prev => prev.filter(li => li.id !== id))
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems(prev => prev.map(li => li.id === id ? { ...li, [field]: value } : li))
  }

  function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId)
    const proj = projects.find(p => p.id === projectId)
    if (proj) {
      setSelectedClientId(proj.clientId)
      // Pre-fill a line item based on project rate
      setLineItems([{
        id: genId(),
        description: `Engineering services — ${proj.name}`,
        quantity: 1,
        unit: 'hours',
        unitPrice: proj.hourlyRate,
      }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClientId) { setError('Select a client'); return }
    if (lineItems.length === 0) { setError('Add at least one line item'); return }
    if (lineItems.some(li => !li.description)) { setError('All line items need a description'); return }

    setError(null)
    startTransition(async () => {
      const result = await createInvoice({
        clientId:   selectedClientId,
        projectId:  selectedProjectId || undefined,
        title,
        issueDate,
        dueDate,
        currency,
        tax:        taxAmount,
        notes:      notes || undefined,
        terms:      terms || undefined,
        lineItems:  lineItems.map(li => ({
          description: li.description,
          quantity:    li.quantity,
          unit:        li.unit,
          unitPrice:   li.unitPrice,
        })),
      })
      if ('error' in result) {
        setError('Failed to create invoice. Please check all fields.')
      } else {
        router.push('/finance')
        router.refresh()
      }
    })
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="New Invoice"
        subtitle="Create and send a professional invoice"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/finance" className="btn btn-ghost">
              <ArrowLeft size={14} /> Back
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="btn btn-primary"
            >
              <Save size={14} />
              {isPending ? 'Creating…' : 'Create Invoice'}
            </button>
          </div>
        }
      />

      <div className="px-8 py-6">
        <div className="max-w-4xl grid grid-cols-3 gap-6">

          {/* ── Main form ── */}
          <div className="col-span-2 space-y-5">

            {/* Client + project */}
            <div className="card p-5 space-y-4">
              <p className="section-title">Invoice Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Client *</label>
                  <select
                    className="mx-input"
                    value={selectedClientId}
                    onChange={e => { setSelectedClientId(e.target.value); setSelectedProjectId('') }}
                    required
                  >
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Project (optional)</label>
                  <select
                    className="mx-input"
                    value={selectedProjectId}
                    onChange={e => handleProjectChange(e.target.value)}
                  >
                    <option value="">No project</option>
                    {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Invoice Title *</label>
                  <input
                    className="mx-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Engineering Services"
                    required
                  />
                </div>
                <div>
                  <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Issue Date *</label>
                  <input
                    type="date"
                    className="mx-input"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Due Date *</label>
                  <input
                    type="date"
                    className="mx-input"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="card overflow-hidden">
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid #1E1E24' }}>
                <p className="section-title">Line Items</p>
              </div>

              {/* Header */}
              <div
                className="grid px-5 py-2 text-2xs text-mx-mid uppercase tracking-wider"
                style={{ gridTemplateColumns: '1fr 80px 80px 100px 36px', gap: '8px' }}
              >
                <span>Description</span>
                <span>Qty</span>
                <span>Unit</span>
                <span className="text-right">Price</span>
                <span />
              </div>

              <div className="divide-y divide-mx-muted">
                {lineItems.map(li => (
                  <div
                    key={li.id}
                    className="grid px-5 py-2.5 items-center gap-2"
                    style={{ gridTemplateColumns: '1fr 80px 80px 100px 36px' }}
                  >
                    <input
                      className="mx-input py-1.5 text-xs"
                      value={li.description}
                      onChange={e => updateLineItem(li.id, 'description', e.target.value)}
                      placeholder="Service description"
                    />
                    <input
                      type="number"
                      className="mx-input py-1.5 text-xs font-mono text-right"
                      value={li.quantity}
                      min="0"
                      step="0.25"
                      onChange={e => updateLineItem(li.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <select
                      className="mx-input py-1.5 text-xs"
                      value={li.unit}
                      onChange={e => updateLineItem(li.id, 'unit', e.target.value)}
                    >
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                      <option value="items">items</option>
                      <option value="fixed">fixed</option>
                    </select>
                    <input
                      type="number"
                      className="mx-input py-1.5 text-xs font-mono text-right"
                      value={li.unitPrice}
                      min="0"
                      step="1"
                      onChange={e => updateLineItem(li.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(li.id)}
                      className="p-1.5 rounded hover:bg-red-950/30 hover:text-mx-red transition-colors"
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 size={13} className="text-mx-subtle" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3" style={{ borderTop: '1px solid #1E1E24' }}>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="btn btn-ghost text-xs"
                >
                  <Plus size={12} /> Add Line Item
                </button>
              </div>
            </div>

            {/* Notes + terms */}
            <div className="card p-5 space-y-4">
              <p className="section-title">Notes & Terms</p>
              <div>
                <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Notes (visible to client)</label>
                <textarea
                  className="mx-input resize-none"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional notes for the client…"
                />
              </div>
              <div>
                <label className="text-2xs text-mx-mid mb-1.5 block uppercase tracking-wider">Payment Terms</label>
                <textarea
                  className="mx-input resize-none"
                  rows={2}
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div
                className="p-3 rounded-md text-xs text-mx-red"
                style={{ background: '#EF444410', border: '1px solid #EF444430' }}
              >
                {error}
              </div>
            )}
          </div>

          {/* ── Summary sidebar ── */}
          <div className="space-y-4">
            {/* Live preview totals */}
            <div className="card p-5 space-y-3">
              <p className="section-title">Summary</p>

              {lineItems.map(li => (
                <div key={li.id} className="flex justify-between text-xs">
                  <span className="text-mx-dim truncate flex-1 pr-2">
                    {li.description || 'Item'} ({li.quantity} {li.unit})
                  </span>
                  <span className="font-mono text-mx-light flex-shrink-0">
                    {formatCurrency(li.quantity * li.unitPrice, currency)}
                  </span>
                </div>
              ))}

              <div className="divider" />

              <div className="flex justify-between text-xs">
                <span className="text-mx-mid">Subtotal</span>
                <span className="font-mono text-mx-light">{formatCurrency(subtotal, currency)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-mx-mid">Tax (%)</span>
                <input
                  type="number"
                  className="mx-input w-20 py-1 text-xs font-mono text-right"
                  value={taxRate}
                  min="0"
                  max="100"
                  step="1"
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>

              {taxRate > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-mx-mid">Tax ({taxRate}%)</span>
                  <span className="font-mono text-mx-light">{formatCurrency(taxAmount, currency)}</span>
                </div>
              )}

              <div className="divider" />

              <div className="flex justify-between">
                <span className="text-sm font-semibold text-mx-light">Total</span>
                <span className="font-display text-xl font-bold text-mx-accent">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>

            {/* Client info */}
            {selectedClient && (
              <div className="card p-4">
                <p className="section-title mb-2">Billing To</p>
                <p className="text-xs font-semibold text-mx-light">{selectedClient.name}</p>
                <p className="text-2xs text-mx-mid mt-0.5">Currency: {selectedClient.currency}</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="card p-4 space-y-2">
              <p className="section-title mb-1">After Creating</p>
              <p className="text-2xs text-mx-mid leading-relaxed">
                The invoice will be saved as <strong className="text-mx-light">Draft</strong>. You can then mark it as Sent and export a PDF to send to your client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
