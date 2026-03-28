'use server'

import { db } from '@/lib/db'
import { invoices, invoiceLineItems, quotes, quoteLineItems, timeEntries } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { generateInvoiceNumber, generateQuoteNumber } from '@/lib/utils'
import { z } from 'zod'

// ── Invoices ────────────────────────────────────────
const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity:    z.coerce.number(),
  unit:        z.string().default('hours'),
  unitPrice:   z.coerce.number(),
})

const CreateInvoiceSchema = z.object({
  clientId:    z.string().min(1),
  projectId:   z.string().optional(),
  title:       z.string().min(1),
  issueDate:   z.string(),
  dueDate:     z.string(),
  currency:    z.string().default('EUR'),
  tax:         z.coerce.number().default(0),
  notes:       z.string().optional(),
  lineItems:   z.array(LineItemSchema).min(1),
})

export async function createInvoice(data: z.infer<typeof CreateInvoiceSchema>) {
  // Get next sequence number
  const count = await db.$count(invoices)
  const number = generateInvoiceNumber(count + 1)

  const subtotal = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0)
  const total = subtotal + (subtotal * (data.tax / 100))

  const [inv] = await db.insert(invoices).values({
    ...data,
    number,
    issueDate: new Date(data.issueDate),
    dueDate:   new Date(data.dueDate),
    subtotal,
    total,
    status: 'draft',
  }).returning({ id: invoices.id })

  // Insert line items
  await db.insert(invoiceLineItems).values(
    data.lineItems.map((li, i) => ({
      invoiceId:   inv.id,
      description: li.description,
      quantity:    li.quantity,
      unit:        li.unit,
      unitPrice:   li.unitPrice,
      total:       li.quantity * li.unitPrice,
      order:       i,
    }))
  )

  revalidatePath('/finance')
  return { success: true, id: inv.id, number }
}

export async function markInvoiceSent(id: string) {
  await db.update(invoices).set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() }).where(eq(invoices.id, id))
  revalidatePath('/finance')
  return { success: true }
}

export async function markInvoicePaid(id: string, paidDate?: Date) {
  await db.update(invoices).set({
    status: 'paid',
    paidDate: paidDate ?? new Date(),
    updatedAt: new Date(),
  }).where(eq(invoices.id, id))
  revalidatePath('/finance')
  return { success: true }
}

// ── Generate invoice from unbilled time entries ──────
export async function createInvoiceFromTime(projectId: string, clientId: string, hourlyRate: number) {
  const entries = await db.query.timeEntries.findMany({
    where: and(
      eq(timeEntries.projectId, projectId),
      eq(timeEntries.billable, true),
      eq(timeEntries.billed, false),
    ),
  })

  if (entries.length === 0) return { error: 'No unbilled time entries found' }

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const lineItems = [{
    description: `Engineering services — ${totalHours.toFixed(1)}h`,
    quantity: totalHours,
    unit: 'hours',
    unitPrice: hourlyRate,
  }]

  const result = await createInvoice({
    clientId,
    projectId,
    title: 'Engineering Services',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems,
  })

  // Mark entries as billed
  if (result.success) {
    await db.update(timeEntries)
      .set({ billed: true, invoiceId: result.id })
      .where(inArray(timeEntries.id, entries.map(e => e.id)))
  }

  return result
}
