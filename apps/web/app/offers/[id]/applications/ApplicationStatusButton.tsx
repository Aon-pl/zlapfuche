'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateApplicationStatus } from '@/app/actions/applications'

interface Props {
  applicationId: string
  currentStatus: string
}

const STATUSES = [
  { value: 'pending',  label: 'Oczekująca',    color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20'  },
  { value: 'viewed',   label: 'Przejrzana',    color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20'      },
  { value: 'accepted', label: 'Zaakceptowana', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20'},
  { value: 'rejected', label: 'Odrzucona',     color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20'        },
]

export default function ApplicationStatusButton({ applicationId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const current = STATUSES.find(s => s.value === status) ?? STATUSES[0]

  async function handleChange(newStatus: string) {
    if (newStatus === status) { setOpen(false); return }
    setLoading(true)
    setOpen(false)
    const result = await updateApplicationStatus(applicationId, newStatus)
    if (!result?.error) {
      setStatus(newStatus)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(prev => !prev)}
        disabled={loading}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${current.bg} ${current.color} ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? '...' : current.label} ▾
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl w-44">
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => handleChange(s.value)}
                className={`w-full px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-zinc-700 ${s.color} ${status === s.value ? 'bg-zinc-700' : ''}`}
              >
                {status === s.value ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
