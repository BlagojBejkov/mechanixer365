import { db } from '@/lib/db'
import { eq, desc, and, gte, lte, sql, count, notInArray } from 'drizzle-orm'
import { leads, clients, projects, tasks, timeEntries, invoices, invoiceLineItems, milestones, users, files } from './schema'

// ── Dashboard ────────────────────────────────────────
export async function getDashboardStats() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Use raw SQL for date comparisons since paidDate is timestamp_ms (milliseconds stored as integer)
  const yearMs = startOfYear.getTime()
  const monthMs = startOfMonth.getTime()

  const [revenueYTD] = await db
    .select({ total: sql<number>`coalesce(sum(${invoices.total}), 0)` })
    .from(invoices)
    .where(and(
      eq(invoices.status, 'paid'),
      sql`${invoices.paidDate} >= ${yearMs}`
    ))

  const [revenueThisMonth] = await db
    .select({ total: sql<number>`coalesce(sum(${invoices.total}), 0)` })
    .from(invoices)
    .where(and(
      eq(invoices.status, 'paid'),
      sql`${invoices.paidDate} >= ${monthMs}`
    ))

  const [outstanding] = await db
    .select({ total: sql<number>`coalesce(sum(${invoices.total}), 0)` })
    .from(invoices)
    .where(eq(invoices.status, 'sent'))

  const nowMs = now.getTime()
  const [overdueRow] = await db
    .select({ n: count() })
    .from(invoices)
    .where(and(
      eq(invoices.status, 'sent'),
      sql`${invoices.dueDate} < ${nowMs}`
    ))

  const activeProjects = await db.query.projects.findMany({
    where: eq(projects.status, 'active'),
    with: { client: true, leadEngineerUser: true },
  })

  const pipelineLeads = await db.query.leads.findMany({
    where: notInArray(leads.stage, ['won', 'lost']),
  })

  const pipelineValue = pipelineLeads.reduce((s, l) => s + (l.estimatedValue ?? 0), 0)

  return {
    revenueYTD: revenueYTD?.total ?? 0,
    revenueThisMonth: revenueThisMonth?.total ?? 0,
    outstanding: outstanding?.total ?? 0,
    overdueCount: overdueRow?.n ?? 0,
    activeProjectCount: activeProjects.length,
    pipelineValue,
    activeProjects,
  }
}

// ── CRM ──────────────────────────────────────────────
export async function getLeads() {
  return db.query.leads.findMany({
    orderBy: [desc(leads.createdAt)],
    with: { assignedUser: true },
  })
}

export async function getLead(id: string) {
  return db.query.leads.findFirst({
    where: eq(leads.id, id),
    with: { assignedUser: true },
  })
}

export async function getClients() {
  return db.query.clients.findMany({
    where: eq(clients.status, 'active'),
    orderBy: [desc(clients.createdAt)],
    with: { projects: true },
  })
}

export async function getClient(id: string) {
  return db.query.clients.findFirst({
    where: eq(clients.id, id),
    with: {
      projects: { with: { timeEntries: true, invoices: true } },
      invoices: { orderBy: [desc(invoices.id)] },
    },
  })
}

// ── Projects ─────────────────────────────────────────
export async function getProjects(filter?: string) {
  return db.query.projects.findMany({
    where: filter && filter !== 'all' ? eq(projects.status, filter as any) : undefined,
    orderBy: [desc(projects.createdAt)],
    with: {
      client: true,
      leadEngineerUser: true,
      milestones: { orderBy: [milestones.order] },
      tasks: true,
      timeEntries: true,
    },
  })
}

export async function getProject(id: string) {
  return db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      client: true,
      leadEngineerUser: true,
      milestones: {
        orderBy: [milestones.order],
        with: { tasks: { with: { assignedUser: true } } },
      },
      tasks: { with: { assignedUser: true }, orderBy: [tasks.order] },
      timeEntries: {
        with: { user: true },
        orderBy: [desc(timeEntries.date)],
      },
      files: { orderBy: [desc(files.createdAt)] },
      invoices: { orderBy: [desc(invoices.id)] },
    },
  })
}

export async function getProjectStats(projectId: string) {
  const [logged] = await db
    .select({ hours: sql<number>`coalesce(sum(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .where(eq(timeEntries.projectId, projectId))

  const [billable] = await db
    .select({ hours: sql<number>`coalesce(sum(${timeEntries.hours}), 0)` })
    .from(timeEntries)
    .where(and(eq(timeEntries.projectId, projectId), eq(timeEntries.billable, true)))

  const [taskCounts] = await db
    .select({
      total: count(),
      done: sql<number>`sum(case when ${tasks.status} = 'done' then 1 else 0 end)`,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))

  return {
    loggedHours: logged?.hours ?? 0,
    billableHours: billable?.hours ?? 0,
    totalTasks: taskCounts?.total ?? 0,
    completedTasks: taskCounts?.done ?? 0,
  }
}

// ── Finance ───────────────────────────────────────────
export async function getInvoices(filter?: string) {
  return db.query.invoices.findMany({
    where: filter && filter !== 'all' ? eq(invoices.status, filter as any) : undefined,
    orderBy: [desc(invoices.id)],
    with: { client: true, project: true },
  })
}

export async function getInvoice(id: string) {
  return db.query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: {
      client: true,
      project: true,
      lineItems: { orderBy: [invoiceLineItems.order] },
    },
  })
}

export async function getRevenueByMonth(year: number) {
  // paidDate is stored as milliseconds (timestamp_ms mode)
  // SQLite unixepoch expects seconds, so divide by 1000
  return db
    .select({
      month: sql<number>`cast(strftime('%m', datetime(${invoices.paidDate} / 1000, 'unixepoch')) as integer)`,
      total: sql<number>`sum(${invoices.total})`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.status, 'paid'),
      sql`strftime('%Y', datetime(${invoices.paidDate} / 1000, 'unixepoch')) = ${String(year)}`,
    ))
    .groupBy(sql`strftime('%m', datetime(${invoices.paidDate} / 1000, 'unixepoch'))`)
}

export async function getUnbilledHoursByProject() {
  return db
    .select({
      projectId: timeEntries.projectId,
      hours: sql<number>`sum(${timeEntries.hours})`,
    })
    .from(timeEntries)
    .where(and(eq(timeEntries.billable, true), eq(timeEntries.billed, false)))
    .groupBy(timeEntries.projectId)
}

// ── Portal ────────────────────────────────────────────
export async function getPortalData(clientId: string) {
  return db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.portalEnabled, true)),
    with: {
      projects: {
        where: eq(projects.portalVisible, true),
        with: {
          milestones: { orderBy: [milestones.order] },
          files: {
            where: eq(files.portalVisible, true),
            orderBy: [desc(files.createdAt)],
          },
        },
      },
      invoices: {
        where: eq(invoices.portalVisible, true),
        orderBy: [desc(invoices.id)],
      },
    },
  })
}
