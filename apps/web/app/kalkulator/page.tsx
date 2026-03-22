'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const ZUS_PRACOWNIK  = 0.1369
const ZDROWOTNA      = 0.09
const ZDROWOTNA_ODLICZ = 0.0775
const PODATEK_1      = 0.12
const KWOTA_WOLNA_M  = 30000 / 12
const ULGA_PRAC_M    = 3000 / 12
const ZUS_FP         = 0.0245

function calcUoP(brutto: number) {
  const zus      = brutto * ZUS_PRACOWNIK
  const zdrow    = (brutto - zus) * ZDROWOTNA
  const zdrowOd  = (brutto - zus) * ZDROWOTNA_ODLICZ
  const podst    = Math.max(0, brutto - zus - ULGA_PRAC_M)
  const podatek  = Math.max(0, podst * PODATEK_1 - zdrowOd - KWOTA_WOLNA_M * PODATEK_1)
  return { netto: Math.round(brutto - zus - zdrow - podatek), zus: Math.round(zus), zdrow: Math.round(zdrow), podatek: Math.round(podatek) }
}

function calcZlecenie(brutto: number) {
  const zus      = brutto * (ZUS_PRACOWNIK + ZUS_FP)
  const zdrow    = (brutto - zus) * ZDROWOTNA
  const zdrowOd  = (brutto - zus) * ZDROWOTNA_ODLICZ
  const kup      = (brutto - brutto * ZUS_PRACOWNIK) * 0.2
  const podst    = Math.max(0, brutto - brutto * ZUS_PRACOWNIK - kup)
  const podatek  = Math.max(0, podst * PODATEK_1 - zdrowOd)
  return { netto: Math.round(brutto - zus - zdrow - podatek), zus: Math.round(zus), zdrow: Math.round(zdrow), podatek: Math.round(podatek) }
}

function calcB2B(brutto: number) {
  const zus     = 400
  const zdrow   = 400
  const kup     = brutto * 0.2
  const podatek = Math.round(Math.max(0, brutto - kup) * PODATEK_1)
  return { netto: Math.round(brutto - zus - zdrow - podatek), zus, zdrow, podatek }
}

type Mode     = 'hourly' | 'daily' | 'monthly'
type Contract = 'uop' | 'zlecenie' | 'b2b'

const CONTRACT_LABELS = { uop: 'Umowa o pracę', zlecenie: 'Zlecenie', b2b: 'B2B' }
const MODE_LABELS     = { hourly: 'Godzinowa', daily: 'Dzienna', monthly: 'Miesięczna' }
const MODE_SUFFIX     = { hourly: 'zł/h', daily: 'zł/dzień', monthly: 'zł/mies.' }

