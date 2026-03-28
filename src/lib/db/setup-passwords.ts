/**
 * Run ONCE to set passwords for all team members:
 * npx tsx src/lib/db/setup-passwords.ts
 *
 * Change the passwords below before running!
 */
import { db } from './index'
import { users } from './schema'
import { hashPassword } from '../auth'
import { eq } from 'drizzle-orm'
import { config } from 'dotenv'
config({ path: '.env.local' })

// ── SET YOUR PASSWORDS HERE ──────────────────────────
const PASSWORDS: Record<string, string> = {
  'blagoj@mechanixer.com':   'blagoj2026!',   // ← Change this
  'tomche@mechanixer.com':   'tomche2026!',    // ← Change this
  'katerina@mechanixer.com': 'katerina2026!',  // ← Change this
}
// ─────────────────────────────────────────────────────

async function setupPasswords() {
  console.log('🔐 Setting up passwords...\n')

  for (const [email, password] of Object.entries(PASSWORDS)) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) })

    if (!user) {
      console.log(`⚠  User not found: ${email} — run seed.ts first`)
      continue
    }

    const hash = await hashPassword(password)
    await db.update(users).set({ passwordHash: hash }).where(eq(users.id, user.id))
    console.log(`✓  Password set for ${user.name} (${email})`)
  }

  console.log('\n✅ Done. You can now log in at http://localhost:3000/login')
  console.log('⚠  Remember to change the default passwords after first login!')
}

setupPasswords().catch(console.error)
