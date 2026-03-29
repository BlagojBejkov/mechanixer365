import type { Metadata } from 'next'
import TimeWeekView from '@/components/time/TimeWeekView'
import { formatDate } from '@/lib/utils'
import { db } from '@/lib/db'
import { users, projects, timeEntries } from '@/lib/db/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Time' }
export const dynamic = 'force-dynamic'

function getWeekRange(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default async function TimePage() {
  await requireAuth()
  const { start: weekStart, end: weekEnd } = getWeekRange(new Date())

  const engineers = await db.query.users.findMany({ where: notInArray(users.role, ['owner'] as any) })
  const activeProjects = await db.query.projects.findMany({
    where: eq(projects.status, 'active'),
    with: { client: true },
  })

  const weekEntries = await db.query.timeEntries.findMany({
    where: and(gte(timeEntries.date, weekStart), lte(timeEntries.date, weekEnd)),
    with: { user: true, project: { with: { client: true } }, task: true },
    orderBy: [desc(timeEntries.date)],
  })

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const monthEntries = await db.query.timeEntries.findMany({
    where: gte(timeEntries.date, monthStart),
    with: { user: true },
  })

  const engineerStats = engineers.map(eng => {
    const engWeek = weekEntries.filter(e => e.userId === eng.id)
    const engMonth = monthEntries.filter(e => e.userId === eng.id)
    const weekHours = engWeek.reduce((s, e) => s + e.hours, 0)
    const monthHours = engMonth.reduce((s, e) => s + e.hours, 0)
    const billableHours = engMonth.filter(e => e.billable).reduce((s, e) => s + e.hours, 0)
    const utilization = Math.round((monthHours / 168) * 100)
    return { ...eng, weekHours, monthHours, billableHours, utilization }
  })

  const totalWeekHours = weekEntries.reduce((s, e) => s + e.hours, 0)
  const billableWeekHours = weekEntries.filter(e => e.billable).reduce((s, e) => s + e.hours, 0)

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const entriesByDay = days.map(day => {
    const dayStr = formatDate(day, 'yyyy-MM-dd')
    const entries = weekEntries.filter(e => formatDate(e.date, 'yyyy-MM-dd') === dayStr)
    return { date: day, entries }
  })

  return (
    <TimeWeekView
      weekStart={weekStart}
      weekEnd={weekEnd}
      entriesByDay={entriesByDay}
      engineerStats={engineerStats}
      totalWeekHours={totalWeekHours}
      billableWeekHours={billableWeekHours}
      activeProjects={activeProjects.map(p => ({
        id: p.id,
        name: p.name,
        client: p.client?.companyName ?? '',
      }))}
    />
  )
}
