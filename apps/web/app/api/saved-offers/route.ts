import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

// Pomocnik: pobierz personId lub companyId zalogowanego usera
async function getProfileId(userId: string, role: string) {
  if (role === 'person') {
    const p = await prisma.personProfile.findUnique({ where: { userId }, select: { id: true } })
    return { personId: p?.id ?? null, companyId: null }
  }
  if (role === 'company') {
    const c = await prisma.companyProfile.findUnique({ where: { userId }, select: { id: true } })
    return { personId: null, companyId: c?.id ?? null }
  }
  return { personId: null, companyId: null }
}

// GET /api/saved-offers — lista zapisanych ofert
export async function GET() {
  const session = await auth()
  if (!session?.user || !['person', 'company'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { personId, companyId } = await getProfileId(session.user.id, session.user.role)
  if (!personId && !companyId) return NextResponse.json({ savedOffers: [] })

  const saved = await prisma.savedOffer.findMany({
    where: personId ? { personId } : { companyId: companyId! },
    include: {
      offer: {
        include: {
          company: { select: { id: true, companyName: true } },
          person:  { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ savedOffers: saved })
}

// POST /api/saved-offers — toggle (zapisz lub usuń z ulubionych)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['person', 'company'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { offerId } = await req.json()
  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 })

  const { personId, companyId } = await getProfileId(session.user.id, session.user.role)
  if (!personId && !companyId) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Klucz unique zależy od roli
  const whereUnique = personId
    ? { personId_offerId: { personId: personId!, offerId } }
    : { companyId_offerId: { companyId: companyId!, offerId } }

  const existing = await prisma.savedOffer.findUnique({ where: whereUnique as any })

  if (existing) {
    await prisma.savedOffer.delete({ where: { id: existing.id } })
    return NextResponse.json({ saved: false })
  } else {
    await prisma.savedOffer.create({
      data: personId
        ? { personId: personId!, offerId }
        : { companyId: companyId!, offerId },
    })
    return NextResponse.json({ saved: true })
  }
}
