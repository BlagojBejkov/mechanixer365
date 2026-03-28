import type { Metadata } from 'next'

import PageHeader from '@/components/layout/PageHeader'
import Avatar from '@/components/ui/Avatar'

export const metadata: Metadata = { title: 'Settings' }

const team = [
  { name: 'Blagoj', email: 'blagoj@mechanixer.com', role: 'Owner', billableRate: 120 },
  { name: 'Tomche', email: 'tomche@mechanixer.com', role: 'Engineer', billableRate: 95 },
  { name: 'Katerina', email: 'katerina@mechanixer.com', role: 'Engineer', billableRate: 95 },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="section-title mb-4">{title}</p>
      <div className="card divide-y divide-mx-muted">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-6">
      <div>
        <p className="text-sm text-mx-light font-medium">{label}</p>
        {description && <p className="text-xs text-mx-mid mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    
      <div className="animate-in">
        <PageHeader title="Settings" subtitle="Company, team & billing configuration" />

        <div className="px-8 py-6 max-w-2xl space-y-8">

          <Section title="Company">
            <SettingRow label="Company Name" description="Used in invoices and the client portal">
              <input className="mx-input w-48" defaultValue="Mechanixer" />
            </SettingRow>
            <SettingRow label="Default Currency">
              <select className="mx-input w-28">
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
              </select>
            </SettingRow>
            <SettingRow label="Annual Revenue Target" description="Shown on the owner dashboard">
              <input className="mx-input w-36 font-mono" defaultValue="450000" />
            </SettingRow>
            <SettingRow label="Default Invoice Terms (days)">
              <input className="mx-input w-20 font-mono" defaultValue="30" />
            </SettingRow>
            <SettingRow label="Default VAT Rate (%)" description="Set 0 for international B2B">
              <input className="mx-input w-20 font-mono" defaultValue="0" />
            </SettingRow>
          </Section>

          <Section title="Team">
            {team.map(member => (
              <div key={member.name} className="px-5 py-4 flex items-center gap-4">
                <Avatar name={member.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-mx-light font-medium">{member.name}</p>
                  <p className="text-xs text-mx-mid">{member.email} · {member.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mx-mid">Rate:</span>
                  <input
                    className="mx-input w-24 font-mono text-xs"
                    defaultValue={`€${member.billableRate}/h`}
                  />
                </div>
              </div>
            ))}
            <div className="px-5 py-3">
              <button className="btn btn-ghost text-xs">+ Invite Team Member</button>
            </div>
          </Section>

          <Section title="Client Portal">
            <SettingRow label="Portal Domain" description="Where clients access their portal">
              <input className="mx-input w-56 font-mono text-xs" defaultValue="365.mechanixer.com/portal" readOnly />
            </SettingRow>
            <SettingRow label="Portal Branding" description="Company name shown to clients">
              <input className="mx-input w-48" defaultValue="Mechanixer" />
            </SettingRow>
          </Section>

          <div className="flex justify-end">
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    
  )
}
