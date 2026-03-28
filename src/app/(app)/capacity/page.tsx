import type { Metadata } from 'next'

import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'
import { formatHours } from '@/lib/utils'

export const metadata: Metadata = { title: 'Capacity' }

const WEEKS = ['Feb 17', 'Feb 24', 'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24']
const HOURS_PER_WEEK = 40

const engineers = [
  {
    name: 'Tomche',
    allocations: [
      { project: 'Conveyor System Redesign', client: 'AutoLine GmbH',   color: '#3D8EF0', hours: [32, 28, 24, 20, 16, 8] },
      { project: 'Robotic Cell Integration', client: 'NexaAutomation',  color: '#8B5CF6', hours: [8, 0, 0, 0, 0, 0] },
      { project: 'Pneumatic System Design',  client: 'AutoLine GmbH',   color: '#22C55E', hours: [0, 12, 16, 20, 24, 32] },
    ],
  },
  {
    name: 'Katerina',
    allocations: [
      { project: 'CNC Machine Frame CAD',  client: 'PrecisionWorks',   color: '#F59E0B', hours: [24, 32, 36, 36, 24, 16] },
      { project: 'Monthly CAD Retainer',   client: 'FlexMachining Ltd', color: '#3D8EF0', hours: [16, 8, 4, 4, 16, 16] },
    ],
  },
]

function CapacityBar({
  allocations,
}: {
  allocations: { project: string; color: string; hours: number[] }[]
  weekIdx: number
}) {
  return null // handled inline below
}

export default function CapacityPage() {
  // Compute totals per engineer per week
  const engineerWeekTotals = engineers.map(eng => ({
    name: eng.name,
    weekTotals: WEEKS.map((_, wi) =>
      eng.allocations.reduce((s, a) => s + a.hours[wi], 0)
    ),
  }))

  return (
    
      <div className="animate-in">
        <PageHeader
          title="Capacity"
          subtitle="Engineer allocation across upcoming weeks"
        />

        <div className="px-8 py-6 space-y-8">
          {engineers.map((eng, ei) => {
            const totals = engineerWeekTotals[ei].weekTotals

            return (
              <div key={eng.name} className="card overflow-hidden">
                {/* Engineer header */}
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: '1px solid #1E1E24' }}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={eng.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-mx-light">{eng.name}</p>
                      <p className="text-2xs text-mx-mid">Mechanical Engineer</p>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4">
                    {eng.allocations.map(a => (
                      <div key={a.project} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm" style={{ background: a.color }} />
                        <span className="text-2xs text-mx-mid">{a.project.split(' ').slice(0, 3).join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week columns */}
                <div className="px-5 pb-5">
                  <div className="grid mt-4" style={{ gridTemplateColumns: `repeat(${WEEKS.length}, 1fr)`, gap: '8px' }}>
                    {WEEKS.map((week, wi) => {
                      const total = totals[wi]
                      const over = total > HOURS_PER_WEEK

                      return (
                        <div key={week} className="flex flex-col gap-1.5">
                          {/* Week label */}
                          <span className="text-2xs text-mx-mid text-center">{week}</span>

                          {/* Stacked bar */}
                          <div
                            className="relative rounded overflow-hidden"
                            style={{ height: '120px', background: '#111114', border: '1px solid #1E1E24' }}
                          >
                            {/* Capacity line at 100% */}
                            <div
                              className="absolute left-0 right-0"
                              style={{
                                bottom: `${(HOURS_PER_WEEK / 50) * 100}%`,
                                height: '1px',
                                background: '#2A2A32',
                                zIndex: 10,
                              }}
                            />

                            {/* Stacked segments (bottom-up) */}
                            {eng.allocations.map((alloc, ai) => {
                              const h = alloc.hours[wi]
                              if (h === 0) return null
                              const heightPct = (h / 50) * 100
                              // Offset = sum of previous allocations
                              const offsetHours = eng.allocations
                                .slice(0, ai)
                                .reduce((s, a) => s + a.hours[wi], 0)
                              const offsetPct = (offsetHours / 50) * 100

                              return (
                                <div
                                  key={alloc.project}
                                  className="absolute left-0 right-0 transition-all"
                                  style={{
                                    bottom: `${offsetPct}%`,
                                    height: `${heightPct}%`,
                                    background: alloc.color,
                                    opacity: 0.8,
                                    borderTop: `1px solid ${alloc.color}`,
                                  }}
                                  title={`${alloc.project}: ${h}h`}
                                />
                              )
                            })}

                            {/* Over-capacity warning overlay */}
                            {over && (
                              <div
                                className="absolute top-0 left-0 right-0"
                                style={{
                                  height: `${((total - HOURS_PER_WEEK) / 50) * 100}%`,
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  borderBottom: '1px solid #EF4444',
                                }}
                              />
                            )}
                          </div>

                          {/* Hours label */}
                          <div className="text-center">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                over ? 'text-mx-red' : total >= 36 ? 'text-mx-amber' : 'text-mx-light'
                              }`}
                            >
                              {total}h
                            </span>
                            <span className="text-2xs text-mx-subtle"> / {HOURS_PER_WEEK}h</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Legend note */}
          <div className="flex items-center gap-4 text-2xs text-mx-mid">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-px" style={{ background: '#2A2A32' }} />
              <span>40h capacity limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(239,68,68,0.2)' }} />
              <span>Over capacity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm" style={{ background: 'rgba(245,158,11,0.4)' }} />
              <span>Near capacity (≥90%)</span>
            </div>
          </div>
        </div>
      </div>
    
  )
}
