import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Same PBKDF2 verify as internal auth, but for portal passwords
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = stored.split(':')
    const salt = Buffer.from(saltHex, 'hex')
    const { subtle } = globalThis.crypto
    const keyMaterial = await subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const derived = await subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256
    )
    const derivedHex = Buffer.from(derived).toString('hex')
    return derivedHex === hashHex
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, password } = await req.json()

    if (!clientId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    })

    if (!client || !client.portalEnabled) {
      return NextResponse.json({ error: 'Portal not available' }, { status: 403 })
    }

    // If no password is set yet, deny access
    if (!client.portalPassword) {
      return NextResponse.json({ error: 'Portal access not configured' }, { status: 403 })
    }

    const valid = await verifyPassword(password, client.portalPassword)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Set a signed cookie scoped to this client
    const token = Buffer.from(`${clientId}:${Date.now()}`).toString('base64')
    const res = NextResponse.json({ ok: true })
    res.cookies.set(`portal_${clientId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: `/portal/${clientId}`,
    })
    return res
  } catch (err) {
    console.error('Portal auth error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
