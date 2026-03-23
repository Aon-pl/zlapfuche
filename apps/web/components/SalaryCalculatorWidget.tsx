'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const ZUS_PRACOWNIK = 0.1369
const ZDROWOTNA     = 0.09
const PODATEK       = 0.12
const ULGA_M        = 300 / 12 // kwota wolna miesięczna uproszczona

function nettoFromBrutto(brutto: number) {
  const zus = brutto * ZUS_PRACOWNIK
  const zdrowotna = (brutto - zus) * ZDROWOTNA
  const podatek = Math.max(0, (brutto - zus) * PODATEK - ULGA_M)
  return Math.round(brutto - zus - zdrowotna - podatek)
}

interface Props {
  salaryMin:  number | null
  salaryMax:  number | null
  salaryType: string
}

const TYPE_HOURS: Record<string, number> = { hourly: 1, daily: 8, monthly: 168 }
const TYPE_LABEL: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }

export default function SalaryCalculatorWidget({ salaryMin, salaryMax, salaryType }: Props) {
  const defaultRate = salaryMin ?? 30
  const [hours, setHours] = useState(168)
  const [rate,  setRate]  = useState(defaultRate)

  const hoursPerUnit = TYPE_HOURS[salaryType] ?? 1
  const brutto  = useMemo(() => rate * (hours / hoursPerUnit), [rate, hours, hoursPerUnit])
  const netto   = useMemo(() => nettoFromBrutto(brutto), [brutto])

  if (!salaryMin) return null

  return (
    <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
      <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-2">
        💰 Kalkulator zarobków
      </h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Stawka ({TYPE_LABEL[salaryType]})</span>
            <span className="font-bold">{rate} zł</span>
          </div>
          <input type="range"
            min={salaryMin}
            max={salaryMax ?? salaryMin * 2}
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-yellow-400" />
          <div className="flex justify-between text-xs text-slate-300 mt-0.5">
            <span>{salaryMin} zł</span>
            <span>{salaryMax ?? salaryMin * 2} zł</span>
          </div>
        </div>

        {salaryType !== 'monthly' && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Godziny w miesiącu</span>
              <span className="font-bold">{hours}h</span>
            </div>
            <input type="range" min={8} max={240} value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full accent-yellow-400" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Brutto/mies.</span>
          <span className="text-sm font-bold text-slate-700">{brutto.toLocaleString('pl-PL')} zł</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">Netto/mies. (~UoP)</span>
          <span className="text-lg font-black text-green-600">{netto.toLocaleString('pl-PL')} zł</span>
        </div>
      </div>

      <Link href="/kalkulator"
        className="mt-3 block text-center text-xs font-bold text-yellow-600 hover:underline">
        Pełny kalkulator →
      </Link>
    </div>
  )
}
