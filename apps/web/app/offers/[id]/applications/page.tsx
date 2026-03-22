import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import ApplicationStatusButton from './ApplicationStatusButton'
import StartChatButton from '@/components/StartChatButton'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG = {
  pending:  { label: 'Oczekująca',    color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20'  },
  viewed:   { label: 'Przejrzana',    color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20'      },
  accepted: { label: 'Zaakceptowana', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20'},
  rejected: { label: 'Odrzucona',     color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20'        },
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const offer = await prisma.jobOffer.findUnique({
    where: { id },
    include: {
      company: true,
      person: true,
    },
  })

  if (!offer) notFound()

  const isOwner =
    (session.user.role === 'company' && offer.company?.userId === session.user.id) ||
    (session.user.role === 'person'  && offer.person?.userId  === session.user.id)

  if (!isOwner) redirect('/dashboard')

  const applications = await prisma.application.findMany({
    where: { offerId: id },
    include: {
      applicant: {
        include: { user: { select: { email: true, phone: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const authorName = offer.company?.companyName
    ?? `${offer.person?.firstName} ${offer.person?.lastName}`

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => a.status === 'pending').length,
    viewed:   applications.filter(a => a.status === 'viewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Nagłówek */}
      <div className="bg-zinc-900/80 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <span>›</span>
                <Link href={`/offers/${offer.id}`} className="hover:text-white transition-colors">{offer.title}</Link>
                <span>›</span>
                <span className="text-zinc-300">Aplikacje</span>
              </div>
              <h1 className="text-2xl font-black text-white">{offer.title}</h1>
              <p className="text-zinc-400 text-sm mt-1">{authorName} · 📍 {offer.city}</p>
            </div>
            <Link href={`/offers/${offer.id}`}
              className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white text-sm rounded-xl transition-all">
              Podgląd oferty →
            </Link>
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[
              { label: 'Wszystkich', value: stats.total,    color: 'text-white'       },
              { label: 'Oczekujące', value: stats.pending,  color: 'text-yellow-400'  },
              { label: 'Przejrzane', value: stats.viewed,   color: 'text-blue-400'    },
              { label: 'Przyjęte',   value: stats.accepted, color: 'text-emerald-400' },
              { label: 'Odrzucone',  value: stats.rejected, color: 'text-red-400'     },
            ].map(stat => (
              <div key={stat.label} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-zinc-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {applications.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-2">Brak aplikacji</h3>
            <p className="text-zinc-400">Nikt jeszcze nie aplikował na tę ofertę.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const status = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG]
              const applicant = app.applicant
              const skills: string[] = applicant.skills ? JSON.parse(applicant.skills) : []

              return (
                <div key={app.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all">
                  <div className="flex items-start gap-5">

                    {/* Avatar */}
                    <Link href={`/persons/${applicant.id}`}
                      className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-yellow-400/50 flex items-center justify-center text-lg font-black text-zinc-400 flex-shrink-0 transition">
                      {applicant.firstName[0]}{applicant.lastName[0]}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {/* Imię i nazwisko jako link */}
                          <Link href={`/persons/${applicant.id}`}
                            className="font-bold text-white hover:text-yellow-400 transition">
                            {applicant.firstName} {applicant.lastName}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
                            {applicant.user.email && (
                              <a href={`mailto:${applicant.user.email}`} className="hover:text-yellow-400 transition-colors">
                                ✉ {applicant.user.email}
                              </a>
                            )}
                            {applicant.user.phone && (
                              <a href={`tel:${applicant.user.phone}`} className="hover:text-yellow-400 transition-colors">
                                📞 {applicant.user.phone}
                              </a>
                            )}
                            {applicant.city && (
                              <span>📍 {applicant.city}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <ApplicationStatusButton
                            applicationId={app.id}
                            currentStatus={app.status}
                          />
                          {offer.company && (
                            <StartChatButton
                              personId={applicant.id}
                              companyId={offer.company.id}
                              jobOfferId={offer.id}
                              label="Napisz"
                            />
                          )}
                        </div>
                      </div>

                      {/* Doświadczenie i umiejętności */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {applicant.experienceYears > 0 && (
                          <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg">
                            {applicant.experienceYears} {applicant.experienceYears === 1 ? 'rok' : 'lat'} doświadczenia
                          </span>
                        )}
                        {skills.slice(0, 4).map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs rounded-lg">
                            {skill}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-zinc-500 text-xs">+{skills.length - 4} więcej</span>
                        )}
                      </div>

                      {/* Bio */}
                      {applicant.bio && (
                        <p className="mt-3 text-zinc-400 text-sm line-clamp-2">{applicant.bio}</p>
                      )}

                      {/* List motywacyjny */}
                      {app.coverLetter && (
                        <div className="mt-3 p-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                          <p className="text-xs text-zinc-500 mb-1 font-medium">List motywacyjny</p>
                          <p className="text-zinc-300 text-sm line-clamp-3">{app.coverLetter}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-zinc-600 text-xs">
                          Aplikacja wysłana {new Date(app.createdAt).toLocaleDateString('pl-PL', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <Link href={`/persons/${applicant.id}`}
                          className="text-xs text-yellow-400 hover:underline font-bold">
                          Zobacz profil →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
