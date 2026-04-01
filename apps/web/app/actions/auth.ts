'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth.node'
import { AuthError } from 'next-auth'
import { sendEmailVerification } from '@/lib/sendEmailVerification'

export async function register(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const role     = formData.get('role') as 'person' | 'company'

  if (!email || !password || !role) {
    return { error: 'Wypełnij wszystkie pola.' }
  }
  if (password.length < 8) {
    return { error: 'Hasło musi mieć co najmniej 8 znaków.' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'Konto z tym emailem już istnieje.' }

  const hashed = await bcrypt.hash(password, 12)

  let userId: string

  if (role === 'person') {
    const firstName = formData.get('firstName') as string
    const lastName  = formData.get('lastName') as string
    if (!firstName || !lastName) return { error: 'Podaj imię i nazwisko.' }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'person',
        emailVerified: false,
        personProfile: {
          create: { firstName, lastName },
        },
      },
    })
    userId = user.id
  } else {
    const companyName  = formData.get('companyName') as string
    const city        = formData.get('city') as string
    const nip         = formData.get('nip') as string | null
    const address     = formData.get('address') as string | null

    if (!companyName || !city) return { error: 'Podaj nazwę firmy i miasto.' }
    if (!nip) return { error: 'NIP jest wymagany.' }

    if (!/^\d{10}$/.test(nip)) {
      return { error: 'NIP musi składać się z 10 cyfr.' }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'company',
        emailVerified: false,
        companyProfile: {
          create: { 
            companyName, 
            city,
            nip,
            address: address || null,
          },
        },
      },
    })
    userId = user.id
  }

  // Wyślij email weryfikacyjny
  try {
    await sendEmailVerification(userId, email)
  } catch (err) {
    console.error('Błąd wysyłki emaila weryfikacyjnego:', err)
    // Nie blokujemy rejestracji jeśli email się nie wysłał
  }

  // Przekieruj na stronę z informacją o konieczności weryfikacji
  redirect('/register/verify-email')
}

export async function login(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Wypełnij wszystkie pola.' }

  // Sprawdź emailVerified przed próbą logowania
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true, password: true },
  })

  if (user && !user.emailVerified) {
    // Weryfikuj hasło żeby nie zdradzać że konto istnieje
    const valid = user.password
      ? await (await import('bcryptjs')).default.compare(password, user.password)
      : false
    if (valid) {
      return { error: 'EMAIL_NOT_VERIFIED', email }
    }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Nieprawidłowy email lub hasło.' }
    }
    throw error
  }
}

export async function logout() {
  const { signOut } = await import('@/auth.node')
  await signOut({ redirectTo: '/' })
}
