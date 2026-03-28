import { getInitials, cn } from '@/lib/utils'

const COLORS = [
  { bg: '#3D8EF015', text: '#3D8EF0', border: '#3D8EF030' },
  { bg: '#22C55E15', text: '#22C55E', border: '#22C55E30' },
  { bg: '#8B5CF615', text: '#8B5CF6', border: '#8B5CF630' },
  { bg: '#F59E0B15', text: '#F59E0B', border: '#F59E0B30' },
  { bg: '#EF444415', text: '#EF4444', border: '#EF444430' },
]

function colorForName(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'w-6 h-6 text-2xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export default function Avatar({ name, size = 'md', className }: AvatarProps) {
  const color = colorForName(name)
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', SIZES[size], className)}
      style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
