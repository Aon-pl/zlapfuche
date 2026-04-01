import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getExternalOffers } from '@/lib/externalDb'

const CATEGORIES = [
  { slug: 'warehouse',     label: 'Magazyn',     icon: '📦' },
  { slug: 'construction',  label: 'Budowlanka',  icon: '🏗️' },
  { slug: 'hospitality',   label: 'Gastronomia', icon: '🍽️' },
  { slug: 'transport',     label: 'Transport',   icon: '🚛' },
  { slug: 'retail',        label: 'Handel',      icon: '🛒' },
  { slug: 'manufacturing', label: 'Produkcja',   icon: '⚙️' },
  { slug: 'cleaning',      label: 'Sprzątanie',  icon: '🧹' },
  { slug: 'office',        label: 'Biuro',       icon: '💼' },
]

export default async function HomePage() {
  const [offerCount, companyCount, categoryCountsRaw, recentOffers, recentExternal] = await Promise.all([
    prisma.jobOffer.count({ where: { status: 'active' } }),
    prisma.companyProfile.count(),
    prisma.jobOffer.groupBy({ by: ['category'], where: { status: 'active' }, _count: true }),
    prisma.jobOffer.findMany({
      where: { status: 'active' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { companyName: true, companyLogoUrl: true } },
        person: { select: { firstName: true, lastName: true } },
      },
    }),
    getExternalOffers({ limit: 6 }).catch(() => ({ offers: [], pagination: { total: 0 } })),
  ])

  const categoryCounts = Object.fromEntries(
    categoryCountsRaw.map(c => [c.category, c._count])
  )

  const SALARY_TYPE: Record<string, string> = { hourly: 'zł/godz', daily: 'zł/dzień', monthly: 'zł/mies' }

  const externalOffers = recentExternal.offers.map(offer => ({
    id: `ext_${offer.id}`,
    title: offer.title,
    location: offer.location,
    salary: offer.salary,
    source: offer.source,
    url: offer.url,
  }))

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(249,112,21,0.08) 0%, rgba(249,112,21,0.02) 100%)' }} />
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(249,112,21,0.15)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(249,112,21,0.1)' }} />
        
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="text-center">
            <div className="glass-card inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f97015' }}></span>
              <span style={{ color: '#f97015' }}>Platforma pracy tymczasowej #1</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 tracking-tight" style={{ color: '#1a1a2e' }}>
              Znajdź pracę
              <br />
              <span style={{ color: '#f97015' }}>już dziś</span>
            </h1>

            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#64748b' }}>
              Łączymy pracowników z pracodawcami szukającymi rąk do pracy tymczasowej.
              Szybko, konkretnie, bez zbędnych formalności.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/offers"
                className="glass-button-primary px-10 py-4 rounded-2xl font-bold text-base transition-all">
                Przeglądaj oferty →
              </Link>
              <Link href="/offers/new"
                className="glass-button px-10 py-4 rounded-2xl font-semibold text-base transition-all">
                Dodaj ogłoszenie
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 sm:gap-14">
              {[
                { value: offerCount.toLocaleString('pl-PL'), label: 'Aktywnych ofert', accent: true },
                { value: companyCount.toLocaleString('pl-PL'), label: 'Zweryfikowanych firm', accent: false },
                { value: '50k+', label: 'Zatrudnionych', accent: false },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className={`text-3xl font-black ${s.accent ? '' : ''}`} style={{ color: s.accent ? '#f97015' : '#1a1a2e' }}>{s.value}</p>
                  <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORIE ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="glass-badge inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Kategorie
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ color: '#1a1a2e' }}>Praca w każdej branży</h2>
            <p style={{ color: '#64748b' }}>Wybierz sektor i znajdź idealną ofertę</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/offers?category=${cat.slug}`}
                className="glass-card p-6 sm:p-8 text-center group transition-all hover:scale-[1.03]">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl glass-inset group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <p className="font-bold text-base mb-1" style={{ color: '#1a1a2e' }}>{cat.label}</p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>{categoryCounts[cat.slug] ?? 0} ofert</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER PROMOCYJNY ── */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card-gradient relative p-10 sm:p-14 text-center overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(34,197,94,0.2)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(34,197,94,0.15)' }} />
            
            <div className="relative">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 glass-inset" style={{ color: '#22c55e' }}>
                🔥 Promocja
              </span>
              <h2 className="text-3xl sm:text-5xl font-black mb-4" style={{ color: '#1a1a2e' }}>
                Dodaj ofertę <span style={{ color: '#22c55e' }}>GRATIS</span>
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#64748b' }}>
                Załóż konto pracodawcy i dodawaj nieograniczoną liczbę ofert pracy tymczasowej za darmo!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register?role=company"
                  className="glass-button-green px-8 py-4 rounded-2xl font-bold transition-all">
                  Załóż konto firmy →
                </Link>
                <Link href="/ranking"
                  className="glass-button px-8 py-4 rounded-2xl font-semibold transition-all">
                  Zobacz ranking firm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OSTATNIE OFERTY WEWNĘTRZNE ── */}
      {recentOffers.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="glass-badge inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                  ✨ Nowe
                </span>
                <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#1a1a2e' }}>Ostatnio dodane oferty</h2>
              </div>
              <Link href="/offers"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold glass-button transition-all">
                Zobacz wszystkie
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentOffers.map(offer => {
                const author = offer.company?.companyName ?? (offer.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')
                const salary = offer.salaryMin ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} ${SALARY_TYPE[offer.salaryType]}` : null

                return (
                  <Link key={offer.id} href={`/offers/${offer.id}`}
                    className="glass-card p-6 group transition-all hover:scale-[1.02]">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl glass-inset flex items-center justify-center font-bold text-lg shrink-0"
                        style={{ color: '#f97015', backgroundColor: 'rgba(249,112,21,0.1)' }}>
                        {offer.company?.companyLogoUrl ? (
                          <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover rounded-xl" />
                        ) : author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate group-hover:text-orange-500 transition-colors" style={{ color: '#1a1a2e' }}>{offer.title}</p>
                        <p className="text-sm truncate" style={{ color: '#94a3b8' }}>{author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#64748b' }}>
                      <span>📍</span>
                      <span>{offer.city}</span>
                    </div>
                    {salary && (
                      <div className="inline-flex px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                        {salary}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="sm:hidden mt-6 text-center">
              <Link href="/offers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold" style={{ backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                Zobacz wszystkie oferty →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── OFERTY ZEWNĘTRZNE ── */}
      {externalOffers.length > 0 && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                  🌐 Zewnętrzne
                </span>
                <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#1a1a2e' }}>Oferty z OLX i innych</h2>
              </div>
              <Link href="/offers?external=true"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                Zobacz wszystkie
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {externalOffers.map(offer => (
                <a key={offer.id} href={offer.url} target="_blank" rel="noopener noreferrer"
                  className="glass-card p-6 group transition-all hover:scale-[1.02]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                      🌐
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate group-hover:text-green-500 transition-colors" style={{ color: '#1a1a2e' }}>{offer.title}</p>
                      <p className="text-sm" style={{ color: '#22c55e' }}>{offer.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#64748b' }}>
                    <span>📍</span>
                    <span>{offer.location || 'Brak lokalizacji'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {offer.salary && (
                      <span className="font-bold text-sm" style={{ color: '#22c55e' }}>{offer.salary}</span>
                    )}
                    <span className="text-xs px-3 py-1 rounded-lg font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      Zobacz →
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="sm:hidden mt-6 text-center">
              <Link href="/offers?external=true"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                Zobacz wszystkie zewnętrzne →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-gradient relative p-12 sm:p-16 text-center overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(249,112,21,0.15)' }} />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-5xl font-black mb-4" style={{ color: '#1a1a2e' }}>
                Gotowy start?
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#64748b' }}>
                Dołącz do tysięcy Polaków, którzy już znaleźli pracę dzięki PracaTymczasowa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/offers"
                  className="glass-button-primary px-10 py-4 rounded-2xl font-bold text-base transition-all">
                  Szukam pracy →
                </Link>
                <Link href="/register"
                  className="glass-button px-10 py-4 rounded-2xl font-semibold text-base transition-all">
                  Załóż konto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#1e293b' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div>
              <p className="font-black text-2xl mb-3" style={{ color: '#f97015' }}>PracaTymczasowa</p>
              <p className="text-sm max-w-xs" style={{ color: '#94a3b8' }}>
                Platforma łącząca pracowników z pracodawcami w całej Polsce.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Platforma</p>
                <div className="space-y-3 text-sm" style={{ color: '#94a3b8' }}>
                  <Link href="/offers" className="block hover:text-orange-400 transition-colors">Oferty pracy</Link>
                  <Link href="/workers" className="block hover:text-orange-400 transition-colors">Kandydaci</Link>
                  <Link href="/ranking" className="block hover:text-orange-400 transition-colors">Ranking firm</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Informacje</p>
                <div className="space-y-3 text-sm" style={{ color: '#94a3b8' }}>
                  <Link href="/privacy" className="block hover:text-orange-400 transition-colors">Prywatność</Link>
                  <Link href="/terms" className="block hover:text-orange-400 transition-colors">Regulamin</Link>
                  <Link href="/contact" className="block hover:text-orange-400 transition-colors">Kontakt</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-center" style={{ color: '#64748b' }}>
              © {new Date().getFullYear()} PracaTymczasowa. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
