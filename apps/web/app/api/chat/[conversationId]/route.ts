import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/app/actions/notifications'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      person:  { select: { userId: true } },
      company: { select: { userId: true } },
      personA: { select: { userId: true } },
      personB: { select: { userId: true } },
    },
  })

  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isParticipant =
    conversation.person?.userId  === session.user.id ||
    conversation.company?.userId === session.user.id ||
    conversation.personA?.userId === session.user.id ||
    conversation.personB?.userId === session.user.id

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      senderPerson:       { select: { firstName: true, lastName: true } },
      senderCompany:      { select: { companyName: true } },
      senderTargetPerson: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  await prisma.message.updateMany({
    where: { conversationId, read: false },
    data: { read: true },
  })

  return NextResponse.json({ messages })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId } = await params
  const { content } = await req.json()

  if (!content?.trim()) return NextResponse.json({ error: 'Pusta wiadomość' }, { status: 400 })

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      person:  { select: { id: true, userId: true, firstName: true, lastName: true } },
      company: { select: { id: true, userId: true, companyName: true } },
      personA: { select: { id: true, userId: true, firstName: true, lastName: true } },
      personB: { select: { id: true, userId: true, firstName: true, lastName: true } },
    },
  })

  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isPerson  = conversation.person?.userId  === session.user.id
  const isCompany = conversation.company?.userId === session.user.id
  const isPersonA = conversation.personA?.userId === session.user.id
  const isPersonB = conversation.personB?.userId === session.user.id

  if (!isPerson && !isCompany && !isPersonA && !isPersonB) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Wyznacz sender
  let senderPersonId:       string | null = null
  let senderCompanyId:      string | null = null
  let senderTargetPersonId: string | null = null
  let senderName = ''

  if (isPerson)  { senderPersonId       = conversation.person!.id;  senderName = `${conversation.person!.firstName} ${conversation.person!.lastName}` }
  if (isCompany) { senderCompanyId      = conversation.company!.id; senderName = conversation.company!.companyName }
  if (isPersonA) { senderPersonId       = conversation.personA!.id; senderName = `${conversation.personA!.firstName} ${conversation.personA!.lastName}` }
  if (isPersonB) { senderTargetPersonId = conversation.personB!.id; senderName = `${conversation.personB!.firstName} ${conversation.personB!.lastName}` }

  const message = await prisma.message.create({
    data: {
      conversationId,
      content: content.trim(),
      senderPersonId,
      senderCompanyId,
      senderTargetPersonId,
    },
    include: {
      senderPerson:       { select: { firstName: true, lastName: true } },
      senderCompany:      { select: { companyName: true } },
      senderTargetPerson: { select: { firstName: true, lastName: true } },
    },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  // Powiadom pozostałych uczestników (nie nadawcę)
  const allParticipants: { userId: string }[] = [
    conversation.person  ? { userId: conversation.person.userId  } : null,
    conversation.company ? { userId: conversation.company.userId } : null,
    conversation.personA ? { userId: conversation.personA.userId } : null,
    conversation.personB ? { userId: conversation.personB.userId } : null,
  ].filter(Boolean) as { userId: string }[]

  const recipients = allParticipants.filter(p => p.userId !== session.user.id)

  await Promise.all(
    recipients.map(r =>
      createNotification({
        userId:  r.userId,
        title:   'Nowa wiadomość',
        message: `${senderName} wysłał/a Ci wiadomość.`,
        type:    'new_application', // używamy istniejącego type — możesz dodać 'new_message' do enuma
        data:    { conversationId },
      })
    )
  )

  return NextResponse.json({ message })
}
