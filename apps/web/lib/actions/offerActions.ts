'use server'

import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Usuń ofertę ────────────────────────────────────────────
export async function deleteOffer(offerId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const offer = await prisma.jobOffer.findUnique({
    where: { id: offerId },
    include: {
      company: { select: { userId: true } },
      person:  { select: { userId: true } },
    },
  })
  if (!offer) throw new Error('Not found')

  const isOwner =
    offer.company?.userId === session.user.id ||
    offer.person?.userId  === session.user.id
  const isAdmin = session.user.role === 'admin'

  if (!isOwner && !isAdmin) throw new Error('Forbidden')

  await prisma.jobOffer.delete({ where: { id: offerId } })
  revalidatePath('/offers')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ─── Edytuj ofertę ──────────────────────────────────────────
export async function updateOffer(offerId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const offer = await prisma.jobOffer.findUnique({
    where: { id: offerId },
    include: {
      company: { select: { userId: true } },
      person:  { select: { userId: true } },
    },
  })
  if (!offer) throw new Error('Not found')

  const isOwner =
    offer.company?.userId === session.user.id ||
    offer.person?.userId  === session.user.id

  if (!isOwner) throw new Error('Forbidden')

  const title        = formData.get('title')        as string
  const description  = formData.get('description')  as string
  const requirements = formData.get('requirements') as string | null
  const city         = formData.get('city')         as string
  const category     = formData.get('category')     as any
  const salaryMin    = formData.get('salaryMin')     ? Number(formData.get('salaryMin'))    : null
  const salaryMax    = formData.get('salaryMax')     ? Number(formData.get('salaryMax'))    : null
  const salaryType   = formData.get('salaryType')   as any
  const hoursPerWeek = formData.get('hoursPerWeek') ? Number(formData.get('hoursPerWeek')) : null
  const remote       = formData.get('remote') === 'true'
  const drivingLicense = formData.get('drivingLicense') === 'true'
  const minAge       = formData.get('minAge')       ? Number(formData.get('minAge'))        : 18
  const status       = formData.get('status')       as any
  const startDate    = new Date(formData.get('startDate') as string)
  const endDate      = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null
  const expiresAt    = new Date(formData.get('expiresAt') as string)

  await prisma.jobOffer.update({
    where: { id: offerId },
    data: {
      title, description, requirements, city, category,
      salaryMin, salaryMax, salaryType, hoursPerWeek,
      remote, drivingLicense, minAge, status,
      startDate, endDate, expiresAt,
    },
  })

  revalidatePath(`/offers/${offerId}`)
  revalidatePath('/dashboard')
  redirect(`/offers/${offerId}`)
}
