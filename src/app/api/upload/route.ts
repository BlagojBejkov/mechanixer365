import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { files } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth'
import { createId } from '@paralleldrive/cuid2'

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`projects/${projectId}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    // Save metadata to DB
    const fileId = createId()
    await db.insert(files).values({
      id: fileId,
      projectId,
      uploadedBy: (session as any)?.user?.id ?? null,
      name: file.name,
      url: blob.url,
      size: file.size,
      mimeType: file.type,
    })

    return NextResponse.json({ success: true, id: fileId, url: blob.url, name: file.name, size: file.size })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
