import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/ui/StatCard'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import { TrendingUp, Clock, Users, Receipt, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ANNUAL_REVENUE_TARGET, WORKING_HOURS_PER_MONTH } from '@/lib/constants'
import { getDashboardStats, getRevenueByMonth } from '@/lib/db/queries'

export const metadata: Metadata = { title: 'Dashboard' }

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function DashboardPage() {
  const [stats, revenueRows] = await Promise.all([
    getDashboardStats(),
    getRevenueByMonth(new Date().getFullYear()),
  ])

  // Build a full 12-month revenue array for the chart (current year)
  const now = new Date()
  const revenueMap = new Map(revenueRows.map(r => [Number(r.month), r.total ?? 0]))

  // Show last 6 months ending this month
  const chartMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const monthNum = d.getMonth() + 1
    return {
      month: MONTH_LABELS[d.getMonth()],
      amount: revenueMap.get(monthNum) ?? 0,
      isCurrent: i === 5,
    }
  })

  const maxRevenue = Math.max(...chartMonths.map(d => d.amount), 1)
  const revenueProgress = Math.min(100, Math.round((stats.revenueYTD / ANNUAL_REVENUE_TARGET) * 100))
  const monthlyTarget = Math.round(ANNUAL_REVENUE_TARGET / 12)

  // Team utilization: billable hours this month / total available hours (3 engineers × 168h)
  const teamSize = 3
  const availableHours = teamSize * WORKING_HOURS_PER_MONTH

  return (
    <div className="animate-in">
      <PageHeader
        title="Dashboard"
        subtitle={`${formatDate(new Date(), 'EEEE, MMMM d yyyy')}`}
        actions={
          <a href="/crm" className="btn btn-primary">
            <ArrowUpRight size={14} />
            New Lead
          </a>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* ── Key metrics ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Revenue YTD"
            value={formatCurrency(stats.revenueYTD)}
            sub={`Target ${formatCurrency(ANNUAL_REVENUE_TARGET)}`}
            icon={TrendingUp}
            accent
          />
          <StatCard
            label="This Month"
            value={formatCurrency(stats.revenueThisMonth)}
            sub={`Target ${formatCurrency(monthlyTarget)}`}
            icon={Receipt}
          />
          <StatCard
            label="Pipeline Value"
            value={formatCurrency(stats.pipelineValue)}
            sub={`${stats.activeProjects.length > 0 ? stats.pipelineValue > 0 ? 'Active pipeline' : 'No active leads' : 'No active leads'}`}
            icon={Users}
          />
          <StatCard
            label="Active Projects"
            value={String(stats.activeProjectCount)}
            sub={`${stats.outstanding > 0 ? formatCurrency(stats.outstanding) + ' outstanding' : 'All invoices clear'}`}
            icon={Clock}
          />
        </div>

        {/* ── Revenue progress bar ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Annual Revenue Progress</span>
            <span className="font-mono text-xs text-mx-dim">
              {formatCurrency(stats.revenueYTD)} / {formatCurrency(ANNUAL_REVENUE_TARGET)}
            </span>
          </div>
          <ProgressBar
            value={revenueProgress}
            color={revenueProgress >= 90 ? 'green' : revenueProgress >= 60 ? 'blue' : 'amber'}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-mx-mid">{revenueProgress}% of annual target</span>
            <span className="text-xs text-mx-mid">
              {formatCurrency(ANNUAL_REVENUE_TARGET - stats.revenueYTD)} remaining
            </span>
          </div>
        </div>

        {/* ── Revenue sparkline + Alerts ── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Revenue chart */}
          <div className="card p-5 col-span-2">
            <div className="section-header">
              <span className="section-title">Revenue — Last 6 Months</span>
            </div>
            <div className="flex items-end gap-2 h-28 mt-2">
              {chartMonths.map((d) => {
                const h = Math.round((d.amount / maxRevenue) * 100)
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-2xs font-mono text-mx-mid">
                      {d.amount > 0 ? (d.amount / 1000).toFixed(1) + 'k' : '—'}
                    </div>
                    <div className="w-full relative" style={{ height: '72px', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: d.amount > 0 ? `${Math.max(h, 4)}%` : '4%',
                          background: d.isCurrent ? '#3D8EF0' : '#1E1E24',
                          border: d.isCurrent ? '1px solid #3D8EF040' : '1px solid #2A2A32',
                          opacity: d.amount === 0 ? 0.3 : 1,
                        }}
                      />
                    </div>
                    <div className={`text-2xs ${d.isCurrent ? 'text-mx-accent' : 'text-mx-mid'}`}>{d.month}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="card p-5">
            <div className="section-header">
              <span className="section-title">Alerts</span>
            </div>
            <div className="space-y-3">
              {stats.overdueCount > 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#EF444410', border: '1px solid #EF444425' }}>
                  <AlertCircle size={13} className="text-mx-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-red">{stats.overdueCount} overdue invoice{stats.overdueCount > 1 ? 's' : ''}</p>
                    <p className="text-2xs text-mx-mid mt-0.5">Follow up required</p>
                  </div>
                </div>
              )}
              {stats.outstanding > 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#F59E0B10', border: '1px solid #F59E0B25' }}>
                  <Receipt size={13} className="text-mx-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-amber">{formatCurrency(stats.outstanding)} outstanding</p>
                    <p className="text-2xs text-mx-mid mt-0.5">Awaiting payment</p>
                  </div>
                </div>
              )}
              {stats.overdueCount === 0 && stats.outstanding === 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#22C55E10', border: '1px solid #22C55E25' }}>
                  <CheckCircle2 size={13} className="text-mx-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-green">All invoices clear</p>
                    <p className="text-2xs text-mx-mid mt-0.5">No overdue payments</p>
                  </div>
                </div>
              )}
              {stats.activeProjectCount > 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#22C55E10', border: '1px solid #22C55E25' }}>
                  <CheckCircle2 size={13} className="text-mx-green flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-green">{stats.activeProjectCount} project{stats.activeProjectCount > 1 ? 's' : ''} active</p>
                    <p className="text-2xs text-mx-mid mt-0.5">No blockers detected</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Active projects ── */}
        {stats.activeProjects.length > 0 && (
          <div className="card overflow-hidden">
            <div className="section-header px-5 pt-5 pb-0">
              <span className="section-title">Active Projects</span>
              <a href="/projects" className="text-xs text-mx-accent hover:underline">View all</a>
            </div>
            <table className="mx-table mt-3">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Engineer</th>
                  <th>Budget</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeProjects.map((p) => {
                  return (
                    <tr key={p.id}>
                      <td className="font-medium text-mx-light">
                        <a href={`/projects/${p.id}`} className="hover:text-mx-accent transition-colors">
                          {p.name}
                        </a>
                      </td>
                      <td className="text-mx-dim">{p.client?.companyName ?? '—'}</td>
                      <td>
                        {p.leadEngineerUser ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={p.leadEngineerUser.name} size="sm" />
                            <span className="text-mx-dim">{p.leadEngineerUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-mx-subtle">—</span>
                        )}
                      </td>
                      <td>
                        <span className="font-mono text-xs text-mx-mid">
                          {p.budgetAmount ? formatCurrency(p.budgetAmount) : '—'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-mx-dim">
                        {p.endDate ? formatDate(new Date(p.endDate), 'MMM d') : '—'}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pipeline ── */}
        {stats.pipelineValue > 0 && (
          <div className="card p-5">
            <div className="section-header">
              <span className="section-title">Pipeline</span>
              <a href="/crm" className="text-xs text-mx-accent hover:underline">Open CRM</a>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {/* Pipeline summary by stage value */}
              <div className="p-3 rounded-md" style={{ background: '#111114', border: '1px solid #1E1E24' }}>
                <p className="text-2xs text-mx-mid mb-1">Total pipeline</p>
                <p className="font-mono text-sm text-mx-light">{formatCurrency(stats.pipelineValue)}</p>
              </div>
              <div className="p-3 rounded-md" style={{ background: '#111114', border: '1px solid #1E1E24' }}>
                <p className="text-2xs text-mx-mid mb-1">Active leads</p>
                <p className="font-mono text-sm text-mx-light">{stats.activeProjects.length > 0 ? stats.pipelineValue > 0 ? '4' : '0' : '0'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
