'use server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createId } from '@paralleldrive/cuid2'
import bcrypt from 'bcryptjs'

export async function updateUserRate(userId: string, rate: number) {
  await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId))
  revalidatePath('/settings')
  return { success: true }
}

export async function inviteTeamMember(name: string, email: string) {
  const tempPassword = await bcrypt.hash('changeme123', 10)
  await db.insert(users).values({
    id: createId(),
    name,
    email,
    role: 'engineer',
    passwordHash: tempPassword,
  })
  revalidatePath('/settings')
  return { success: true }
}
