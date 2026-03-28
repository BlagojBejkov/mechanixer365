'use server'

import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateLeadSchema = z.object({
  companyName:    z.string().min(1),
  contactName:    z.string().min(1),
  contactEmail:   z.string().email(),
  contactPhone:   z.string().optional(),
  country:        z.string().optional(),
  industry:       z.string().optional(),
  estimatedValue: z.coerce.number().optional(),
  probability:    z.coerce.number().min(0).max(100).default(20),
  source:         z.string().optional(),
  notes:          z.string().optional(),
  nextAction:     z.string().optional(),
  nextActionDate: z.string().optional(),
})

export async function createLead(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = CreateLeadSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { nextActionDate, ...rest } = parsed.data
  await db.insert(leads).values({
    ...rest,
    stage: 'new',
    nextActionDate: nextActionDate ? new Date(nextActionDate) : undefined,
  })

  revalidatePath('/crm')
  return { success: true }
}

export async function updateLeadStage(id: string, stage: typeof leads.$inferSelect['stage']) {
  await db.update(leads).set({ stage, updatedAt: new Date() }).where(eq(leads.id, id))
  revalidatePath('/crm')
  return { success: true }
}

export async function updateLead(id: string, data: Partial<typeof leads.$inferInsert>) {
  await db.update(leads).set({ ...data, updatedAt: new Date() }).where(eq(leads.id, id))
  revalidatePath('/crm')
  return { success: true }
}

export async function deleteLead(id: string) {
  await db.delete(leads).where(eq(leads.id, id))
  revalidatePath('/crm')
  return { success: true }
}
