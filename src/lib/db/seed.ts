/**
 * Run once: npx tsx src/lib/db/seed.ts
 * Seeds team users and minimal sample data.
 */
import { db } from './index'
import { users, clients, projects, milestones } from './schema'

async function seed() {
  console.log('🌱 Seeding Mechanixer 365...')

  // ── Team users ────────────────────────────────────
  const team = await db.insert(users).values([
    {
      email: 'blagoj@mechanixer.com',
      name:  'Blagoj',
      role:  'owner',
    },
    {
      email: 'tomche@mechanixer.com',
      name:  'Tomche',
      role:  'engineer',
    },
    {
      email: 'katerina@mechanixer.com',
      name:  'Katerina',
      role:  'engineer',
    },
  ]).returning()

  console.log(`✓ Created ${team.length} users`)

  // ── Sample client ─────────────────────────────────
  const [autoLine] = await db.insert(clients).values({
    companyName:   'AutoLine GmbH',
    contactName:   'Hans Weber',
    contactEmail:  'h.weber@autoline.de',
    country:       'DE',
    industry:      'Industrial automation',
    currency:      'EUR',
    retainerActive: false,
    portalEnabled:  true,
    status:        'active',
  }).returning()

  console.log(`✓ Created sample client: AutoLine GmbH`)

  // ── Sample project ────────────────────────────────
  const tomche = team.find(u => u.name === 'Tomche')!

  const [project] = await db.insert(projects).values({
    clientId:      autoLine.id,
    name:          'Conveyor System Redesign',
    description:   'Full mechanical redesign of main production line conveyor including drive system and frame.',
    type:          'fixed_price',
    status:        'active',
    budgetHours:   300,
    budgetAmount:  24000,
    hourlyRate:    80,
    startDate:     new Date('2025-01-06'),
    endDate:       new Date('2025-03-15'),
    leadEngineer:  tomche.id,
    portalVisible: true,
    clientNotes:   'Phase 2 CAD work is progressing on schedule.',
  }).returning()

  // ── Sample milestones ─────────────────────────────
  await db.insert(milestones).values([
    { projectId: project.id, name: 'Requirements & Scope',          status: 'completed',   order: 0, dueDate: new Date('2025-01-15'), completedAt: new Date('2025-01-14') },
    { projectId: project.id, name: 'Concept Design',               status: 'completed',   order: 1, dueDate: new Date('2025-01-31'), completedAt: new Date('2025-01-30') },
    { projectId: project.id, name: 'Detail CAD — Drive System',    status: 'completed',   order: 2, dueDate: new Date('2025-02-14'), completedAt: new Date('2025-02-14') },
    { projectId: project.id, name: 'Detail CAD — Frame Assembly',  status: 'in_progress', order: 3, dueDate: new Date('2025-03-01') },
    { projectId: project.id, name: 'BOM & Manufacturing Drawings', status: 'pending',     order: 4, dueDate: new Date('2025-03-15') },
  ])

  console.log(`✓ Created sample project with milestones`)
  console.log('\n✅ Seed complete. Run `npm run dev` to start.')
}

seed().catch(console.error)
