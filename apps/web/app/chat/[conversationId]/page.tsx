import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import ChatWindow from '@/components/ChatWindow'

interface PageProps {
  params: Promise<{ conversationId: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { conversationId } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      person:   { select: { id: true, userId: true, firstName: true, lastName: true } },
      company:  { select: { id: true, userId: true, companyName: true } },
      personA:  { select: { id: true, userId: true, firstName: true, lastName: true } },
      personB:  { select: { id: true, userId: true, firstName: true, lastName: true } },
      jobOffer: { select: { id: true, title: true } },
    },
  })
  if (!conversation) notFound()

  const isPerson  = conversation.person?.userId  === session.user.id
  const isCompany = conversation.company?.userId === session.user.id
  const isPersonA = conversation.personA?.userId === session.user.id
  const isPersonB = conversation.personB?.userId === session.user.id

  if (!isPerson && !isCompany && !isPersonA && !isPersonB) redirect('/dashboard')

  let otherName = ''
  if (isPerson  && conversation.company)  otherName = conversation.company.companyName
  if (isCompany && conversation.person)   otherName = `${conversation.person.firstName} ${conversation.person.lastName}`
  if (isPersonA && conversation.personB)  otherName = `${conversation.personB.firstName} ${conversation.personB.lastName}`
  if (isPersonB && conversation.personA)  otherName = `${conversation.personA.firstName} ${conversation.personA.lastName}`

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" style={{ background: '#FCFAF8' }}>

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/chat"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 transition-all shrink-0">
            ←
          </Link>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shrink-0"
            style={{ background: '#f97015' }}>
            {otherName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{otherName}</p>
            {conversation.jobOffer && (
              <Link href={`/offers/${conversation.jobOffer.id}`}
                className="text-xs hover:underline truncate block" style={{ color: '#f97015' }}>
                📋 {conversation.jobOffer.title}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 min-h-0 max-w-3xl w-full mx-auto px-4 sm:px-6 py-4">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={session.user.id}
          currentRole={session.user.role as 'person' | 'company'}
          isPersonB={isPersonB}
          otherName={otherName}
        />
      </div>
    </div>
  )
}
