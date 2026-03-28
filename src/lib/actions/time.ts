'use server'

import { db } from '@/lib/db'
import { timeEntries, users } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const LogTimeSchema = z.object({
  projectId:   z.string().min(1),
  taskId:      z.string().optional(),
  engineerName: z.string().min(1), // We look up by name until auth is wired
  date:        z.string(),
  hours:       z.coerce.number().min(0.25).max(24),
  description: z.string().optional(),
  billable:    z.string().optional(), // checkbox sends 'on' or nothing
})

export async function logTime(formData: FormData) {
  const raw = {
    projectId:    formData.get('projectId'),
    taskId:       formData.get('taskId') || undefined,
    engineerName: formData.get('engineerName'),
    date:         formData.get('date'),
    hours:        formData.get('hours'),
    description:  formData.get('description') || undefined,
    billable:     formData.get('billable'),
  }

  const parsed = LogTimeSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  // Look up user by name
  const user = await db.query.users.findFirst({
    where: eq(users.name, parsed.data.engineerName),
  })
  if (!user) return { error: 'Engineer not found' }

  await db.insert(timeEntries).values({
    userId:      user.id,
    projectId:   parsed.data.projectId,
    taskId:      parsed.data.taskId,
    date:        new Date(parsed.data.date),
    hours:       parsed.data.hours,
    description: parsed.data.description,
    billable:    parsed.data.billable === 'on',
  })

  revalidatePath('/time')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateTimeEntry(id: string, data: { hours?: number; description?: string; billable?: boolean }) {
  await db.update(timeEntries).set({ ...data, updatedAt: new Date() }).where(eq(timeEntries.id, id))
  revalidatePath('/time')
  return { success: true }
}

export async function deleteTimeEntry(id: string) {
  await db.delete(timeEntries).where(eq(timeEntries.id, id))
  revalidatePath('/time')
  return { success: true }
}
