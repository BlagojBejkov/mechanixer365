import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ActiveTimer {
  projectId:   string
  projectName: string
  taskId?:     string
  taskName?:   string
  userId:      string
  startedAt:   number // unix ms
}

interface TimerStore {
  active: ActiveTimer | null
  start: (timer: ActiveTimer) => void
  stop: () => { hours: number } | null
  elapsed: () => number // seconds
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      active: null,

      start: (timer) => set({ active: timer }),

      stop: () => {
        const { active } = get()
        if (!active) return null
        const hours = (Date.now() - active.startedAt) / 1000 / 3600
        set({ active: null })
        return { hours: Math.round(hours * 4) / 4 } // round to nearest 15m
      },

      elapsed: () => {
        const { active } = get()
        if (!active) return 0
        return Math.floor((Date.now() - active.startedAt) / 1000)
      },
    }),
    { name: 'mx-timer' }
  )
)

// ── UI store: open/close modals, panels ────────────────
interface UIStore {
  logTimeOpen:   boolean
  newLeadOpen:   boolean
  newProjectOpen: boolean
  openLogTime:   () => void
  closeLogTime:  () => void
  openNewLead:   () => void
  closeNewLead:  () => void
  openNewProject: () => void
  closeNewProject: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  logTimeOpen:    false,
  newLeadOpen:    false,
  newProjectOpen: false,
  openLogTime:    () => set({ logTimeOpen: true }),
  closeLogTime:   () => set({ logTimeOpen: false }),
  openNewLead:    () => set({ newLeadOpen: true }),
  closeNewLead:   () => set({ newLeadOpen: false }),
  openNewProject: () => set({ newProjectOpen: true }),
  closeNewProject: () => set({ newProjectOpen: false }),
}))
