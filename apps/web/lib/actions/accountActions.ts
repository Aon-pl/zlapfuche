'use server'

import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// ─── Zmiana hasła ────────────────────────────────────────────
export async function changePassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session?.user) return { error: 'Brak sesji' }

  const current  = formData.get('currentPassword') as string
  const newPass  = formData.get('newPassword')     as string
  const confirm  = formData.get('confirmPassword') as string

  if (!current || !newPass || !confirm) return { error: 'Uzupełnij wszystkie pola' }
  if (newPass !== confirm)              return { error: 'Nowe hasła nie są identyczne' }
  if (newPass.length < 8)              return { error: 'Hasło musi mieć min. 8 znaków' }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { error: 'Nie można zmienić hasła dla tego konta' }

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return { error: 'Aktualne hasło jest nieprawidłowe' }

  const hashed = await bcrypt.hash(newPass, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } })

  return { success: true }
}

// ─── Zmiana emaila ───────────────────────────────────────────
export async function changeEmail(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session?.user) return { error: 'Brak sesji' }

  const newEmail = (formData.get('newEmail') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string

  if (!newEmail || !password) return { error: 'Uzupełnij wszystkie pola' }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) return { error: 'Nieprawidłowy format emaila' }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { error: 'Nie można zmienić emaila dla tego konta' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'Nieprawidłowe hasło' }

  const exists = await prisma.user.findUnique({ where: { email: newEmail } })
  if (exists) return { error: 'Ten email jest już zajęty' }

  await prisma.user.update({ where: { id: session.user.id }, data: { email: newEmail } })

  revalidatePath('/account')
  return { success: true }
}

// ─── Zmiana numeru telefonu ──────────────────────────────────
export async function changePhone(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const session = await auth()
  if (!session?.user) return { error: 'Brak sesji' }

  const phone = (formData.get('phone') as string)?.trim()

  if (!phone) return { error: 'Podaj numer telefonu' }

  // Akceptuje formaty: +48 123 456 789, 123456789, 123-456-789, +48123456789
  const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/
  if (!phoneRegex.test(phone)) return { error: 'Nieprawidłowy format numeru telefonu' }

  // Telefon jest przechowywany bezpośrednio na User
  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone },
  })

  revalidatePath('/account')
  return { success: true }
}

// ─── Usunięcie konta ─────────────────────────────────────────
export async function deleteAccount(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: 'Brak sesji' }

  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (confirm !== 'USUŃ KONTO') return { error: 'Wpisz "USUŃ KONTO" aby potwierdzić' }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) return { error: 'Nie można usunąć tego konta' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'Nieprawidłowe hasło' }

  await prisma.user.delete({ where: { id: session.user.id } })
  redirect('/login?deleted=1')
}
