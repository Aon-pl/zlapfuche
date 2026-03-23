import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import Link from 'next/link'
import WorkersFilters from '@/components/WorkersFilters'
import StartChatButton from '@/components/StartChatButton'

interface PageProps {
  searchParams: Promise<{ city?: string; skill?: string; drivingLicense?: string; minExp?: string; page?: string }>
}

export default async function WorkersPage({ searchParams }: PageProps) {
  const params      = await searchParams
  const session     = await auth()
  const currentPage = params.page ? Number(params.page) : 1
  const perPage     = 20

  const where: any = { active: true }
  if (params.city)           where.city           = { contains: params.city }
  if (params.drivingLicense) where.drivingLicense = true
  if (params.minExp)         where.experienceYears = { gte: Number(params.minExp) }
  if (params.skill)          where.skills          = { contains: params.skill }

  const [seekers, total] = await Promise.all([
    prisma.jobSeeker.findMany({
      where,
      include: { person: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      take: perPage, skip: (currentPage - 1) * perPage,
    }),
    prisma.jobSeeker.count({ where }),
  ])

  let companyProfileId: string | null = null
  if (session?.user.role === 'company') {
    const cp = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    companyProfileId = cp?.id ?? null
  }

  const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }
  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                👷 Szukam pracy
              </h1>
              <p className="text-gray-500 mt-1 text-sm">Kandydaci aktywnie poszukujący zatrudnienia</p>
            </div>
            {session?.user.role === 'person' && (
              <Link href="/workers/my"
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: '#f97015' }}>
                + Moje ogłoszenie
              </Link>
            )}
          </div>
          <WorkersFilters params={params} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-sm text-gray-500 mb-5">
          Znaleziono <span className="font-bold text-gray-900">{total}</span> ogłoszeń
        </p>

        {seekers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-3">🔍</p>
            <h3 className="font-bold text-gray-900 mb-1">Brak ogłoszeń</h3>
            <p className="text-gray-500 text-sm">Spróbuj zmienić filtry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seekers.map(seeker => {
              const skills = seeker.skills ? JSON.parse(seeker.skills) as string[] : []
              const name   = `${seeker.person.firstName} ${seeker.person.lastName}`

              return (
                <div key={seeker.id} className={card + ' p-5 flex flex-col gap-4'}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0"
                      style={{ background: '#f97015' }}>
                      {name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/persons/${seeker.person.id}`}
                        className="font-bold text-gray-900 hover:text-orange-500 transition-colors truncate block text-sm">
                        {name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {seeker.city}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-700 leading-snug">{seeker.title}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {seeker.experienceYears > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                        💼 {seeker.experienceYears} lat
                      </span>
                    )}
                    {seeker.drivingLicense && (
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">🚗 Prawo jazdy</span>
                    )}
                    {seeker.availableFrom && (
                      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium border border-green-200">
                        ✅ od {new Date(seeker.availableFrom).toLocaleDateString('pl-PL')}
                      </span>
                    )}
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: 'rgba(249,112,21,0.08)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }}>
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && <span className="text-xs text-gray-400">+{skills.length - 4}</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    {seeker.expectedSalary ? (
                      <span className="text-sm font-black" style={{ color: '#f97015' }}>
                        {seeker.expectedSalary} zł/{SALARY_TYPE[seeker.salaryType]}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Do ustalenia</span>
                    )}
                    {session?.user.role === 'company' && companyProfileId && (
                      <StartChatButton personId={seeker.person.id} companyId={companyProfileId} label="Napisz" />
                    )}
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
