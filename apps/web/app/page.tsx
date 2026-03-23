import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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

const BENEFITS = [
  { icon: '⚡', title: 'Błyskawiczna rekrutacja',  desc: 'Od ogłoszenia do zatrudnienia w ciągu 24 godzin.' },
  { icon: '🎯', title: 'Precyzyjne dopasowanie',   desc: 'Filtry po mieście, kategorii, stawce i dostępności.' },
  { icon: '📱', title: 'Aplikacja mobilna',        desc: 'Zarządzaj ofertami i aplikacjami z telefonu.' },
  { icon: '🔒', title: 'Bezpieczne dane',          desc: 'Twoje dane są chronione i nigdy nie trafiają do osób trzecich.' },
  { icon: '🎁', title: 'Zawsze za darmo',          desc: 'Dla pracowników platforma jest w 100% bezpłatna.' },
  { icon: '🇵🇱', title: 'Tylko Polska',            desc: 'Skupiamy się wyłącznie na polskim rynku pracy.' },
]

const TESTIMONIALS = [
  {
    name: 'Amelia Kowalska', role: 'Pracownik magazynu', initial: 'A',
    text: 'Dzięki PracaTymczasowa znalazłam pracę w ciągu jednego dnia! Prosty proces, bez zbędnych formalności. Polecam każdemu kto szuka pracy tymczasowej.',
  },
  {
    name: 'Jakub Wiśniewski', role: 'Właściciel firmy', initial: 'J',
    text: 'Jako pracodawca doceniam szybkość z jaką mogę znaleźć pracowników. Platforma jest intuicyjna i oszczędza mnóstwo czasu w procesie rekrutacji.',
  },
  {
    name: 'Marta Nowak', role: 'Kelnerka', initial: 'M',
    text: 'Świetna platforma! Filtry pomagają znaleźć dokładnie to czego szukam. Mogę łatwo przeglądać oferty na telefonie i aplikować jednym kliknięciem.',
  },
]

