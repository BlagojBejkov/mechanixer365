'use server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createId } from '@paralleldrive/cuid2'
import { createHash } from 'crypto'

export async function updateUserRate(userId: string, rate: number) {
  await db.update(users)
    .set({ billableRate: rate, updatedAt: new Date() })
    .where(eq(users.id, userId))
  revalidatePath('/settings')
  return { success: true }
}

export async function inviteTeamMember(name: string, email: string) {
  // Temp password: "changeme123" — user must change on first login
  const tempHash = createHash('sha256').update('changeme123').digest('hex')
  await db.insert(users).values({
    id: createId(),
    name,
    email,
    role: 'engineer',
    passwordHash: tempHash,
  })
  revalidatePath('/settings')
  return { success: true }
}
