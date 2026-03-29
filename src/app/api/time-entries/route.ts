import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { timeEntries, projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { createId } from '@paralleldrive/cuid2'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await req.json()
    const { projectId, date, hours, description, billable } = body

    // Validate
    if (!projectId || !date || !hours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const h = parseFloat(hours)
    if (isNaN(h) || h <= 0 || h > 24) {
      return NextResponse.json({ error: 'Invalid hours value' }, { status: 400 })
    }

    // Verify project exists
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse date string (YYYY-MM-DD) → Date object (stored as unix timestamp seconds)
    const dateObj = new Date(date + 'T12:00:00.000Z')

    const [entry] = await db.insert(timeEntries).values({
      id: createId(),
      userId: session.user.id,
      projectId,
      date: dateObj,
      hours: h,
      description: description || null,
      billable: billable !== false,
      billed: false,
      hourlyRate: project.hourlyRate ?? null,
    }).returning()

    return NextResponse.json({ success: true, entry })
  } catch (err: any) {
    console.error('POST /api/time-entries error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