export default function KalkulatorPage() {
  const [rate,       setRate]       = useState(30)
  const [hours,      setHours]      = useState(168)
  const [mode,       setMode]       = useState<Mode>('hourly')
  const [contract,   setContract]   = useState<Contract>('uop')
  const [goalAmount, setGoalAmount] = useState(5000)

  const brutto = useMemo(() => {
    if (mode === 'hourly')  return rate * hours
    if (mode === 'daily')   return rate * Math.round(hours / 8)
    return rate
  }, [rate, hours, mode])

  const result = useMemo(() => {
    if (contract === 'uop')      return calcUoP(brutto)
    if (contract === 'zlecenie') return calcZlecenie(brutto)
    return calcB2B(brutto)
  }, [brutto, contract])

  const allContracts = useMemo(() => ({
    uop:      calcUoP(brutto),
    zlecenie: calcZlecenie(brutto),
    b2b:      calcB2B(brutto),
  }), [brutto])

  const goalHours = useMemo(() => {
    if (mode === 'monthly' || rate === 0) return null
    const nettoPerHour = result.netto / hours
    return nettoPerHour > 0 ? Math.ceil(goalAmount / nettoPerHour) : null
  }, [goalAmount, rate, result, hours, mode])

  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm'
  const tab  = (active: boolean) => `flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${active ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-4">
            ← Oferty
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            💰 Kalkulator zarobków
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Oblicz wynagrodzenie netto i zaplanuj cel finansowy</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Inputs */}
        <div className="space-y-4">

          {/* Typ stawki */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Typ stawki</p>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {(Object.entries(MODE_LABELS) as [Mode, string][]).map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)}
                  className={tab(mode === v)}
                  style={mode === v ? { background: '#f97015' } : {}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Stawka */}
          <div className={`${card} p-5`}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Stawka</p>
              <p className="font-black text-gray-900">{rate} {MODE_SUFFIX[mode]}</p>
            </div>
            <input type="range" min={10} max={mode === 'monthly' ? 30000 : mode === 'daily' ? 1000 : 200}
              value={rate} onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-orange-500" />
            <input type="number" min={1} value={rate} onChange={e => setRate(Number(e.target.value))}
              className="mt-3 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-orange-400 transition-all" />
          </div>

          {/* Godziny */}
          {mode !== 'monthly' && (
            <div className={`${card} p-5`}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Godziny / miesiąc</p>
                <p className="font-black text-gray-900">{hours}h ≈ {Math.round(hours / 8)} dni</p>
              </div>
              <input type="range" min={8} max={240} value={hours} onChange={e => setHours(Number(e.target.value))}
                className="w-full accent-orange-500" />
            </div>
          )}

          {/* Umowa */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Typ umowy</p>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {(Object.entries(CONTRACT_LABELS) as [Contract, string][]).map(([v, l]) => (
                <button key={v} onClick={() => setContract(v)}
                  className={tab(contract === v)}
                  style={contract === v ? { background: '#f97015' } : {}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Cel */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Cel finansowy (netto)</p>
            <div className="relative">
              <input type="number" min={100} value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-orange-400 transition-all" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">zł</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">

          {/* Główny wynik */}
          <div className="rounded-2xl p-6 shadow-lg" style={{ background: '#f97015' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Zarobek netto / miesiąc</p>
            <p className="text-5xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
              {result.netto.toLocaleString('pl-PL')} zł
            </p>
            <p className="text-white/70 text-sm mt-1">
              z {brutto.toLocaleString('pl-PL')} zł brutto · {hours > 0 ? (result.netto / hours).toFixed(2) : 0} zł/h netto
            </p>
          </div>

          {/* Rozbicie */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Rozbicie</p>
            <div className="space-y-2.5">
              {[
                { label: 'Brutto',           value: brutto,         positive: true  },
                { label: 'Składki ZUS',      value: -result.zus,   positive: false },
                { label: 'Zdrowotna',        value: -result.zdrow, positive: false },
                { label: 'Podatek',          value: -result.podatek, positive: false },
                { label: 'Netto',            value: result.netto,  positive: true, bold: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-${item.bold ? 'black' : 'semibold'} ${item.positive ? 'text-gray-900' : 'text-red-500'}`}>
                    {item.value > 0 ? '+' : ''}{item.value.toLocaleString('pl-PL')} zł
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-red-400 h-full" style={{ width: `${Math.round((result.zus + result.zdrow + result.podatek) / brutto * 100)}%` }} />
              <div className="h-full flex-1" style={{ background: '#f97015' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Odciągnięcia: {Math.round((result.zus + result.zdrow + result.podatek) / brutto * 100)}%</span>
              <span>Netto: {Math.round(result.netto / brutto * 100)}%</span>
            </div>
          </div>

          {/* Porównanie umów */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Porównanie umów</p>
            <div className="space-y-2">
              {(Object.entries(allContracts) as [Contract, ReturnType<typeof calcUoP>][]).map(([c, r]) => (
                <div key={c} className={`flex items-center justify-between p-3 rounded-xl transition-all ${contract === c ? 'border' : 'bg-gray-50'}`}
                  style={contract === c ? { background: 'rgba(249,112,21,0.08)', borderColor: 'rgba(249,112,21,0.3)' } : {}}>
                  <span className={`text-sm font-semibold ${contract === c ? 'text-orange-600' : 'text-gray-600'}`}>
                    {CONTRACT_LABELS[c]}
                  </span>
                  <span className={`font-black text-sm ${contract === c ? 'text-orange-600' : 'text-gray-900'}`}>
                    {r.netto.toLocaleString('pl-PL')} zł
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cel */}
          {goalHours && mode !== 'monthly' && (
            <div className={`${card} p-5`}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Do celu: {goalAmount.toLocaleString('pl-PL')} zł netto
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{goalHours}</p>
                  <p className="text-xs text-gray-500 mt-0.5">godzin</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">{Math.ceil(goalHours / 8)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">dni roboczych</p>
                </div>
              </div>
            </div>
          )}

          {/* Roczne */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Perspektywa roczna</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Brutto/rok',    value: (brutto * 12).toLocaleString('pl-PL') + ' zł' },
                { label: 'Netto/rok',     value: (result.netto * 12).toLocaleString('pl-PL') + ' zł' },
                { label: 'Netto/kwartał', value: (result.netto * 3).toLocaleString('pl-PL') + ' zł' },
                { label: 'Netto/dzień',   value: Math.round(result.netto / 30).toLocaleString('pl-PL') + ' zł' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-sm font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center px-2">
            Kalkulacja uproszczona wg stawek ZUS/podatku 2024. Nie stanowi porady podatkowej.
          </p>
        </div>
      </div>
    </div>
  )
}
