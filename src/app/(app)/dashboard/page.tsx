import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/ui/StatCard'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusBadge from '@/components/ui/StatusBadge'
import Avatar from '@/components/ui/Avatar'
import {
  TrendingUp, Clock, Users, Receipt,
  AlertCircle, ArrowUpRight, CheckCircle2
} from 'lucide-react'
import { formatCurrency, formatHours, formatDate } from '@/lib/utils'
import { ANNUAL_REVENUE_TARGET } from '@/lib/constants'

export const metadata: Metadata = { title: 'Dashboard' }

// ── Mock data (replace with db queries) ─────────────────
const stats = {
  revenueYTD:       187_400,
  revenueTarget:    ANNUAL_REVENUE_TARGET,
  revenueThisMonth: 28_600,
  pipelineValue:    142_000,
  activeProjects:   7,
  overdueInvoices:  2,
  totalUnbilled:    14_800,
  teamUtilization:  81, // percent
}

const activeProjects = [
  { id: '1', name: 'Conveyor System Redesign', client: 'AutoLine GmbH',    progress: 68, status: 'active' as const,   engineer: 'Tomche',   budget: 24000, spent: 16800, dueDate: new Date('2025-03-15') },
  { id: '2', name: 'CNC Machine Frame CAD',    client: 'PrecisionWorks',   progress: 35, status: 'active' as const,   engineer: 'Katerina', budget: 18000, spent: 6300,  dueDate: new Date('2025-04-02') },
  { id: '3', name: 'Robotic Cell Integration', client: 'NexaAutomation',   progress: 91, status: 'review' as const,   engineer: 'Tomche',   budget: 32000, spent: 29100, dueDate: new Date('2025-02-28') },
  { id: '4', name: 'Retainer: Monthly CAD',    client: 'FlexMachining Ltd', progress: 60, status: 'active' as const,  engineer: 'Katerina', budget: 4800,  spent: 2880,  dueDate: new Date('2025-02-28') },
]

const pipeline = [
  { id: '1', company: 'Müller CNC',       stage: 'proposal_sent' as const, value: 38000, contact: 'Klaus Müller' },
  { id: '2', company: 'Nordic Robotics',  stage: 'qualified' as const,     value: 52000, contact: 'Eva Lindqvist' },
  { id: '3', company: 'ItalMeccanica',    stage: 'negotiation' as const,   value: 29000, contact: 'Marco Bianchi' },
  { id: '4', company: 'US AutoTech',      stage: 'new' as const,           value: 61000, contact: 'Tyler Brooks' },
]

const recentActivity = [
  { text: 'Invoice INV-2025-014 sent to AutoLine GmbH',         time: '2h ago',  type: 'invoice' },
  { text: 'Katerina logged 6h on CNC Machine Frame CAD',        time: '4h ago',  type: 'time' },
  { text: 'Robotic Cell Integration moved to Review',           time: '1d ago',  type: 'project' },
  { text: 'New lead: US AutoTech — $61k potential',             time: '1d ago',  type: 'lead' },
  { text: 'Quote Q-2025-008 accepted by Nordic Robotics',       time: '2d ago',  type: 'quote' },
]

const revenueByMonth = [
  { month: 'Sep', amount: 21400 },
  { month: 'Oct', amount: 28900 },
  { month: 'Nov', amount: 24200 },
  { month: 'Dec', amount: 19800 },
  { month: 'Jan', amount: 34100 },
  { month: 'Feb', amount: 28600 },
]

const maxRevenue = Math.max(...revenueByMonth.map(d => d.amount))

