import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { milestones } from '@/lib/db/schema'
import { like, eq } from 'drizzle-orm'

export async function GET() {
  // Delete debug test milestones from prj_conveyor
  const deleted = await db.delete(milestones)
    .where(eq(milestones.projectId, 'prj_conveyor'))
    .returning({ id: milestones.id, name: milestones.name })
  return NextResponse.json({ deleted })
}
