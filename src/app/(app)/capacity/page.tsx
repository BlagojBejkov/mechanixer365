import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import { db } from '@/lib/db'
import { timeEntries, projects, users } from '@/lib/db/schema'
import { eq, gte, lte, and, sql } from 'drizzle-orm'

export const metadata: Metadata = { title: 'Capacity' }

const HOURS_PER_WEEK = 40
const PROJECT_COLORS = ['#3D8EF0', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#F97316']

// Generate the next N weeks starting from the Monday of the current week
function getWeeks(count = 6) {
  const now = new Date()
  // Find this Monday
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: count }, (_, i) => {
    const start = new Date(monday)
    start.setDate(monday.getDate() + i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    const label = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return { label, start, end }
  })
}

export default async function CapacityPage() {
  const weeks = getWeeks(6)
  const firstWeek = weeks[0].start
  const lastWeek = weeks[weeks.length - 1].end

  // Get all engineers (non-admin users + admin)
  const allUsers = await db.query.users.findMany({
    orderBy: users.name,
  })

  // Get all active projects with their lead engineers
  const activeProjects = await db.query.projects.findMany({
    where: eq(projects.status, 'active'),
    with: { client: true },
  })

  // Get all time entries in the window
  const entries = await db
    .select({
      userId: timeEntries.userId,
      projectId: timeEntries.projectId,
      date: timeEntries.date,
      hours: timeEntries.hours,
    })
    .from(timeEntries)
    .where(
      and(
        gte(timeEntries.date, firstWeek),
        lte(timeEntries.date, lastWeek)
      )
    )

  // Build per-engineer, per-week, per-project hour maps
  const engineerData = allUsers.map((user, userIdx) => {
    // Find projects this engineer is assigned to or has logged time on
    const userEntries = entries.filter(e => e.userId === user.id)
    const projectIds = [...new Set([
      ...activeProjects.filter(p => p.leadEngineer === user.id).map(p => p.id),
      ...userEntries.map(e => e.projectId),
    ])]

    const allocations = projectIds.map((pid, pi) => {
      const project = activeProjects.find(p => p.id === pid)
      const weekHours = weeks.map(week => {
        return userEntries
          .filter(e => {
            if (e.projectId !== pid) return false
            const d = new Date(e.date)
            return d >= week.start && d <= week.end
          })
          .reduce((sum, e) => sum + (e.hours ?? 0), 0)
      })
      return {
        projectId: pid,
        project: project?.name ?? 'Unknown Project',
        client: project?.client?.companyName ?? '',
        color: PROJECT_COLORS[pi % PROJECT_COLORS.length],
        hours: weekHours,
      }
    })

    const weekTotals = weeks.map((_, wi) =>
      allocations.reduce((s, a) => s + a.hours[wi], 0)
    )

    return { user, allocations, weekTotals }
  })

  // Only show engineers who have allocations or active projects
  const activeEngineers = engineerData.filter(e =>
    e.allocations.length > 0 || e.weekTotals.some(h => h > 0)
  )

  // If nobody has logged time yet, show all users with empty allocations
  const displayEngineers = activeEngineers.length > 0 ? activeEngineers : engineerData

  return (
    <div className="animate-in">
      <PageHeader
        title="Capacity"
        subtitle="Engineer allocation across upcoming weeks"
      />

      <div className="px-8 py-6 space-y-8">
        {displayEngineers.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-mx-mid text-sm">No engineers found. Add team members in Settings.</p>
          </div>
        ) : (
          displayEngineers.map(({ user, allocations, weekTotals }) => (
            <div key={user.id} className="card overflow-hidden">
              {/* Engineer header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #1E1E24' }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-mx-light">{user.name}</p>
                    <p className="text-2xs text-mx-mid capitalize">{user.role === 'owner' ? 'Owner / Engineer' : 'Mechanical Engineer'}</p>
                  </div>
                </div>
                {/* Legend */}
                {allocations.length > 0 && (
                  <div className="flex items-center gap-4 flex-wrap justify-end max-w-lg">
                    {allocations.map(a => (
                      <div key={a.projectId} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: a.color }} />
                        <span className="text-2xs text-mx-mid">{a.project.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Week columns */}
              <div className="px-5 pb-5">
                {allocations.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-mx-subtle text-xs">No time logged yet for upcoming weeks</p>
                  </div>
                ) : (
                  <div
                    className="grid mt-4"
                    style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)`, gap: '8px' }}
                  >
                    {weeks.map((week, wi) => {
                      const total = weekTotals[wi]
                      const over = total > HOURS_PER_WEEK
                      const near = !over && total >= HOURS_PER_WEEK * 0.9

                      return (
                        <div key={week.label} className="flex flex-col gap-1.5">
                          <span className="text-2xs text-mx-mid text-center">{week.label}</span>

                          {/* Stacked bar */}
                          <div
                            className="relative rounded overflow-hidden"
                            style={{ height: '120px', background: '#111114', border: '1px solid #1E1E24' }}
                          >
                            {/* Capacity line at 80% height (= 40h of 50h scale) */}
                            <div
                              className="absolute left-0 right-0"
                              style={{ bottom: '80%', height: '1px', background: '#2A2A32', zIndex: 10 }}
                            />

                            {/* Empty state bar */}
                            {total === 0 && (
                              <div
                                className="absolute bottom-0 left-0 right-0"
                                style={{ height: '4%', background: '#1E1E24' }}
                              />
                            )}

                            {/* Stacked segments */}
                            {allocations.map((alloc, ai) => {
                              const h = alloc.hours[wi]
                              if (h === 0) return null
                              const heightPct = (h / 50) * 100
                              const offsetHours = allocations
                                .slice(0, ai)
                                .reduce((s, a) => s + a.hours[wi], 0)
                              const offsetPct = (offsetHours / 50) * 100
                              return (
                                <div
                                  key={alloc.projectId}
                                  className="absolute left-0 right-0 transition-all"
                                  style={{
                                    bottom: `${offsetPct}%`,
                                    height: `${heightPct}%`,
                                    background: alloc.color,
                                    opacity: 0.85,
                                    borderTop: `1px solid ${alloc.color}`,
                                  }}
                                  title={`${alloc.project}: ${h}h`}
                                />
                              )
                            })}

                            {/* Over-capacity overlay */}
                            {over && (
                              <div
                                className="absolute top-0 left-0 right-0"
                                style={{
                                  height: `${((total - HOURS_PER_WEEK) / 50) * 100}%`,
                                  background: 'rgba(239, 68, 68, 0.25)',
                                  borderBottom: '1px solid #EF4444',
                                }}
                              />
                            )}
                          </div>

                          {/* Hours label */}
                          <div className="text-center">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                over ? 'text-mx-red' : near ? 'text-mx-amber' : total > 0 ? 'text-mx-light' : 'text-mx-subtle'
                              }`}
                            >
                              {total > 0 ? `${total}h` : '—'}
                            </span>
                            <span className="text-2xs text-mx-subtle"> / {HOURS_PER_WEEK}h</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 text-2xs text-mx-mid">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px" style={{ background: '#2A2A32' }} />
            <span>40h capacity limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(239,68,68,0.25)' }} />
            <span>Over capacity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(245,158,11,0.4)' }} />
            <span>Near capacity (≥90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm" style={{ background: '#1E1E24', border: '1px solid #2A2A32' }} />
            <span>No time logged</span>
          </div>
        </div>
      </div>
    </div>
  )
}
