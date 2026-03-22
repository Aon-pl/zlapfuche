import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateOffer } from '@/lib/actions/offerActions'

interface Props { params: Promise<{ id: string }> }

const CATEGORIES = [
  { value: 'warehouse',     label: '📦 Magazyn'     },
  { value: 'construction',  label: '🏗️ Budowlanka'  },
  { value: 'hospitality',   label: '🍽️ Gastronomia' },
  { value: 'retail',        label: '🛒 Handel'       },
  { value: 'transport',     label: '🚛 Transport'    },
  { value: 'cleaning',      label: '🧹 Sprzątanie'  },
  { value: 'manufacturing', label: '⚙️ Produkcja'   },
  { value: 'agriculture',   label: '🌾 Rolnictwo'   },
  { value: 'office',        label: '💼 Biuro'        },
  { value: 'other',         label: '🔧 Inne'         },
]

const STATUSES = [
  { value: 'active',  label: 'Aktywna'    },
  { value: 'paused',  label: 'Wstrzymana' },
  { value: 'closed',  label: 'Zamknięta'  },
]

export default async function EditOfferPage({ params }: Props) {
  const { id }    = await params
  const session   = await auth()
  if (!session?.user) redirect('/login')

  const offer = await prisma.jobOffer.findUnique({
    where: { id },
    include: {
      company: { select: { userId: true } },
      person:  { select: { userId: true } },
    },
  })
  if (!offer) notFound()

  const isOwner =
    offer.company?.userId === session.user.id ||
    offer.person?.userId  === session.user.id

  if (!isOwner) redirect('/dashboard')

  const updateOfferWithId = updateOffer.bind(null, id)

  const inp = {
    className: "w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 outline-none transition-all text-sm",
  }
  const lbl = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5"
  const card = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link href={`/offers/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-4">
            ← Wróć do oferty
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            Edytuj ofertę
          </h1>
          <p className="text-gray-500 text-sm mt-1">{offer.title}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form action={updateOfferWithId} className="space-y-5">

          {/* Podstawowe */}
          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>1</span>
              Podstawowe informacje
            </h2>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Tytuł *</label>
                <input name="title" required defaultValue={offer.title} {...inp} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Kategoria *</label>
                  <select name="category" required defaultValue={offer.category} {...inp} style={{ cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <select name="status" defaultValue={offer.status} {...inp} style={{ cursor: 'pointer' }}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Miasto *</label>
                <input name="city" required defaultValue={offer.city} {...inp} />
              </div>
            </div>
          </div>

          {/* Opis */}
          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>2</span>
              Opis i wymagania
            </h2>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Opis stanowiska *</label>
                <textarea name="description" required rows={6} defaultValue={offer.description}
                  className={`${inp.className} resize-vertical`} />
              </div>
              <div>
                <label className={lbl}>Wymagania</label>
                <textarea name="requirements" rows={4} defaultValue={offer.requirements ?? ''}
                  className={`${inp.className} resize-vertical`} />
              </div>
            </div>
          </div>

          {/* Wynagrodzenie */}
          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>3</span>
              Wynagrodzenie
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Min. (zł)</label>
                <input name="salaryMin" type="number" min={0} defaultValue={offer.salaryMin ?? ''} {...inp} />
              </div>
              <div>
                <label className={lbl}>Max. (zł)</label>
                <input name="salaryMax" type="number" min={0} defaultValue={offer.salaryMax ?? ''} {...inp} />
              </div>
              <div>
                <label className={lbl}>Typ</label>
                <select name="salaryType" defaultValue={offer.salaryType} {...inp} style={{ cursor: 'pointer' }}>
                  <option value="hourly">Za godzinę</option>
                  <option value="daily">Za dzień</option>
                  <option value="monthly">Miesięcznie</option>
                </select>
              </div>
            </div>
          </div>

          {/* Szczegóły */}
          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>4</span>
              Szczegóły
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Data rozpoczęcia *</label>
                <input name="startDate" type="date" required
                  defaultValue={offer.startDate.toISOString().split('T')[0]} {...inp} />
              </div>
              <div>
                <label className={lbl}>Data zakończenia</label>
                <input name="endDate" type="date"
                  defaultValue={offer.endDate?.toISOString().split('T')[0] ?? ''} {...inp} />
              </div>
              <div>
                <label className={lbl}>Wygasa</label>
                <input name="expiresAt" type="date" required
                  defaultValue={offer.expiresAt.toISOString().split('T')[0]} {...inp} />
              </div>
              <div>
                <label className={lbl}>Godziny / tydzień</label>
                <input name="hoursPerWeek" type="number" min={1} max={168}
                  defaultValue={offer.hoursPerWeek ?? ''} {...inp} />
              </div>
              <div>
                <label className={lbl}>Min. wiek</label>
                <input name="minAge" type="number" min={16} max={99}
                  defaultValue={offer.minAge ?? 18} {...inp} />
              </div>
            </div>

            <div className="flex flex-wrap gap-5 mt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="remote" value="true" defaultChecked={offer.remote}
                  className="w-4 h-4 rounded accent-orange-500" />
                <span className="text-sm text-gray-700 font-medium">Praca zdalna</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="drivingLicense" value="true" defaultChecked={offer.drivingLicense}
                  className="w-4 h-4 rounded accent-orange-500" />
                <span className="text-sm text-gray-700 font-medium">Wymaga prawa jazdy</span>
              </label>
            </div>
          </div>

          {/* Akcje */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/offers/${id}`}
              className="flex-1 text-center font-semibold py-3 rounded-xl text-sm border border-gray-200 hover:border-gray-300 text-gray-600 transition-all">
              Anuluj
            </Link>
            <button type="submit"
              className="flex-1 font-bold py-3 rounded-xl text-white text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ background: '#f97015' }}>
              💾 Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
