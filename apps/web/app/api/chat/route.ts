import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { personId, companyId, targetPersonId, jobOfferId } = await req.json()

  // === person → company (wymaga aplikacji) ===
  if (personId && companyId) {
    const application = await prisma.application.findFirst({
      where: { applicantId: personId, offer: { companyId } },
    })
    if (!application) {
      return NextResponse.json({ error: 'Brak aplikacji — czat niedostępny' }, { status: 403 })
    }

    const existing = await prisma.conversation.findFirst({
      where: { type: 'person_company', personId, companyId, jobOfferId: jobOfferId ?? null },
    })

    if (existing) return NextResponse.json({ conversationId: existing.id })

    const conversation = await prisma.conversation.create({
      data: { type: 'person_company', personId, companyId, jobOfferId: jobOfferId ?? null },
    })

    return NextResponse.json({ conversationId: conversation.id })
  }

  // === person → person (bez wymogu aplikacji) ===
  if (personId && targetPersonId) {
    if (personId === targetPersonId) {
      return NextResponse.json({ error: 'Nie możesz pisać do siebie.' }, { status: 400 })
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        type: 'person_person',
        OR: [
          { personAId: personId,       personBId: targetPersonId },
          { personAId: targetPersonId, personBId: personId },
        ],
      },
    })

    if (existing) return NextResponse.json({ conversationId: existing.id })

    const conversation = await prisma.conversation.create({
      data: { type: 'person_person', personAId: personId, personBId: targetPersonId },
    })

    return NextResponse.json({ conversationId: conversation.id })
  }

  return NextResponse.json({ error: 'Brak wymaganych danych' }, { status: 400 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ conversations: [] })

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { personId: profile.id },
          { personAId: profile.id },
          { personBId: profile.id },
        ],
      },
      include: {
        company:  { select: { id: true, companyName: true, companyLogoUrl: true } },
        person:   { select: { id: true, firstName: true, lastName: true } },
        personA:  { select: { id: true, firstName: true, lastName: true } },
        personB:  { select: { id: true, firstName: true, lastName: true } },
        jobOffer: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ conversations, myProfileId: profile.id })
  }

  if (session.user.role === 'company') {
    const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ conversations: [] })

    const conversations = await prisma.conversation.findMany({
      where: { companyId: profile.id },
      include: {
        person:   { select: { id: true, firstName: true, lastName: true } },
        jobOffer: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ conversations })
  }

  return NextResponse.json({ conversations: [] })
}
