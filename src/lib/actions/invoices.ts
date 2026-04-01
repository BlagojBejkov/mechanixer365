'use server'
import { db } from '@/lib/db'
import { invoices, invoiceLineItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createId } from '@paralleldrive/cuid2'

export async function createInvoice(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const projectId = formData.get('projectId') as string | null
  const number = formData.get('number') as string
  const title = formData.get('title') as string
  const issueDate = formData.get('issueDate') as string
  const dueDate = formData.get('dueDate') as string
  const notes = formData.get('notes') as string | null
  const lineItemsRaw = formData.get('lineItems') as string

  if (!clientId || !number || !title || !issueDate || !dueDate) {
    return { error: 'Missing required fields' }
  }

  let lineItems: { description: string; quantity: number; unitPrice: number; unit: string }[] = []
  try {
    lineItems = JSON.parse(lineItemsRaw || '[]')
  } catch {
    return { error: 'Invalid line items' }
  }

  if (lineItems.length === 0) return { error: 'At least one line item is required' }

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const total = subtotal // VAT handled separately later

  const invoiceId = createId()

  await db.insert(invoices).values({
    id: invoiceId,
    clientId,
    projectId: projectId || null,
    number,
    title,
    status: 'draft',
    issueDate: new Date(issueDate),
    dueDate: new Date(dueDate),
    currency: 'EUR',
    subtotal,
    tax: 0,
    total,
    notes: notes || null,
  })

  await db.insert(invoiceLineItems).values(
    lineItems.map(item => ({
      id: createId(),
      invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))
  )

  revalidatePath('/finance')
  return { success: true, id: invoiceId }
}

export async function deleteInvoice(id: string) {
  await db.delete(invoices).where(eq(invoices.id, id))
  revalidatePath('/finance')
  return { success: true }
}
