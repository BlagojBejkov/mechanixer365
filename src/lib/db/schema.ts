import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// ─────────────────────────────────────────────
// USERS (internal team)
// ─────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  email:     text('email').notNull().unique(),
  name:      text('name').notNull(),
  role:      text('role', { enum: ['owner', 'engineer'] }).notNull().default('engineer'),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// LEADS (CRM pipeline)
// ─────────────────────────────────────────────
export const leads = sqliteTable('leads', {
  id:             text('id').primaryKey().$defaultFn(() => createId()),
  companyName:    text('company_name').notNull(),
  contactName:    text('contact_name').notNull(),
  contactEmail:   text('contact_email').notNull(),
  contactPhone:   text('contact_phone'),
  country:        text('country'),
  industry:       text('industry'), // CNC machine builder, automation, etc.
  stage:          text('stage', {
    enum: ['new', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']
  }).notNull().default('new'),
  estimatedValue: real('estimated_value'), // EUR
  probability:    integer('probability').default(50), // 0-100%
  source:         text('source'), // referral, linkedin, conference, etc.
  notes:          text('notes'),
  assignedTo:     text('assigned_to').references(() => users.id),
  nextAction:     text('next_action'),
  nextActionDate: integer('next_action_date', { mode: 'timestamp' }),
  lostReason:     text('lost_reason'),
  createdAt:      integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:      integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// CLIENTS (converted leads)
// ─────────────────────────────────────────────
export const clients = sqliteTable('clients', {
  id:              text('id').primaryKey().$defaultFn(() => createId()),
  leadId:          text('lead_id').references(() => leads.id), // origin lead
  companyName:     text('company_name').notNull(),
  contactName:     text('contact_name').notNull(),
  contactEmail:    text('contact_email').notNull(),
  contactPhone:    text('contact_phone'),
  country:         text('country'),
  industry:        text('industry'),
  timezone:        text('timezone').default('UTC'),
  billingAddress:  text('billing_address'),
  vatNumber:       text('vat_number'),
  currency:        text('currency').default('EUR'),
  // Retainer config
  retainerActive:  integer('retainer_active', { mode: 'boolean' }).default(false),
  retainerHours:   integer('retainer_hours'), // contracted hours/month
  retainerRate:    real('retainer_rate'), // EUR/hour
  // Portal access
  portalEnabled:   integer('portal_enabled', { mode: 'boolean' }).default(false),
  portalPassword:  text('portal_password_hash'),
  notes:           text('notes'),
  status:          text('status', { enum: ['active', 'paused', 'closed'] }).default('active'),
  createdAt:       integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:       integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  clientId:      text('client_id').notNull().references(() => clients.id),
  name:          text('name').notNull(),
  description:   text('description'),
  type:          text('type', {
    enum: ['fixed_price', 'retainer', 'time_and_materials']
  }).notNull().default('fixed_price'),
  status:        text('status', {
    enum: ['scoping', 'active', 'on_hold', 'review', 'completed', 'cancelled']
  }).notNull().default('scoping'),
  // Financials
  budgetHours:   integer('budget_hours'),
  budgetAmount:  real('budget_amount'), // EUR
  hourlyRate:    real('hourly_rate'), // EUR — overrides client default
  // Dates
  startDate:     integer('start_date', { mode: 'timestamp' }),
  endDate:       integer('end_date', { mode: 'timestamp' }),
  // Ownership
  leadEngineer:  text('lead_engineer').references(() => users.id),
  // Client portal
  portalVisible: integer('portal_visible', { mode: 'boolean' }).default(true),
  clientNotes:   text('client_notes'), // visible in portal
  internalNotes: text('internal_notes'), // never shown to client
  createdAt:     integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// PROJECT MILESTONES
// ─────────────────────────────────────────────
export const milestones = sqliteTable('milestones', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  projectId:   text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  description: text('description'),
  status:      text('status', { enum: ['pending', 'in_progress', 'completed'] }).default('pending'),
  dueDate:     integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  order:       integer('order').default(0),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────
export const tasks = sqliteTable('tasks', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  projectId:    text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestoneId:  text('milestone_id').references(() => milestones.id),
  assignedTo:   text('assigned_to').references(() => users.id),
  title:        text('title').notNull(),
  description:  text('description'),
  status:       text('status', {
    enum: ['todo', 'in_progress', 'review', 'done']
  }).notNull().default('todo'),
  priority:     text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
  estimatedHours: real('estimated_hours'),
  dueDate:      integer('due_date', { mode: 'timestamp' }),
  completedAt:  integer('completed_at', { mode: 'timestamp' }),
  order:        integer('order').default(0),
  createdAt:    integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:    integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// TIME ENTRIES (core finance driver)
// ─────────────────────────────────────────────
export const timeEntries = sqliteTable('time_entries', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  userId:      text('user_id').notNull().references(() => users.id),
  projectId:   text('project_id').notNull().references(() => projects.id),
  taskId:      text('task_id').references(() => tasks.id),
  date:        integer('date', { mode: 'timestamp' }).notNull(),
  hours:       real('hours').notNull(),
  description: text('description'),
  billable:    integer('billable', { mode: 'boolean' }).default(true),
  billed:      integer('billed', { mode: 'boolean' }).default(false), // marked when invoiced
  invoiceId:   text('invoice_id'), // set when invoiced
  hourlyRate:  real('hourly_rate'), // snapshot of rate at time of logging
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────
export const quotes = sqliteTable('quotes', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  clientId:    text('client_id').notNull().references(() => clients.id),
  leadId:      text('lead_id').references(() => leads.id),
  number:      text('number').notNull().unique(), // Q-2025-001
  title:       text('title').notNull(),
  status:      text('status', {
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired']
  }).notNull().default('draft'),
  validUntil:  integer('valid_until', { mode: 'timestamp' }),
  currency:    text('currency').default('EUR'),
  subtotal:    real('subtotal').notNull().default(0),
  tax:         real('tax').default(0),
  total:       real('total').notNull().default(0),
  notes:       text('notes'),
  terms:       text('terms'),
  sentAt:      integer('sent_at', { mode: 'timestamp' }),
  acceptedAt:  integer('accepted_at', { mode: 'timestamp' }),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const quoteLineItems = sqliteTable('quote_line_items', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  quoteId:     text('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity:    real('quantity').notNull().default(1),
  unit:        text('unit').default('hours'),
  unitPrice:   real('unit_price').notNull(),
  total:       real('total').notNull(),
  order:       integer('order').default(0),
})

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────
export const invoices = sqliteTable('invoices', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  clientId:    text('client_id').notNull().references(() => clients.id),
  projectId:   text('project_id').references(() => projects.id),
  quoteId:     text('quote_id').references(() => quotes.id),
  number:      text('number').notNull().unique(), // INV-2025-001
  title:       text('title').notNull(),
  status:      text('status', {
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled']
  }).notNull().default('draft'),
  issueDate:   integer('issue_date', { mode: 'timestamp' }).notNull(),
  dueDate:     integer('due_date', { mode: 'timestamp' }).notNull(),
  paidDate:    integer('paid_date', { mode: 'timestamp' }),
  currency:    text('currency').default('EUR'),
  subtotal:    real('subtotal').notNull().default(0),
  tax:         real('tax').default(0),
  total:       real('total').notNull().default(0),
  notes:       text('notes'),
  terms:       text('terms'),
  // Portal visibility
  portalVisible: integer('portal_visible', { mode: 'boolean' }).default(true),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const invoiceLineItems = sqliteTable('invoice_line_items', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  invoiceId:   text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity:    real('quantity').notNull().default(1),
  unit:        text('unit').default('hours'),
  unitPrice:   real('unit_price').notNull(),
  total:       real('total').notNull(),
  order:       integer('order').default(0),
})

// ─────────────────────────────────────────────
// FILES / DELIVERABLES
// ─────────────────────────────────────────────
export const files = sqliteTable('files', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  projectId:   text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  uploadedBy:  text('uploaded_by').references(() => users.id),
  name:        text('name').notNull(),
  url:         text('url').notNull(),
  size:        integer('size'), // bytes
  mimeType:    text('mime_type'),
  category:    text('category', {
    enum: ['deliverable', 'reference', 'contract', 'other']
  }).default('deliverable'),
  portalVisible: integer('portal_visible', { mode: 'boolean' }).default(true),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  timeEntries: many(timeEntries),
  tasks: many(tasks),
  leads: many(leads),
}))

export const leadsRelations = relations(leads, ({ one }) => ({
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  lead: one(leads, { fields: [clients.leadId], references: [leads.id] }),
  projects: many(projects),
  invoices: many(invoices),
  quotes: many(quotes),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  leadEngineerUser: one(users, { fields: [projects.leadEngineer], references: [users.id] }),
  milestones: many(milestones),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  files: many(files),
  invoices: many(invoices),
}))

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [tasks.milestoneId], references: [milestones.id] }),
  assignedUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  timeEntries: many(timeEntries),
}))

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, { fields: [timeEntries.userId], references: [users.id] }),
  project: one(projects, { fields: [timeEntries.projectId], references: [projects.id] }),
  task: one(tasks, { fields: [timeEntries.taskId], references: [tasks.id] }),
}))

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, { fields: [quotes.clientId], references: [clients.id] }),
  lineItems: many(quoteLineItems),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  lineItems: many(invoiceLineItems),
}))

export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, { fields: [files.projectId], references: [projects.id] }),
  uploader: one(users, { fields: [files.uploadedBy], references: [users.id] }),
}))

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────
export type User         = typeof users.$inferSelect
export type NewUser      = typeof users.$inferInsert
export type Lead         = typeof leads.$inferSelect
export type NewLead      = typeof leads.$inferInsert
export type Client       = typeof clients.$inferSelect
export type NewClient    = typeof clients.$inferInsert
export type Project      = typeof projects.$inferSelect
export type NewProject   = typeof projects.$inferInsert
export type Milestone    = typeof milestones.$inferSelect
export type Task         = typeof tasks.$inferSelect
export type NewTask      = typeof tasks.$inferInsert
export type TimeEntry    = typeof timeEntries.$inferSelect
export type NewTimeEntry = typeof timeEntries.$inferInsert
export type Quote        = typeof quotes.$inferSelect
export type Invoice      = typeof invoices.$inferSelect
export type NewInvoice   = typeof invoices.$inferInsert
export type File         = typeof files.$inferSelect

// ─────────────────────────────────────────────
// SESSIONS (simple auth)
// ─────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Session = typeof sessions.$inferSelect

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))