export default async function HomePage() {
  const [offerCount, companyCount, categoryCountsRaw] = await Promise.all([
    prisma.jobOffer.count({ where: { status: 'active' } }),
    prisma.companyProfile.count(),
    prisma.jobOffer.groupBy({ by: ['category'], where: { status: 'active' }, _count: true }),
  ])

  const categoryCounts = Object.fromEntries(
    categoryCountsRaw.map(c => [c.category, c._count])
  )

  return (
    <div style={{ background: '#FCFAF8', color: '#1D212B' }}>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
            ⭐ Platforma pracy tymczasowej #1 w Polsce
          </div>

          <h1 className="font-black leading-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', letterSpacing: '-0.03em' }}>
            Znajdź pracę.<br />
            <span style={{ color: '#f97015' }}>Już dziś.</span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
            Łączymy pracowników z pracodawcami szukającymi rąk do pracy tymczasowej.
            Szybko, konkretnie, bez zbędnych formalności.
          </p>

          <div className="flex items-center gap-3 flex-wrap mb-12">
            <Link href="/offers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: '#f97015', boxShadow: '0 8px 24px rgba(249,112,21,0.3)' }}>
              Przeglądaj oferty →
            </Link>
            <Link href="/offers/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-gray-700 bg-white border border-gray-200 transition-all hover:border-orange-300 hover:shadow-md">
              Dodaj ogłoszenie
            </Link>
          </div>

          <div className="flex items-center gap-8 flex-wrap">
            {[
              { value: '300k+',             label: 'Aktywnych użytkowników' },
              { value: String(offerCount),  label: 'Aktywnych ofert' },
              { value: String(companyCount),label: 'Pracodawców' },
              { value: '8',                 label: 'Kategorii pracy' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero ilustracja */}
        <div className="hidden lg:flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fde8d4 0%, #fef3ec 100%)' }}>
            <div className="text-center">
              <p className="text-8xl mb-4">👷</p>
              <p className="text-xl font-black text-gray-700">Znajdź wymarzoną pracę</p>
              <p className="text-gray-500 text-sm mt-1">Tysiące ofert w całej Polsce</p>
            </div>
            <div className="absolute bottom-8 left-8 bg-white rounded-2xl px-4 py-3 shadow-xl">
              <p className="text-xs text-gray-400">Aktywnych użytkowników</p>
              <p className="text-2xl font-black" style={{ color: '#f97015' }}>300k+</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KATEGORIE ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#f97015' }}>KATEGORIE</p>
              <h2 className="text-3xl font-black" style={{ letterSpacing: '-0.02em' }}>Praca w każdej branży</h2>
            </div>
            <Link href="/offers" className="text-sm font-bold hover:underline" style={{ color: '#f97015' }}>
              Wszystkie oferty →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/offers?category=${cat.slug}`}
                className="group p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all bg-white">
                <p className="text-3xl mb-3">{cat.icon}</p>
                <p className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{cat.label}</p>
                <p className="text-sm text-gray-400 mt-0.5">{categoryCounts[cat.slug] ?? 0} ofert dostępnych</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── JAK TO DZIAŁA ── */}
      <section className="py-20" style={{ background: '#FCFAF8' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#f97015' }}>JAK TO DZIAŁA</p>
            <h2 className="text-3xl font-black" style={{ letterSpacing: '-0.02em' }}>Proste jak 1, 2, 3</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl p-8" style={{ background: '#f97015' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">👷</span>
                <h3 className="font-black text-white text-lg">Dla pracownika</h3>
              </div>
              <div className="space-y-5">
                {[
                  { n: '01', title: 'Utwórz profil',              desc: 'Wypełnij swój profil i dodaj CV w kilka minut.' },
                  { n: '02', title: 'Przeglądaj oferty',          desc: 'Filtruj oferty po mieście, kategorii i stawce.' },
                  { n: '03', title: 'Aplikuj jednym kliknięciem', desc: 'Wyślij aplikację i czekaj na odpowiedź pracodawcy.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xs shrink-0">{s.n}</span>
                    <div>
                      <p className="font-bold text-white">{s.title}</p>
                      <p className="text-sm text-white/70 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white hover:scale-105 transition-all"
                style={{ color: '#f97015' }}>
                Zacznij szukać pracy →
              </Link>
            </div>

            <div className="rounded-3xl p-8" style={{ background: '#1D212B' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏢</span>
                <h3 className="font-black text-white text-lg">Dla pracodawcy</h3>
              </div>
              <div className="space-y-5">
                {[
                  { n: '01', title: 'Zarejestruj firmę',  desc: 'Załóż konto pracodawcy i uzupełnij profil firmy.' },
                  { n: '02', title: 'Dodaj ogłoszenie',   desc: 'Opisz stanowisko, stawkę i czas trwania pracy.' },
                  { n: '03', title: 'Wybierz kandydatów', desc: 'Przeglądaj aplikacje i kontaktuj się z najlepszymi.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                      style={{ background: 'rgba(249,112,21,0.2)', color: '#f97015' }}>{s.n}</span>
                    <div>
                      <p className="font-bold text-white">{s.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/register?role=company"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white hover:scale-105 transition-all"
                style={{ background: '#f97015' }}>
                Dodaj ogłoszenie →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZALETY ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#f97015' }}>ZALETY</p>
            <h2 className="text-3xl font-black" style={{ letterSpacing: '-0.02em' }}>Dlaczego PracaTymczasowa?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: 'rgba(249,112,21,0.08)' }}>
                  {b.icon}
                </div>
                <p className="font-bold text-gray-900 mb-1">{b.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPINIE ── */}
      <section className="py-20" style={{ background: '#FCFAF8' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#f97015' }}>OPINIE</p>
            <h2 className="text-3xl font-black" style={{ letterSpacing: '-0.02em' }}>Co mówią nasi użytkownicy</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                    style={{ background: '#f97015' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 mx-6 mb-6 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #f97015 0%, #e85d00 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Gotowy do działania?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Dołącz do tysięcy pracowników i pracodawców którzy już korzystają z naszej platformy.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/offers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold bg-white hover:scale-105 transition-all shadow-xl"
              style={{ color: '#f97015' }}>
              Szukam pracy →
            </Link>
            <Link href="/register?role=company"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all">
              Szukam pracowników
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1D212B' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="font-black text-white text-lg mb-2">PracaTymczasowa</p>
              <p className="text-sm max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Platforma łącząca pracowników z pracodawcami w całej Polsce.
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Kontakt</p>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Link href="/privacy" className="block hover:text-white transition-colors">Prywatność</Link>
                <Link href="/terms"   className="block hover:text-white transition-colors">Regulamin</Link>
                <p>+48 123 456 789</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © {new Date().getFullYear()} PracaTymczasowa. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}