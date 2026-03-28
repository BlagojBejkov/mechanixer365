'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderKanban, Clock,
  BarChart2, Receipt, Settings, LogOut,
  ChevronRight, Zap
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { logoutAction } from '@/lib/actions/auth'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm',        label: 'CRM',       icon: Users },
  { href: '/projects',   label: 'Projects',  icon: FolderKanban },
  { href: '/time',       label: 'Time',      icon: Clock },
  { href: '/capacity',   label: 'Capacity',  icon: BarChart2 },
  { href: '/finance',    label: 'Finance',   icon: Receipt },
]

interface AppShellProps {
  children: React.ReactNode
  user?: { name: string; email: string; role: string }
}

export default function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await logoutAction()
    router.push('/login')
    router.refresh()
  }

  const initials = user ? getInitials(user.name) : 'MX'

  return (
    <div className="flex h-screen bg-mx-black overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-[200px] flex-shrink-0 flex flex-col"
        style={{ background: '#111114', borderRight: '1px solid #1E1E24' }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1E1E24' }}>
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: '#3D8EF015', border: '1px solid #3D8EF030' }}
          >
            <Zap size={13} className="text-mx-accent" />
          </div>
          <div>
            <div className="font-display text-mx-white font-semibold text-sm leading-none">Mechanixer</div>
            <div className="text-mx-mid text-xs mt-0.5">365</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={cn('nav-item', active && 'active')}>
                <Icon size={15} />
                <span>{label}</span>
                {active && <ChevronRight size={12} className="ml-auto text-mx-border" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid #1E1E24' }}>
          <Link href="/settings" className={cn('nav-item', pathname === '/settings' && 'active')}>
            <Settings size={15} />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="nav-item w-full text-left hover:text-mx-red hover:bg-red-950/20"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>

        {/* User chip */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid #1E1E24' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: '#3D8EF020', color: '#3D8EF0', border: '1px solid #3D8EF030' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-mx-light text-xs font-medium truncate">{user?.name ?? 'Mechanixer'}</div>
              <div className="text-mx-mid text-2xs truncate capitalize">{user?.role ?? 'team'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
