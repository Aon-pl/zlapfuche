import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export default async function ChatListPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  let conversations: any[] = []
  let myProfileId = ''

  if (session.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      myProfileId = profile.id
      conversations = await prisma.conversation.findMany({
        where: { OR: [{ personId: profile.id }, { personAId: profile.id }, { personBId: profile.id }] },
        include: {
          company:  { select: { id: true, companyName: true } },
          person:   { select: { id: true, firstName: true, lastName: true } },
          personA:  { select: { id: true, firstName: true, lastName: true } },
          personB:  { select: { id: true, firstName: true, lastName: true } },
          jobOffer: { select: { id: true, title: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }
  } else if (session.user.role === 'company') {
    const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      conversations = await prisma.conversation.findMany({
        where: { companyId: profile.id },
        include: {
          person:   { select: { id: true, firstName: true, lastName: true } },
          jobOffer: { select: { id: true, title: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }
  }

  function getOtherName(conv: any): string {
    if (session.user.role === 'company') return conv.person ? `${conv.person.firstName} ${conv.person.lastName}` : 'Nieznany'
    if (conv.type === 'person_company') return conv.company?.companyName ?? 'Nieznana firma'
    if (conv.personAId === myProfileId) return conv.personB ? `${conv.personB.firstName} ${conv.personB.lastName}` : 'Nieznany'
    return conv.personA ? `${conv.personA.firstName} ${conv.personA.lastName}` : 'Nieznany'
  }

  function formatTime(date: Date) {
    const diff  = Date.now() - new Date(date).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'teraz'
    if (mins < 60)  return `${mins} min`
    if (hours < 24) return `${hours}h`
    if (days < 7)   return `${days}d`
    return new Date(date).toLocaleDateString('pl-PL')
  }

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Skrzynka</p>
            <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>Wiadomości</h1>
          </div>
          <span className="text-sm font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
            {conversations.length}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <p className="text-5xl mb-3">💬</p>
            <h3 className="font-bold text-gray-900 mb-1">Brak wiadomości</h3>
            <p className="text-sm text-gray-500">
              {session.user.role === 'person'
                ? 'Wejdź na profil innej osoby lub aplikuj na ofertę firmy.'
                : 'Przejdź do aplikacji kandydatów i rozpocznij rozmowę.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv: any) => {
              const otherName = getOtherName(conv)
              const lastMsg   = conv.messages[0]
              const isP2P     = conv.type === 'person_person'

              return (
                <Link key={conv.id} href={`/chat/${conv.id}`}
                  className="flex items-center gap-4 px-4 sm:px-5 py-4 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md rounded-2xl transition-all group shadow-sm">

                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0"
                    style={{ background: isP2P ? '#2563eb' : '#f97015' }}>
                    {otherName[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-orange-500 transition-colors">
                        {otherName}
                      </p>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 shrink-0">{formatTime(lastMsg.createdAt)}</span>
                      )}
                    </div>
                    {conv.jobOffer && (
                      <p className="text-xs font-semibold truncate mt-0.5" style={{ color: '#f97015' }}>
                        📋 {conv.jobOffer.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content : 'Brak wiadomości'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
