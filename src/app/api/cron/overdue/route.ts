import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, and, lt, inArray } from 'drizzle-orm'
import { sendOverdueInvoiceEmail } from '@/lib/email'

// Vercel calls this with the CRON_SECRET in the Authorization header.
// Set CRON_SECRET in Vercel env vars to any random string to secure the endpoint.
export async function GET(req: NextRequest) {
  // Verify it's Vercel calling (skip check in dev)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const nowMs = now.getTime()

  // Find all invoices that are 'sent' and past their due date
  // dueDate is stored as timestamp_ms (milliseconds)
  const overdueInvoices = await db.query.invoices.findMany({
    where: and(
      eq(invoices.status, 'sent'),
      lt(invoices.dueDate, now),
    ),
    with: {
      client: true,
      project: true,
    },
  })

  if (overdueInvoices.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No overdue invoices' })
  }

  const appUrl = process.env.AUTH_URL ?? 'https://365.mechanixer.com'
  const results: { invoiceId: string; number: string; to: string; status: string }[] = []

  for (const inv of overdueInvoices) {
    if (!inv.client?.contactEmail) {
      results.push({ invoiceId: inv.id, number: inv.number, to: '', status: 'skipped — no email' })
      continue
    }

    const dueDate = new Date(inv.dueDate)
    const daysOverdue = Math.ceil((nowMs - dueDate.getTime()) / (1000 * 60 * 60 * 24))

    try {
      await sendOverdueInvoiceEmail({
        to: inv.client.contactEmail,
        clientName: inv.client.companyName,
        invoiceNumber: inv.number,
        invoiceTitle: inv.title,
        total: inv.total,
        currency: inv.currency ?? 'EUR',
        dueDate,
        daysOverdue,
        invoiceUrl: `${appUrl}/finance/invoices/${inv.id}`,
      })

      results.push({
        invoiceId: inv.id,
        number: inv.number,
        to: inv.client.contactEmail,
        status: 'sent',
      })
    } catch (err: any) {
      console.error(`Failed to send reminder for ${inv.number}:`, err)
      results.push({
        invoiceId: inv.id,
        number: inv.number,
        to: inv.client.contactEmail,
        status: `error: ${err.message}`,
      })
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length
  console.log(`Overdue cron: ${sentCount}/${overdueInvoices.length} reminders sent`)

  return NextResponse.json({
    sent: sentCount,
    total: overdueInvoices.length,
    results,
    timestamp: now.toISOString(),
  })
}
