import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StartChatButton from '@/components/StartChatButton'

interface Props { params: Promise<{ id: string }> }

export default async function JobSeekerProfilePage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  const seeker = await prisma.jobSeeker.findUnique({
    where: { id },
    include: { 
      person: { 
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          city: true,
          user: { select: { isSuperFuchowicz: true } },
        } 
      } 
    },
  })
  if (!seeker) notFound()

  const skills = seeker.skills ? JSON.parse(seeker.skills) as string[] : []

  let companyProfileId: string | null = null
  if (session?.user.role === 'company') {
    const cp = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    companyProfileId = cp?.id ?? null
  }

  const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }
  const fullName = `${seeker.person.firstName} ${seeker.person.lastName}`

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

      {/* Header */}
      <div className="glass-inset border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link href="/workers" className="text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors mb-4 inline-flex items-center gap-1">
            ← Wróć do listy
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0"
              style={{ background: '#f97015' }}>
              {fullName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                {fullName}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-gray-500">📍 {seeker.city}</p>
                {seeker.person.user.isSuperFuchowicz && (
                  <span className="text-sm px-3 py-1 rounded-full font-bold"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff' }}>
                    ⭐ Super-Fuchowicz
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {seeker.experienceYears > 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium glass-badge">
                    💼 {seeker.experienceYears} lat doświadczenia
                  </span>
                )}
                {seeker.drivingLicense && (
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium glass-badge">
                    🚗 Prawo jazdy
                  </span>
                )}
                {seeker.availableFrom && (
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium" 
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                    ✅ dostępny od {new Date(seeker.availableFrom).toLocaleDateString('pl-PL')}
                  </span>
                )}
              </div>

              {companyProfileId && (
                <div className="mt-3">
                  <StartChatButton personId={seeker.person.id} companyId={companyProfileId} label="Napisz wiadomość" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Tytuł ogłoszenia */}
        <div className="glass-card p-5 sm:p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">{seeker.title}</h2>
          {seeker.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{seeker.description}</p>
          )}
        </div>

        {/* Oczekiwane wynagrodzenie */}
        {seeker.expectedSalary && (
          <div className="glass-card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Oczekiwane wynagrodzenie</p>
            <p className="text-2xl font-black" style={{ color: '#f97015' }}>
              {seeker.expectedSalary} zł/{SALARY_TYPE[seeker.salaryType]}
            </p>
          </div>
        )}

        {/* Umiejętności */}
        {skills.length > 0 && (
          <div className="glass-card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Umiejętności</p>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="text-sm px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: 'rgba(249,112,21,0.1)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dane kontaktowe - tylko dla zalogowanych firm */}
        {!session && (
          <div className="glass-card p-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zaloguj się</Link> aby skontaktować się z kandydatem
            </p>
          </div>
        )}

        {/* Powrót do listy */}
        <div className="text-center">
          <Link href="/workers" className="text-sm font-semibold text-gray-500 hover:text-orange-500 transition-colors">
            ← Wróć do listy pracowników
          </Link>
        </div>
      </div>
    </div>
  )
}
