import { db } from '@/lib/db'
import { users, sessions } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { createId } from '@paralleldrive/cuid2'

const SESSION_COOKIE = 'mx365_session'
const SESSION_DURATION_DAYS = 30

// ── Password hashing (no bcrypt — pure Web Crypto, works everywhere) ──

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  const hash = new Uint8Array(bits)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = stored.split(':')
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)))
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    )
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial, 256
    )
    const hash = new Uint8Array(bits)
    const computedHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('')
    return computedHex === hashHex
  } catch {
    return false
  }
}

// ── Session management ────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = createId() + createId() // 48-char random token
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  await db.insert(sessions).values({ userId, token, expiresAt })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.token, token),
      gt(sessions.expiresAt, new Date())
    ),
    with: { user: true },
  })

  return session ?? null
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }
  return session
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token))
    cookieStore.delete(SESSION_COOKIE)
  }
}

// ── Login ─────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ success: true } | { error: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  })

  if (!user || !user.passwordHash) {
    return { error: 'Invalid email or password' }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: 'Invalid email or password' }
  }

  await createSession(user.id)
  return { success: true }
}

// ── Set password (used in setup/seed) ────────────────

export async function setPassword(userId: string, password: string) {
  const hash = await hashPassword(password)
  await db.update(users).set({ passwordHash: hash }).where(eq(users.id, userId))
}

export { hashPassword }
