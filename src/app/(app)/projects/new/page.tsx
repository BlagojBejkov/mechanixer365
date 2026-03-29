import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients, users } from '@/lib/db/schema'
import NewProjectForm from '@/components/projects/NewProjectForm'

export default async function NewProjectPage() {
  await requireAuth()
  const [clientList, userList] = await Promise.all([
    db.select().from(clients),
    db.select().from(users),
  ])
  return <NewProjectForm clients={clientList} engineers={userList} />
}