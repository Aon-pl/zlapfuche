'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Brak uprawnień')
  }
}

export async function adminBlockUser(userId: string, block: boolean) {
  await requireAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { blocked: block },
  })
  revalidatePath('/admin/users')
  revalidatePath('/admin/moderation')
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin()
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}

export async function adminBlockOffer(offerId: string, block: boolean) {
  await requireAdmin()
  await prisma.jobOffer.update({
    where: { id: offerId },
    data: { status: block ? 'blocked' : 'active' },
  })
  revalidatePath('/admin/offers')
  revalidatePath('/admin/moderation')
  revalidatePath('/offers')
}

export async function adminDeleteOffer(offerId: string) {
  await requireAdmin()
  await prisma.jobOffer.delete({ where: { id: offerId } })
  revalidatePath('/admin/offers')
  revalidatePath('/offers')
}
