# Mechanixer 365

Internal operating system for Mechanixer Engineering Studio.  
Runs at **365.mechanixer.com**

---

## Stack

| Layer        | Choice                              |
|--------------|-------------------------------------|
| Framework    | Next.js 15 (App Router)             |
| Database     | SQLite via better-sqlite3 (local) / Turso (production) |
| ORM          | Drizzle ORM                         |
| Auth         | NextAuth v5                         |
| Styling      | Tailwind CSS + custom design system |
| State        | Zustand (client state)              |
| Forms        | React Hook Form + Zod               |
| PDF export   | jsPDF + jsPDF-autotable             |
| Fonts        | Syne (display) + DM Sans (body) + DM Mono |

---

## Local Setup

```bash
# 1. Clone or download the project
cd mechanixer365

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env.local
# Edit .env.local — generate AUTH_SECRET with:
# openssl rand -base64 32

# 4. Push database schema
npm run db:push

# 5. Seed initial team users (run once)
npx tsx src/lib/db/seed.ts

# 6. Start dev server
npm run dev
# → http://localhost:3000 (redirects to /dashboard)
```

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Owner command center
│   ├── crm/                # Sales pipeline (kanban)
│   │   ├── leads/          # Lead detail pages
│   │   └── clients/        # Client detail pages
│   ├── projects/           # Project list + [id] detail
│   ├── time/               # Time log + weekly view
│   ├── capacity/           # Engineer load planning
│   ├── finance/            # Invoices, quotes, payments
│   │   ├── quotes/
│   │   ├── invoices/
│   │   └── payments/
│   ├── portal/[clientId]/  # Client-facing portal
│   └── settings/           # Company + team config
│
├── components/
│   ├── layout/             # AppShell, PageHeader
│   ├── ui/                 # StatCard, Badge, Avatar, etc.
│   ├── crm/                # Pipeline column, lead card
│   ├── projects/           # Project card, milestone list
│   ├── time/               # Time entry form, week view
│   ├── finance/            # Invoice form, PDF export
│   ├── capacity/           # Engineer bar chart
│   ├── dashboard/          # Revenue chart, alert panel
│   └── portal/             # Portal-specific components
│
├── lib/
│   ├── db/
│   │   ├── schema.ts       # ← SINGLE SOURCE OF TRUTH
│   │   ├── index.ts        # DB client
│   │   └── seed.ts         # Initial data
│   ├── utils/              # Formatting, cn(), helpers
│   └── constants/          # Team, nav, config
│
├── types/                  # Additional TS types
├── hooks/                  # useTimeTracker, useCapacity, etc.
└── store/                  # Zustand stores
```

---

## Data Model (Core Entities)

```
User → leads (CRM)
Lead → Client (on win)
Client → Projects
Project → Tasks, Milestones, TimeEntries, Files, Invoices
TimeEntry → Invoice (on billing)
```

Full schema: `src/lib/db/schema.ts`

---

## User Roles

| Role     | Access                                    |
|----------|-------------------------------------------|
| `owner`  | Everything — all modules, finance, CRM    |
| `engineer` | Dashboard (own view), Projects, Time    |
| `client` | Portal only — their projects & invoices   |

---

## Production Deployment (365.mechanixer.com)

### 1. Database — Turso (recommended)

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Create database
turso db create mechanixer365

# Get credentials
turso db show mechanixer365 --url
turso db tokens create mechanixer365
```

Update `.env.local`:
```
DATABASE_URL=libsql://mechanixer365-xxx.turso.io
DATABASE_AUTH_TOKEN=your-token-here
```

Switch DB client in `src/lib/db/index.ts` (see comment in file).

### 2. Deploy — Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

Set env vars in Vercel dashboard:
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`  
- `AUTH_SECRET`
- `AUTH_URL` = `https://365.mechanixer.com`

### 3. Custom domain

In Vercel: Settings → Domains → Add `365.mechanixer.com`  
In your DNS: Add CNAME `365` → `cname.vercel-dns.com`

---

## Development Roadmap

### Phase 1 (Now) ✅
- [x] Project scaffold & design system
- [x] Core data schema
- [x] Dashboard
- [x] CRM pipeline
- [x] Projects list
- [x] Time tracking UI
- [x] Capacity planning
- [x] Finance / invoices
- [x] Client portal
- [x] Settings

### Phase 1 — Wire up (next steps)
- [ ] Connect all pages to real DB queries
- [ ] Implement NextAuth login (email magic link)
- [ ] Time entry create/edit modal
- [ ] Lead create/edit form
- [ ] Project create form

### Phase 2
- [ ] Invoice PDF generation (jsPDF)
- [ ] Quote → Invoice conversion
- [ ] Retainer health tracking
- [ ] Revenue & profitability reports
- [ ] Project detail page (tasks, milestones, files)
- [ ] Engineer daily task view

### Phase 3
- [ ] Client portal authentication
- [ ] File upload (project deliverables)
- [ ] Email notifications (invoice sent, overdue)
- [ ] Full reporting suite

---

## Design System

- **Background**: `#0A0A0B` (near black)
- **Surface**: `#16161A` / `#1E1E24`
- **Accent**: `#3D8EF0` (electric steel blue)
- **Display font**: Syne (sharp, industrial)
- **Body font**: DM Sans
- **Mono**: DM Mono (numbers, codes)
- CSS classes documented in `src/app/globals.css`

---

## Questions / Support

Internal system — contact Blagoj for access.
