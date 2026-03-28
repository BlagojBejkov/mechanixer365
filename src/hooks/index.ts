'use client'

import { useEffect, useState } from 'react'
import { useTimerStore } from '@/store'

export function useElapsedTimer() {
  const elapsed = useTimerStore(s => s.elapsed)
  const active  = useTimerStore(s => s.active)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) { setSeconds(0); return }
    setSeconds(elapsed())
    const id = setInterval(() => setSeconds(elapsed()), 1000)
    return () => clearInterval(id)
  }, [active, elapsed])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return {
    formatted: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    seconds,
    isRunning: !!active,
    projectName: active?.projectName,
  }
}

export function useCapacityData(engineers: string[], weeks: string[]) {
  // Returns utilization color based on percentage
  function utilizationColor(pct: number): string {
    if (pct > 100) return '#EF4444'
    if (pct >= 90)  return '#F59E0B'
    if (pct >= 70)  return '#3D8EF0'
    return '#22C55E'
  }

  return { utilizationColor }
}
