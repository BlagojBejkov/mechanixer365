'use server'

import { db } from '@/lib/db'
import { projects, tasks, milestones } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateProjectSchema = z.object({
  clientId:     z.string().min(1),
  name:         z.string().min(1),
  description:  z.string().optional(),
  type:         z.enum(['fixed_price', 'retainer', 'time_and_materials']),
  budgetHours:  z.coerce.number().optional(),
  budgetAmount: z.coerce.number().optional(),
  hourlyRate:   z.coerce.number().optional(),
  startDate:    z.string().optional(),
  endDate:      z.string().optional(),
  leadEngineer: z.string().optional(),
  internalNotes: z.string().optional(),
})

export async function createProject(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = CreateProjectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { startDate, endDate, ...rest } = parsed.data
  const result = await db.insert(projects).values({
    ...rest,
    status: 'scoping',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate:   endDate   ? new Date(endDate)   : undefined,
  }).returning({ id: projects.id })

  revalidatePath('/projects')
  return { success: true, id: result[0].id }
}

export async function updateProjectStatus(
  id: string,
  status: typeof projects.$inferSelect['status']
) {
  await db.update(projects).set({ status, updatedAt: new Date() }).where(eq(projects.id, id))
  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { success: true }
}

export async function createTask(data: {
  projectId: string
  milestoneId?: string
  assignedTo?: string
  title: string
  description?: string
  estimatedHours?: number
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
}) {
  const result = await db.insert(tasks).values({
    ...data,
    status: 'todo',
  }).returning({ id: tasks.id })

  revalidatePath(`/projects/${data.projectId}`)
  return { success: true, id: result[0].id }
}

export async function updateTaskStatus(
  id: string,
  projectId: string,
  status: typeof tasks.$inferSelect['status']
) {
  await db.update(tasks).set({
    status,
    updatedAt: new Date(),
    completedAt: status === 'done' ? new Date() : undefined,
  }).where(eq(tasks.id, id))

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function createMilestone(data: {
  projectId: string
  name: string
  description?: string
  dueDate?: Date
  order?: number
}) {
  await db.insert(milestones).values({ ...data, status: 'pending' })
  revalidatePath(`/projects/${data.projectId}`)
  return { success: true }
}
