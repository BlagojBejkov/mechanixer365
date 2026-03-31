'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import { updateUserRate, inviteTeamMember } from '@/lib/actions/settings'

type TeamMember = { id: string; name: string; email: string; role: string }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
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

export default function SettingsForm({ team }: { team: TeamMember[] }) {
  const [rates, setRates] = useState<Record<string, string>>({})
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function getRateForUser(id: string, fallback?: string) {
    return rates[id] ?? fallback ?? ''
  }

  function handleSave() {
    startTransition(async () => {
      // Save each rate that was changed
      for (const [userId, rate] of Object.entries(rates)) {
        const numeric = parseFloat(rate.replace(/[^0-9.]/g, ''))
        if (!isNaN(numeric)) {
          await updateUserRate(userId, numeric)
        }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    })
  }

  function handleInvite() {
    if (!inviteEmail.trim() || !inviteName.trim()) return
    startTransition(async () => {
      await inviteTeamMember(inviteName.trim(), inviteEmail.trim())
      setInviteEmail('')
      setInviteName('')
      setShowInvite(false)
      router.refresh()
    })
  }

  return (
    <>
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
          <div key={member.id} className="px-5 py-4 flex items-center gap-4">
            <Avatar name={member.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-mx-light font-medium">{member.name}</p>
              <p className="text-xs text-mx-mid">{member.email} · {member.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-mx-mid">Rate:</span>
              <input
                className="mx-input w-24 font-mono text-xs"
                placeholder="€/h"
                value={getRateForUser(member.id)}
                onChange={e => setRates(prev => ({ ...prev, [member.id]: e.target.value }))}
              />
            </div>
          </div>
        ))}
        {showInvite ? (
          <div className="px-5 py-4 flex items-center gap-3">
            <input
              className="mx-input flex-1 text-xs"
              placeholder="Name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
            />
            <input
              className="mx-input flex-1 text-xs"
              placeholder="Email"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
            <button onClick={handleInvite} disabled={isPending} className="btn btn-primary text-xs">
              Add
            </button>
            <button onClick={() => setShowInvite(false)} className="btn btn-ghost text-xs">
              Cancel
            </button>
          </div>
        ) : (
          <div className="px-5 py-3">
            <button onClick={() => setShowInvite(true)} className="btn btn-ghost text-xs">
              + Invite Team Member
            </button>
          </div>
        )}
      </Section>

      <Section title="Client Portal">
        <SettingRow label="Portal Domain" description="Where clients access their portal">
          <input className="mx-input w-56 font-mono text-xs" defaultValue="365.mechanixer.com/portal" readOnly />
        </SettingRow>
        <SettingRow label="Portal Branding" description="Company name shown to clients">
          <input className="mx-input w-48" defaultValue="Mechanixer" />
        </SettingRow>
      </Section>

      <div className="flex justify-end items-center gap-3">
        {saved && <span className="text-xs text-green-400">✓ Saved</span>}
        <button onClick={handleSave} disabled={isPending} className="btn btn-primary">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  )
}
