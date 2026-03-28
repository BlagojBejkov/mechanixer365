import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn('px-8 py-5 flex items-center justify-between', className)}
      style={{ borderBottom: '1px solid #1E1E24' }}
    >
      <div>
        <h1 className="font-display text-lg font-semibold text-mx-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-mx-mid text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