export default function DashboardPage() {
  const revenueProgress = Math.round((stats.revenueYTD / stats.revenueTarget) * 100)
  const monthlyTarget = Math.round(stats.revenueTarget / 12)

  return (
    <div className="animate-in">
      <PageHeader
        title="Dashboard"
        subtitle={`${formatDate(new Date(), 'EEEE, MMMM d yyyy')}`}
        actions={
          <button className="btn btn-primary">
            <ArrowUpRight size={14} />
            New Lead
          </button>
        }
      />

      <div className="px-8 py-6 space-y-6">

        {/* ── Key metrics ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Revenue YTD"
            value={formatCurrency(stats.revenueYTD)}
            sub={`Target ${formatCurrency(stats.revenueTarget)}`}
            icon={TrendingUp}
            accent
            trend={{ value: 12, label: 'vs last year' }}
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
            sub={`${pipeline.length} active leads`}
            icon={Users}
          />
          <StatCard
            label="Team Utilization"
            value={`${stats.teamUtilization}%`}
            sub="This month"
            icon={Clock}
            trend={{ value: 4, label: 'vs last month' }}
          />
        </div>

        {/* ── Revenue progress bar ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title">Annual Revenue Progress</span>
            <span className="font-mono text-xs text-mx-dim">
              {formatCurrency(stats.revenueYTD)} / {formatCurrency(stats.revenueTarget)}
            </span>
          </div>
          <ProgressBar
            value={revenueProgress}
            color={revenueProgress >= 90 ? 'green' : revenueProgress >= 60 ? 'blue' : 'amber'}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-mx-mid">{revenueProgress}% of annual target</span>
            <span className="text-xs text-mx-mid">
              {formatCurrency(stats.revenueTarget - stats.revenueYTD)} remaining
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
              {revenueByMonth.map((d) => {
                const h = Math.round((d.amount / maxRevenue) * 100)
                const isCurrent = d.month === 'Feb'
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-2xs font-mono text-mx-mid">{formatCurrency(d.amount, 'EUR', 'de-DE').replace('€', '').trim()}k</div>
                    <div className="w-full relative" style={{ height: '72px', display: 'flex', alignItems: 'flex-end' }}>
                      <div
                        className="w-full rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: isCurrent ? '#3D8EF0' : '#1E1E24',
                          border: isCurrent ? '1px solid #3D8EF040' : '1px solid #2A2A32',
                        }}
                      />
                    </div>
                    <div className={`text-2xs ${isCurrent ? 'text-mx-accent' : 'text-mx-mid'}`}>{d.month}</div>
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
              {stats.overdueInvoices > 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#EF444410', border: '1px solid #EF444425' }}>
                  <AlertCircle size={13} className="text-mx-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-red">{stats.overdueInvoices} overdue invoices</p>
                    <p className="text-2xs text-mx-mid mt-0.5">Follow up required</p>
                  </div>
                </div>
              )}
              {stats.totalUnbilled > 0 && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#F59E0B10', border: '1px solid #F59E0B25' }}>
                  <Receipt size={13} className="text-mx-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-mx-amber">{formatCurrency(stats.totalUnbilled)} unbilled</p>
                    <p className="text-2xs text-mx-mid mt-0.5">Ready to invoice</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: '#22C55E10', border: '1px solid #22C55E25' }}>
                <CheckCircle2 size={13} className="text-mx-green flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-mx-green">3 projects on track</p>
                  <p className="text-2xs text-mx-mid mt-0.5">No blockers detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active projects ── */}
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
                <th>Progress</th>
                <th>Budget</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((p) => {
                const budgetPct = Math.round((p.spent / p.budget) * 100)
                const budgetColor = budgetPct > 95 ? 'red' : budgetPct > 80 ? 'amber' : 'green'
                return (
                  <tr key={p.id}>
                    <td className="font-medium text-mx-light">{p.name}</td>
                    <td className="text-mx-dim">{p.client}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Avatar name={p.engineer} size="sm" />
                        <span className="text-mx-dim">{p.engineer}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={p.progress} className="flex-1" />
                        <span className="font-mono text-2xs text-mx-mid w-7">{p.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className={`font-mono text-xs text-mx-${budgetColor}`}>
                          {formatCurrency(p.spent)}
                        </span>
                        <span className="text-mx-subtle text-2xs"> / {formatCurrency(p.budget)}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-mx-dim">{formatDate(p.dueDate, 'MMM d')}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pipeline + Activity ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pipeline */}
          <div className="card p-5">
            <div className="section-header">
              <span className="section-title">Pipeline</span>
              <a href="/crm" className="text-xs text-mx-accent hover:underline">Open CRM</a>
            </div>
            <div className="space-y-2">
              {pipeline.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors"
                  style={{ background: '#111114', border: '1px solid #1E1E24' }}
                >
                  <div>
                    <p className="text-xs font-medium text-mx-light">{lead.company}</p>
                    <p className="text-2xs text-mx-mid mt-0.5">{lead.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={lead.stage} />
                    <span className="font-mono text-xs text-mx-light">{formatCurrency(lead.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card p-5">
            <div className="section-header">
              <span className="section-title">Recent Activity</span>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1 h-1 rounded-full bg-mx-border flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-mx-dim leading-relaxed">{a.text}</p>
                  </div>
                  <span className="text-2xs text-mx-subtle flex-shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
