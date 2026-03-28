'use server'

import { login } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required' }

  return login(email, password)
}

export async function logoutAction() {
  const { destroySession } = await import('@/lib/auth')
  await destroySession()
}
